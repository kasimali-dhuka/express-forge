const inquirer = require('inquirer');
const shell = require('shelljs');
const chalk = require('chalk');
const { generateProjectFolderStructure } = require('./src/utils/generator');
const {
  createModelIndexFile,
  createUserModelFile,
  createErrorMiddlewareFile,
  createIndexFile,
  createDatabaseJsConfigFile,
  createSequelizesrcFile,
  createENVandGitIgnorefile,
  createTailwindConfigAndInputCssFile,
  createViewFiles,
  createSocketFile,
  createPrettierConfigFile
} = require('./src/app');
const { copyFiles, installDependencies } = require('./src/utils/helper');
const { updatePackageJson } = require('./src/utils/setup-script');
const source = __dirname;

const buildExpressSkeleton = async (appName, path, options) => {
  const appPath = `${process.cwd()}/${appName}`;
  let dependencies = 'express express-xss-sanitizer dotenv moment';
  let devDependencies = 'nodemon prettier';

  // Questions to create express project
  const questions = [];

  if (!options?.db || !['mongodb', 'mysql'].includes(options.db)) {
    questions.push({
      type: 'list',
      name: 'database',
      message: 'Which database do you want to use?',
      choices: [
        { name: 'MongoDB (mongoose)', value: 'mongoose' },
        { name: 'MySQL (sequelize)', value: 'mysql' },
        { name: 'None', value: 'none' }
      ]
    });
  }

  if (!options?.appType || !['web', 'api', 'both'].includes(options.appType)) {
    questions.push({
      type: 'list',
      name: 'appType',
      message: 'What type of application do you want to create?',
      choices: [
        { name: 'API', value: 'api' },
        { name: 'Web', value: 'web' },
        { name: 'Both (Web + API)', value: 'both' }
      ]
    });
  }

  if (
    !options?.socket ||
    !['socket.io', 'websocket'].includes(options.socket)
  ) {
    questions.push({
      type: 'list',
      name: 'socket',
      message: 'Do you need socket implementation?',
      choices: [
        { name: 'No', value: 'no' },
        { name: 'Socket.IO', value: 'socket.io' },
        { name: 'WebSocket', value: 'websocket' }
      ]
    });
  }

  if (
    (options?.appType &&
      (options.appType === 'web' || options.appType === 'both') &&
      !['ejs', 'pug'].includes(options.templateEngine)) ||
    (!options?.appType && !options?.templateEngine)
  ) {
    questions.push({
      type: 'list',
      name: 'templateEngine',
      message: 'Which template engine do you want to use?',
      choices: [
        { name: 'EJS', value: 'ejs' },
        { name: 'Pug', value: 'pug' },
        { name: 'Handlebars', value: 'express-handlebars' },
        { name: 'None', value: 'none' }
      ],
      when: (answers) =>
        answers.appType === 'web' ||
        answers.appType === 'both' ||
        options.appType === 'web' ||
        options.appType === 'both'
    });
  }

  const answers = { ...options, ...(await inquirer.prompt(questions)) };

  // Process the answers
  console.log(
    '\n## ' +
      chalk.bold.yellow('Creating project: ') +
      chalk.white.blueBright.bold.italic.underline(appName) +
      ' ##'
  );

  // Create folder structure for project
  generateProjectFolderStructure(path, appName, answers);
  console.log('   * ' + chalk.green('Project directory created'));

  console.log(
    '\n## ' + chalk.yellow('Generating package.json file .....') + ' ##'
  );
  process.chdir(`${path}/${appName}`);
  shell.exec(`npm init -y`, { silent: true });

  // Insert custom scripts into package.json file
  let updatedPackageJson = await updatePackageJson(appPath, answers.appType);
  console.log(updatedPackageJson);

  if (answers.appType !== 'web') dependencies += ' express-fileupload cors';
  if (
    answers.appType !== 'api' &&
    ['ejs', 'pug', 'express-handlebars'].includes(answers.templateEngine)
  ) {
    dependencies += ' ' + answers.templateEngine;
    devDependencies += ' tailwindcss';

    if (answers.templateEngine === 'ejs')
      dependencies += ' express-ejs-layouts';
  }
  if (answers.database === 'mysql') dependencies += ' sequelize mysql2';
  if (answers.database === 'mongoose') dependencies += ' mongoose';
  if (answers.socket !== 'no') {
    dependencies += answers.socket === 'websocket' ? ' ws' : ' ' + answers.socket
  }

  // Install all the dependencies
  console.log('\n## ' + chalk.yellow('Installing dependencies ....'));
  shell.exec(`npm i -D ${devDependencies}`, { silent: true });
  await installDependencies(dependencies);
  console.log(
    `\n${chalk.dim('###########################')}\n${chalk.dim('#')} ${chalk.bold.italic.yellowBright('Installed dependecies')}: ${chalk.dim('#')}\n${chalk.dim('###########################')}`
  );
  console.log(
    chalk.blueBright(`  * ${dependencies.split(' ').join('\n  * ')} \n`)
  );

  // Copy prewritten content from source
  await copyFiles(`${source}/src/source`, `${appPath}/src`);
  // Copy images
  await copyFiles(`${source}/src/assets/images`, `${appPath}/public/images`);
  // Create Index file based on application type
  await createIndexFile(
    appPath,
    answers.appType,
    answers.templateEngine,
    answers.socket
  );
  // Create Socket file based on socket choice
  await createSocketFile(appPath, answers.socket);
  // Create sequelizesrc file to update the configurations
  await createSequelizesrcFile(appPath, answers.database);
  // Create model index file if any database choosen
  await createModelIndexFile(appPath, answers.database);
  // Create user model file if any database choosen
  await createUserModelFile(appPath, answers.database);
  // Create Error middleware file for invalid request or invalid endpoint
  await createErrorMiddlewareFile(appPath, answers.appType);
  // Create env and env.example file
  await createENVandGitIgnorefile(appPath, answers.database);
  // Create a welcome page with partial components
  await createViewFiles(appPath, answers.appType, answers.templateEngine);
  // Create prettier config file to format and beautify code
  await createPrettierConfigFile(appPath)
  // Create tailwindcss config and main.css file if app type is web and template engine is selected
  await createTailwindConfigAndInputCssFile(
    appPath,
    answers.appType,
    answers.templateEngine
  );

  // Initialize sequelize ORM
  if (answers.database === 'mysql') {
    const sequelizeAnswer = await inquirer.prompt({
      type: 'list',
      name: 'iSequelize',
      message:
        'For MySQL, sequelize-cli needs to be installed globally. Are you okay with it?',
      choices: ['yes', 'no']
    });

    if (sequelizeAnswer.iSequelize === 'yes') {
      shell.exec(`npm i -g sequelize-cli`, { silent: true });
      shell.exec(`npx sequelize init`, { silent: true });

      await createDatabaseJsConfigFile(appPath, answers.database);
      // Create a users model, migration and seeder
      shell.exec(
        `npx sequelize model:create --name user --attributes first_name:string,last_name:string,profile_pic:string,username:string,password:string,email:string,phone:string`,
        { silent: true }
      );
      shell.exec(`npx sequelize seed:create --name user`, { silent: true });
    }
  }

  console.log('\n## ' + chalk.yellow(chalk.italic('Initializing git...')));
  shell.exec(`git init`);

  console.log(
    `\n${chalk.dim('###########################')}\n${chalk.dim('#')} ${chalk.bold.italic.greenBright('Project Setup Complete')}: ${chalk.dim('#')}\n${chalk.dim('###########################')}`
  );
  console.log(`└── ${chalk.italic.bold(appName)}
    ├── ${chalk.italic.bold('public')}
    ${
      answers.appType !== 'api'
        ? `|   ├── ${chalk.italic.bold('images')}
    |   ├── ${chalk.italic.bold('js')}
    |   └── ${chalk.italic.bold('css')}`
        : `|   └── ${chalk.italic.bold('images')}`
    }
    ${
      answers.database === 'mysql'
        ? `|
    ├── ${chalk.italic.bold('database')}
    |   ├── ${chalk.italic.bold('migrations')}
    |   ├── ${chalk.italic.bold('seeders')}
    |   └── database.js
    |`
        : `|`
    }
    ${
      answers.appType === 'api'
        ? `├── ${chalk.italic.bold('src')}`
        : `├── ${chalk.italic.bold('src')}
    |   ├── ${chalk.italic.bold('assets')}
    |   |   └── ${chalk.italic.bold('css')}
    |   |
    |   ├── ${chalk.italic.bold('views')}
    |   |   ├── ${chalk.italic.bold('layouts')}
    |   |   ├── ${chalk.italic.bold('pages')}
    |   |   └── ${chalk.italic.bold('partials')}
    |   |`
    }
    |   ├── ${chalk.italic.bold('middlewares')}
    |   |   ├── auth.middleware.js
    |   |   └── error.middleware.js
    |   |
    |   ├── ${chalk.italic.bold('controllers')}
    |   |   ├── dashboard.controllers.js
    |   |   ├── auth.controllers.js
    |   |   └── user.controllers.js
    ${
      answers.database !== 'none'
        ? `|   |
    |   ├── ${chalk.italic.bold('models')}
    |   |    ├── index.js
    |   |    └── user.js
    |   |`
        : `|   |`
    }
    |   └── ${chalk.italic.bold('routes')}
    |       ├── index.js
    |       ├── api.routes.js
    |       └── web.routes.js
    |
    ├── index.js ${answers.socket !== 'no' ? '\n    ├── socket.js' : ''} ${answers.templateEngine !== 'none' ? '\n    ├── tailwind.config.js' : ''}
    ├── package.json ${answers.database === 'mysql' ? '\n    ├── .sequelizerc' : ''}
    ├── .prettierrc.json
    ├── .env.example
    ├── .gitignore
    └── ${chalk.italic.bold('.git')}
  `);

  if (answers.appType !== 'api')
    shell.exec(
      'npx tailwindcss -i ./src/assets/css/input.css -o ./public/css/main.css',
      { silent: true }
    );

  shell.exec('npm run prettier', { silent: true })
  console.log(
    `\n${chalk.bold.red('RUN')}: \n  ${chalk.greenBright.bold(`cd ${appName}`)}\n  && ${chalk.greenBright.bold(`npm run dev`)}          // To start dev server${answers.appType !== 'api' ? `\n  && ${chalk.greenBright.bold('npm run watch')}        // To start tailwindcss compiler` : ''}\n  && ${chalk.greenBright.bold('npm run prettier')}     // To format and beautify your document`
  );
  console.log(`\n${chalk.blueBright.bold('!! HAPPY CODING !!')} \n`);
};

module.exports = buildExpressSkeleton;
