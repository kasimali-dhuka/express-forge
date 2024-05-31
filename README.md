# EXPRESS-FORGE

## Introduction

`express-forge` is an open-source npm package designed to streamline the process of setting up an Express.js project. It allows developers to quickly create a project skeleton with configurable options for application type, database and template engine.

Whether you're building a web application or an API, express-forge provides a solid foundation to get you started swiftly and efficiently.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Server setup](#server-setup)
- [Folder Structure](#folder-structure)
- [FAQs](#faqs)
- [Authors](#authors)

## Requirements

Node v7.6.0 or higher for ES2015 and async function support.

## Installation

To make the package available in the shell as standalone command, it requires a global installation:

```bash
npm install -g express-forge
```

## Usage

The commands installs the required folder skeleton along with package.json, dependencies and an empty git repository.

#### Command to create an Express project:

```bash
express-forge <project_name>

Options:
    --version, -v     Show version number
    --help, -h        Show help information
    --db              Specify the database to use (choices: mysql, mongoose)                [string]
    --app             Specify the app type (choices: web, api)                              [string]
    --template        Specify the template engine to use (choices: ejs, pug, handlebars)    [string]
```

### Examples:

Create a web application with MySQL as Database and Pug as template engine:

```bash
express-forge my-web-app --db=mysql --app=web --template=pug
```

Create an API with Mongoose as database:

```bash
express-forge my-api --db=mongoose --app=api
```

## Server setup:

To start the server, from the server directory, run:

```bash
npm run dev
```
OR
```bash
npm run start
```

### Folder Structure

The express-forge generates the following folder structure:

> Your folder structure depends on your application type

```bash
└── PROJECT_DIRECTORY_NAME
    ├── public
    |   ├── images
    |   ├── js
    |   └── css
    |
    ├── src
    |   ├── assets
    |   |   └── css
    |   |
    |   ├── views
    |   |   ├── layouts
    |   |   ├── pages
    |   |   └── partials
    |   |
    |   ├── middlewares
    |   |   ├── auth.middleware.js
    |   |   └── error.middleware.js
    |   |
    |   ├── controllers
    |   |   ├── dashboard.controllers.js
    |   |   ├── auth.controllers.js
    |   |   └── user.controllers.js
    |   |
    |   ├── models
    |   |    ├── index.js
    |   |    └── user.js
    |   |
    |   └── routes
    |       ├── index.js
    |       ├── api.routes.js
    |       └── web.routes.js
    |
    ├── index.js
    ├── tailwind.config.js
    ├── package.json
    ├── .sequelizerc
    ├── .env.example
    ├── .gitignore
    └── .git
```

## Authors

- [Kasimali Dhuka](https://github.com/kasimali-dhuka)

## FAQs

#### 1. What is express-forge?

`express-forge` is an npm package that helps you quickly set up a new Express.js project with configurable options for application type, database, and template engine.

#### 2. How do I install express-forge?

You can install express-forge globally using npm:

```bash
npm install -g express-forge
```

#### 3. How do I update express-forge?

You can update express-forge globally using npm:

```bash
npm update -g express-forge
```

#### 4. What are the system requirements?

Node.js v7.6.0 or higher is required to use express-forge.

#### 5. How do I create a new project?

Use the following command to create a new project:

```bash
express-forge <project_name> --db=<database> --app=<app_type> --template=<template_engine>
```

Replace <project-name>, <database>, <app_type>, and <template_engine> with your desired values.

#### 6. What databases are supported?

Currently, express-forge supports mysql and mongoose.

#### 7. What application types can I create?

You can create two types of applications: web and api.

#### 8. What template engines are supported?

Currently, express-forge supports ejs, pug, and express-handlebars.

#### 9. How do I start the server?

Navigate to the project directory and run:

```bash
npm run dev
```
OR
```bash
npm run start
```

#### 10. How do I start the tailwindcss compiler?

```express-forge``` is already installed with tailwindcss and also initialized. We have already added the compiler command in the package.json file. You can start the tailwindcss compiler by navigating to the project directory and run:

```bash
npm run watch
```

#### 11. Can I contribute to express-forge?

Yes, contributions are welcome! Please read the contributing guidelines (add a link to your contributing guidelines if available).

#### 12. Where can I report issues or suggest features?

You can report issues or suggest features on the GitHub Issues page.

#### 13. How do I update express-forge?

To update to the latest version, run:

```bash
npm update -g express-forge
```

## License

[MIT License](LICENSE)
