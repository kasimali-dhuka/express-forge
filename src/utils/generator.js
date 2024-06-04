const fs = require('fs');

const dedent = (str) => {
  const lines = str
    .split('\n')
    .filter((line, index) => index > 0 || line.trim().length > 0);

  const minIndent = lines
    .filter((line) => line.trim())
    .reduce((min, line) => {
      const indent = line.match(/^\s*/)[0].length;
      return Math.min(min, indent);
    }, Infinity);

  return lines
    .map((line) =>
      line.startsWith(' '.repeat(minIndent)) ? line.slice(minIndent) : line
    )
    .join('\n');
};

const generateIndexJsCode = (appType, templateEngine) => {
  let code = `
        require('dotenv').config()

        const express = require('express')
        const path = require('path')
        ${
          templateEngine === 'ejs'
            ? "const expressLayouts = require('express-ejs-layouts')"
            : templateEngine === 'express-handlebars'
              ? "const exphbs = require('express-handlebars')"
              : ''
        } ${
          appType === 'api'
            ? `
        const fileUpload = require('express-fileupload')
        const cors = require('cors')
        `
            : ''
        }
        const { xss } = require('express-xss-sanitizer')
        const { invalidEndpoint, exceptionHandler } = require('./src/middlewares/error.middleware')
        const routes = require('./src/routes')

        const app = express()
        const PORT = process.env.PORT || 3000

        app.use(express.static(path.join(__dirname, 'public')))
    `;

  if (appType === 'web') {
    code += `
        app.set('views', path.join(__dirname, 'src/views'));
        ${
          templateEngine === 'ejs'
            ? "app.use(expressLayouts)\n        app.set('layout', 'layouts/appLayout')"
            : templateEngine === 'express-handlebars'
              ? 'app.engine("handlebars", exphbs.engine({ defaultLayout: "appLayout" }));'
              : ''
        }
        app.set('view engine', '${templateEngine === 'express-handlebars' ? 'handlebars' : templateEngine}');
        `;
  }

  if (appType === 'api') {
    code += `
        app.use(cors({ origin: '*' }))
        app.use(express.json())
        app.use(express.urlencoded({ extended: true }))

        // File upload option
        app.use(fileUpload())
        `;
  }

  code += `
        // Registering API and Admin routes
        app.use(routes)
        // Senatizes all incoming requests
        app.use(xss())
        // Middleware to catch all invalid endpoints
        app.use(invalidEndpoint)
        // Error handler middleware
        app.use(exceptionHandler)
    `;

  code += `
        app.listen(PORT, () => {
            console.log('Server is listening at localhost:'+PORT)
        })
    `;

  return dedent(code);
};

const generateModelIndexJsCode = (database) => {
  let code = `
        'use strict';
        require('dotenv').config()
        const fs = require('fs')
        const path = require('path')
        ${
          database === 'mysql'
            ? `const Sequelize = require('sequelize')
        const process = require('process')`
            : `const mongoose = require('mongoose')`
        }
        const basename = path.basename(__filename)
        ${
          database === 'mysql'
            ? `
        const env = process.env.APP_ENV || 'development'
        const config = require(__dirname + '/../../database/database.js')[env]
        `
            : ''
        }
        const db = {}
        ${
          database === 'mysql'
            ? `
        let sequelize
        if (config.use_env_variable) {
            sequelize = new Sequelize(process.env[config.use_env_variable], config)
        } else {
            sequelize = new Sequelize(config.database, config.username, config.password, config)
        }
        `
            : ''
        }
        
        fs
        .readdirSync(__dirname)
        .filter(file => {
            return (
                file.indexOf('.') !== 0 &&
                file !== basename &&
                file.slice(-3) === '.js' ${database === 'mysql' ? '&& file.indexOf(".test.js") === -1' : ''}
            )
        })
        .forEach(file => {
            const model = require(path.join(__dirname, file))${database === 'mysql' ? '(sequelize, Sequelize.DataTypes)' : ''}
            db[model.${database === 'mysql' ? 'name' : 'modelName'}] = model
        })
        
        ${
          database === 'mysql'
            ? `
        Object.keys(db).forEach(modelName => {
            if (db[modelName].associate) {
                db[modelName].associate(db)
            }
        })

        db.sequelize = sequelize
        db.Sequelize = Sequelize
        `
            : `
        // Connect to the database
        mongoose.set('strictQuery', true);

        const connectMongo = async () => {
            try {
                return mongoose.connect(process.env.DB_CONN_STR +"/" + process.env.DB_NAME)
            } catch (err) {
                console.error('DB Connection Error...!')
            }
        }

        let mongodb = connectMongo()

        db.mongodb = mongodb
        db.mongoose = mongoose
        `
        }
        
        module.exports = db
    
    `;

  return dedent(code);
};

const generateUserModelCode = (database) => {
  let code = '';

  if (database === 'mongoose') {
    code = `
            const mongoose = require('mongoose');
            const { Schema } = mongoose;
            
            const user_schema = new Schema({
                first_name: {
                    type: String
                },
                last_name: {
                    type: String
                },
                profile_pic: {
                    type: String
                },
                username: {
                    type: String
                },
                password: {
                    type: String
                },
                email: {
                    type: String
                },
                phone: {
                    type: String
                }
            }, {
                timestamps: true,
                collection: 'users'
            });
            
            const User = mongoose.model('User', user_schema);
            
            module.exports = User;
        `;
  }

  return dedent(code);
};

const generateProjectFolderStructure = (dirPath, appName, options) => {
  // Create project directory
  fs.mkdirSync(`${dirPath}/${appName}`);
  // Create public directory
  fs.mkdirSync(`${dirPath}/${appName}/public`);
  // Create src directory
  fs.mkdirSync(`${dirPath}/${appName}/src`);

  if (options.appType === 'web') {
    // Create js directory in public
    fs.mkdirSync(`${dirPath}/${appName}/public/js`);
    // Create css directory in public
    fs.mkdirSync(`${dirPath}/${appName}/public/css`);
    // Create assets directory in src
    fs.mkdirSync(`${dirPath}/${appName}/src/assets`);
    // Create views directory in src
    fs.mkdirSync(`${dirPath}/${appName}/src/views`);
    // Create layouts directory in views
    fs.mkdirSync(`${dirPath}/${appName}/src/views/layouts`);
    // Create pages directory in views
    fs.mkdirSync(`${dirPath}/${appName}/src/views/pages`);
    // Create partials directory in views
    fs.mkdirSync(`${dirPath}/${appName}/src/views/partials`);
  }

  // Create model directory and basic models
  if (options?.database === 'mongoose')
    fs.mkdirSync(`${dirPath}/${appName}/src/models`);

  return true;
};

const generateErrorMiddlewareCode = (appType) => {
  let code = `
        const invalidEndpoint = (req, res) => {
            ${
              appType === 'api'
                ? `return res.status(404).json({
                status: false,
                message: 'Invalid Endpoint passed',
                data: {}
            })`
                : `return res.send('Page Not Found');`
            }
        }
        
        const exceptionHandler = (err, req, res, next) => {
            ${
              appType === 'api'
                ? `return res.status(500).json({
                status: false,
                message: err.message,
                data: {}
            })`
                : `return next(err);`
            }
        }
        
        module.exports = {
            invalidEndpoint,
            exceptionHandler
        }
    `;

  return dedent(code);
};

const generateENVcode = (database) => {
  let code = `
        # define APP name
        APP_NAME="expressjs"

        # define the version of our backend application
        APP_VERSION="0.1"
        
        # Define environment
        APP_ENV=development
        
        ${
          database === 'mysql'
            ? `# Database connectiom variables
        DB_CONNECTION=mysql
        DB_HOST=
        DB_USERNAME=
        DB_PASSWORD=
        DB_DATABASE=
        DB_PORT=3306
        `
            : `# Database connection variables
        DB_CONN_STR='mongodb://localhost:27017'
        DB_NAME="expressjs"
        `
        }
        
        # SMTP Mail Credentials
        MAIL_MAILER=smtp
        MAIL_HOST=smtp.gmail.com
        MAIL_PORT=1025
        MAIL_USERNAME=null
        MAIL_PASSWORD=null
        MAIL_ENCRYPTION=null
        MAIL_FROM_ADDRESS="hello@example.com"
        MAIL_FROM_NAME="APP_NAME"
        
        # JWT Token secret
        TOKEN_SECRET=
        
        # Session key
        SESSION_KEY=
        
        # Server PORT number
        PORT=3000
    `;

  return dedent(code);
};

const generategitIgnorecode = () => {
  let code = `
        # Logs
        logs
        *.log
        npm-debug.log*
        yarn-debug.log*
        yarn-error.log*
        lerna-debug.log*
        
        # Diagnostic reports (https://nodejs.org/api/report.html)
        report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json
        
        # Runtime data
        pids
        *.pid
        *.seed
        *.pid.lock
        
        # Directory for instrumented libs generated by jscoverage/JSCover
        lib-cov
        
        # Coverage directory used by tools like istanbul
        coverage
        *.lcov
        
        # nyc test coverage
        .nyc_output
        
        # Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
        .grunt
        
        # Bower dependency directory (https://bower.io/)
        bower_components
        
        # node-waf configuration
        .lock-wscript
        
        # Compiled binary addons (https://nodejs.org/api/addons.html)
        build/Release
        
        # Dependency directories
        node_modules/
        jspm_packages/
        
        # TypeScript v1 declaration files
        typings/
        
        # TypeScript cache
        *.tsbuildinfo
        
        # Optional npm cache directory
        .npm
        
        # Optional eslint cache
        .eslintcache
        
        # Microbundle cache
        .rpt2_cache/
        .rts2_cache_cjs/
        .rts2_cache_es/
        .rts2_cache_umd/
        
        # Optional REPL history
        .node_repl_history
        
        # Output of 'npm pack'
        *.tgz
        
        # Yarn Integrity file
        .yarn-integrity
        
        # dotenv environment variables file
        .env
        .env.test
        .env.development
        .env.production
        
        # parcel-bundler cache (https://parceljs.org/)
        .cache
        
        # Next.js build output
        .next
        
        # Nuxt.js build / generate output
        .nuxt
        dist
        
        # Gatsby files
        .cache/
        # Comment in the public line in if your project uses Gatsby and *not* Next.js
        # https://nextjs.org/blog/next-9-1#public-directory-support
        # public
        
        # vuepress build output
        .vuepress/dist
        
        # Serverless directories
        .serverless/
        
        # FuseBox cache
        .fusebox/
        
        # DynamoDB Local files
        .dynamodb/
        
        # TernJS port file
        .tern-port
        
        package-lock.json
        
        # Add Todo List file
        todo/*
        
        # upload directory
        uploads/*
    `;

  return dedent(code);
};

const generateSequelizeConfigCode = () => {
  let code = `
        require('dotenv').config()
        
        module.exports = {
            development: {
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                dialect: process.env.DB_CONNECTION,
                logging: false
            },
            test: {
                username: process.env.TDB_USERNAME,
                password: process.env.TDB_PASSWORD,
                database: process.env.TDB_DATABASE,
                host: process.env.TDB_HOST,
                port: process.env.TDB_PORT,
                dialect: process.env.TDB_CONNECTION,
                logging: false
            },
            production: {
                username: process.env.PDB_USERNAME,
                password: process.env.PDB_PASSWORD,
                database: process.env.PDB_DATABASE,
                host: process.env.PDB_HOST,
                port: process.env.PDB_PORT,
                dialect: process.env.PDB_CONNECTION
            }
        };
    `;

  return dedent(code);
};

const generateSequelizeSrcCode = () => {
  let code = `
        const path = require('path');
        require('dotenv').config()
        
        module.exports = {
            'config': path.resolve('database', 'database.js'),
            'models-path': path.resolve('src', 'models'),
            'seeders-path': path.resolve('database', 'seeders'),
            'migrations-path': path.resolve('database', 'migrations')
        }
    `;

  return dedent(code);
};

const generateTailwindConfigCode = () => {
  return dedent(`
        /** @type {import('tailwindcss').Config} */
        module.exports = {
            content: ["./src/views/**/*.{html,js,ejs,pug,handlebars}"],
            theme: {
                extend: {
                  animation: {
                    fadeIn: 'fadeIn 2s ease-in-out',
                  },
                  keyframes: {
                    fadeIn: {
                      '0%': { opacity: 0 },
                      '100%': { opacity: 1 },
                    },
                  },
                },
            },
            plugins: [],
        }
    `);
};

const generateInputCssCode = () => {
  return dedent(`
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
    `);
};

const generateLayoutCode = (templateEngine) => {
  let code = '';
  if (!templateEngine || templateEngine === 'none') return false;

  if (templateEngine === 'ejs') {
    code = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="/css/main.css" rel="stylesheet">
                    <title><%= appName %></title>
                </head>
                <body>
                    <div class="body-wrapper bg-[url('/images/bg.jpg')] bg-no-repeat bg-cover bg-center">
                        <%- include('../partials/header') %>
                        <main>
                            <%- body %>
                        </main>
                        <%- include('../partials/footer') %>
                    </div>
                </body>
            </html>
        `;
  }

  if (templateEngine === 'pug') {
    code = `
            doctype html
            html(lang="en")
                head
                    meta(charset="UTF-8")
                    meta(name="viewport" content="width=device-width, initial-scale=1.0")
                    link(href="/css/main.css" rel="stylesheet")
                    title #{appName}
                body
                    div(class="body-wrapper bg-[url('/images/bg.jpg')] bg-no-repeat bg-cover bg-center")
                        include ../partials/header
                        block content
                        include ../partials/footer
        `;
  }

  if (templateEngine === 'express-handlebars') {
    code = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="/css/main.css" rel="stylesheet">
                    <title>{{appName}}</title>
                </head>
                <body>
                    <div class="body-wrapper bg-[url('/images/bg.jpg')] bg-no-repeat bg-cover bg-center">
                    {{{body}}}
                    </div>
                </body>
            </html>
        `;
  }

  return dedent(code);
};

const generateHeaderCode = (templateEngine) => {
  let code = '';

  if (!templateEngine || templateEngine === 'none') return false;
  if (templateEngine === 'ejs') {
    code = `
            <header class="bg-gray-800 p-4 hidden">
                <h1 class="text-white text-center text-2xl"><%= appName %></h1>
            </header>
        `;
  }

  if (templateEngine === 'pug') {
    code = `
            header.bg-gray-800.p-4.hidden
                h1.text-white.text-center.text-2xl #{appName}
        `;
  }

  if (templateEngine === 'express-handlebars') {
    code = `
            <header class="bg-gray-800 p-4 hidden">
                <h1 class="text-white text-center text-2xl">{{appName}}</h1>
            </header>    
        `;
  }

  return dedent(code);
};

const generateFooterCode = (templateEngine) => {
  let code = '';

  if (!templateEngine || templateEngine === 'none') return false;
  if (templateEngine === 'ejs') {
    code = `
            <footer class="bg-gray-800 p-4 mt-4 hidden">
                <p class="text-white text-center">© 2024 <%= appName %></p>
            </footer>
        `;
  }

  if (templateEngine === 'pug') {
    code = `
            footer.bg-gray-800.p-4.mt-4.hidden
                p.text-white.text-center © 2024 #{appName}
        `;
  }

  if (templateEngine === 'express-handlebars') {
    code = `
            <footer class="bg-gray-800 p-4 mt-4 hidden">
                <p class="text-white text-center">© 2024 {{appName}}</p>
            </footer>
        `;
  }

  return dedent(code);
};

const generateWelcomePageCode = (templateEngine) => {
  let code = '';

  if (!templateEngine || templateEngine === 'none') return false;

  if (templateEngine === 'ejs') {
    code = `
        <div class="flex items-center justify-center h-screen flex-col">
            <h1 class="text-5xl mb-20 font-bold text-gray-100 animate-fadeIn">
                Welcome to your Express App
            </h1>
            <div class="text-center bg-slate-300 shadow-sm shadow-slate-200 p-7 rounded-full w-[400px] h-[400px] flex flex-col justify-center items-center">
                <img src="/images/expressjs.png" alt="Express Logo" class="mx-auto max-w-full">
        
                <p class="mt-5 text-center">
                    <span class="text-xl block">
                        Modify as you go.
                    </span>
                    <a href="#" class="underline inline-block mt-3 text-sky-600">Explore More</a>
                </p>
            </div>
        </div>
        `;
  }

  if (templateEngine === 'pug') {
    code = `
            extends ../layouts/appLayout

            block content
                main
                    .flex.items-center.justify-center.h-screen.flex-col
                        h1.text-5xl.mb-20.font-bold.text-gray-100.animate-fadeIn Welcome to your Express App
                        div(class='text-center bg-slate-300 shadow-sm shadow-slate-200 p-7 rounded-full w-[400px] h-[400px] flex flex-col justify-center items-center')
                            img.max-w-full.mx-auto(src="/images/expressjs.png" alt="Express Logo")
                            p.mt-5.text-center
                                span.text-xl.block Modify as you go.
                                a.underline.inline-block.mt-3.text-sky-600(href="#") Explore More
        `;
  }

  if (templateEngine === 'express-handlebars') {
    code = `
            {{> header}}

                <main>
                    <div class="flex items-center justify-center h-screen flex-col">
                        <h1 class="text-5xl mb-20 font-bold text-gray-100 animate-fadeIn">
                            Welcome to your Express App
                        </h1>
                        <div class="text-center bg-slate-300 shadow-sm shadow-slate-200 p-7 rounded-full w-[400px] h-[400px] flex flex-col justify-center items-center">
                            <img src="/images/expressjs.png" alt="Express Logo" class="mx-auto max-w-full">
                    
                            <p class="mt-5 text-center">
                                <span class="text-xl block">
                                    Modify as you go.
                                </span>
                                <a href="#" class="underline inline-block mt-3 text-sky-600">Explore More</a>
                            </p>
                        </div>
                    </div>
                </main>
            
            {{> footer}}        
        `;
  }

  return dedent(code);
};

module.exports = {
  generateIndexJsCode,
  generateModelIndexJsCode,
  generateUserModelCode,
  generateProjectFolderStructure,
  generateErrorMiddlewareCode,
  generateENVcode,
  generateSequelizeConfigCode,
  generateSequelizeSrcCode,
  generategitIgnorecode,
  generateTailwindConfigCode,
  generateInputCssCode,
  generateLayoutCode,
  generateHeaderCode,
  generateFooterCode,
  generateWelcomePageCode,
};
