#!/usr/bin/env node

const createExpressSkeleton = require('../index.js');
const process = require('process');
const minimist = require('minimist');
const { version } = require('../package.json');
// check passed arguments
const args = minimist(process.argv.slice(2));
const projectName = args._[0];
const db = args.db;
const appType = args.app;
const templateEngine =
  args.template && args.template === 'handlebars'
    ? 'express-handlebars'
    : args.template;

// Valid options for db and app
const validDbOptions = ['mysql', 'mongoose'];
const validAppOptions = ['web', 'api'];
const validTemplateOptions = ['ejs', 'pug', 'handlebars', 'express-handlebars'];

// Function to display help information
const displayHelp = (projectName) => {
  console.log(`
Express Forge App (version: ${version})

Usage: express-forge <project-name> [options]

Options:
  --version, -v     Show version number
  --help, -h        Show help information
  --db              Specify the database to use (choices: mysql, mongoose)
  --app             Specify the app type (choices: web, api)
  --template        Specify the template engine to use (choices: ejs, pug, handlebars)

Example:
  express-forge <project-name> --db=mongoose --app=web --template=ejs
${!projectName && !(args.h || args.help) ? '\nPlease specify a valid command\n' : ''}`);
};

if (args.version || args.v) {
  console.log(`express-forge version ${version}`);
  process.exit(0);
}

if (args.help || args.h || !projectName) {
  displayHelp(projectName);
  process.exit(0);
}

// Validate db option
if (db && !validDbOptions.includes(db)) {
  console.error(`Invalid db option. Choose either 'mysql' or 'mongoose'.`);
  displayHelp();
  process.exit(1);
}

// Validate app option
if (appType && !validAppOptions.includes(appType)) {
  console.error(`Invalid app option. Choose either 'web' or 'api'.`);
  displayHelp();
  process.exit(1);
}

// Validate app option
if (templateEngine && !validAppOptions.includes(templateEngine)) {
  console.error(
    `Invalid app option. Choose either 'ejs', 'pug' or 'handlebars'.`
  );
  displayHelp();
  process.exit(1);
}

//get path of directory where the script was called
const callerPath = process.cwd();

createExpressSkeleton(projectName, callerPath, { db, appType, templateEngine });
