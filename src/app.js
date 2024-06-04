const fs = require('fs/promises');
const fsSync = require('fs');
const {
  generateIndexJsCode,
  generateUserModelCode,
  generateSequelizeSrcCode,
  generateModelIndexJsCode,
  generateErrorMiddlewareCode,
  generateENVcode,
  generategitIgnorecode,
  generateSequelizeConfigCode,
  generateTailwindConfigCode,
  generateInputCssCode,
  generateHeaderCode,
  generateFooterCode,
  generateWelcomePageCode,
  generateLayoutCode,
} = require('./utils/generator');

const createIndexFile = async (path, appType, templateEngine) => {
  try {
    const indexJsCode = generateIndexJsCode(appType, templateEngine);
    await fs.writeFile(path + '/index.js', indexJsCode);
  } catch (error) {
    console.error('Error creating index file:', error);
  }
};

const createModelIndexFile = async (path, database) => {
  try {
    if (database !== 'mongoose') return false;

    const modelIndexJsCode = generateModelIndexJsCode(database);
    await fs.writeFile(`${path}/src/models/index.js`, modelIndexJsCode);
  } catch (error) {
    console.error('Error creating index model file:', error);
  }
};

const createUserModelFile = async (path, database) => {
  try {
    if (database !== 'mongoose') return false;

    const modelIndexJsCode = generateUserModelCode(database);
    await fs.writeFile(`${path}/src/models/user.js`, modelIndexJsCode);
  } catch (error) {
    console.error('Error creating user model file:', error);
  }
};

const createErrorMiddlewareFile = async (path, appType) => {
  try {
    const errorMiddlewareCode = generateErrorMiddlewareCode(appType);
    await fs.writeFile(
      `${path}/src/middlewares/error.middleware.js`,
      errorMiddlewareCode
    );
  } catch (error) {
    console.error('Error creating error middleware file:', error);
  }
};

const createENVandGitIgnorefile = async (path, database) => {
  try {
    const envCode = generateENVcode(database);
    const gitIgnoreCode = generategitIgnorecode();
    await fs.writeFile(`${path}/.env`, envCode);
    await fs.writeFile(`${path}/.env.example`, envCode);
    await fs.writeFile(`${path}/.gitignore`, gitIgnoreCode);
  } catch (error) {
    console.error('Error while creating env and gitignore file:', error);
  }
};

const createDatabaseJsConfigFile = async (path, database) => {
  try {
    if (database !== 'mysql') return false;

    let databaseConfigCode = generateSequelizeConfigCode();
    await fs.writeFile(`${path}/database/database.js`, databaseConfigCode);
  } catch (error) {
    console.error('Error while creating Database config file : ', error);
  }
};

const createSequelizesrcFile = async (path, database) => {
  try {
    if (database !== 'mysql') return false;

    let sequelizeSrcCode = generateSequelizeSrcCode();
    await fs.writeFile(`${path}/.sequelizerc`, sequelizeSrcCode);
  } catch (error) {
    console.error('Error while creating sequelizerc config file : ', error);
  }
};

const createTailwindConfigAndInputCssFile = async (
  path,
  appType,
  templateEngine
) => {
  try {
    if (appType === 'api' || templateEngine === 'none') return false;

    let tailwindConfigCode = generateTailwindConfigCode();
    let inputCssCode = generateInputCssCode();
    fsSync.mkdirSync(`${path}/src/assets/css`);
    await fs.writeFile(`${path}/tailwind.config.js`, tailwindConfigCode);
    await fs.writeFile(`${path}/src/assets/css/input.css`, inputCssCode);
  } catch (error) {
    console.error('Error while creating Tailwindcss config file : ', error);
  }
};

const createViewFiles = async (path, appType, templateEngine) => {
  try {
    if (appType === 'api' || templateEngine === 'none') return false;

    let ext =
      templateEngine === 'express-handlebars'
        ? 'handlebars'
        : templateEngine.toLowerCase();
    let layoutCode = generateLayoutCode(templateEngine);
    let headerCode = generateHeaderCode(templateEngine);
    let footerCode = generateFooterCode(templateEngine);
    let welcomeCode = generateWelcomePageCode(templateEngine);

    await fs.writeFile(
      `${path}/src/views/layouts/appLayout.${ext}`,
      layoutCode
    );
    await fs.writeFile(`${path}/src/views/partials/header.${ext}`, headerCode);
    await fs.writeFile(`${path}/src/views/partials/footer.${ext}`, footerCode);
    await fs.writeFile(`${path}/src/views/pages/welcome.${ext}`, welcomeCode);
  } catch (error) {
    console.error('Error while creating view files : ', error);
  }
};

module.exports = {
  createIndexFile,
  createModelIndexFile,
  createUserModelFile,
  createErrorMiddlewareFile,
  createENVandGitIgnorefile,
  createDatabaseJsConfigFile,
  createSequelizesrcFile,
  createTailwindConfigAndInputCssFile,
  createViewFiles,
};
