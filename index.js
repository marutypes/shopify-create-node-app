#!/usr/bin/env node
const path = require('path');
const promisify = require('util').promisify;

const handlebars = require('handlebars')
const {copy} = require('fs-extra');
const {render} = require('handlebars-dir-render');

const exec = promisify(require('exec-sh'));
const yargs = require('yargs');
const chalk = require('chalk');
const inquirer = require('inquirer');

const referToDocs = `
ℹ️  If you don't know any of your apps credentials, check out the first two steps of the official documentation:
${chalk.green('https://help.shopify.com/api/tutorials/building-node-app#step-1-expose-your-local-development-environment-to-the-internet')}
`;

yargs.usage('Usage: $0 [path]')
  .command('$0', `Generates your embedded app scaffold. ${referToDocs}`)
  .help('h')
  .alias('h help')

const {argv} = yargs;

const targetPath = argv['_'][0] || '.';

console.log(`🚀 Creating a new ${chalk.magenta('Shopify')} embedded app in ${targetPath}`);
console.log(referToDocs);
inquirer.prompt([
  {
    name: 'name',
    message: `What's your app's ${chalk.cyan('name')}?`,
    default: 'node-app',
  },
  {
    name: 'host',
    message: `What ${chalk.cyan('App URL')} do you want your app to use?`,
    validate: required,
  },
  {
    name: 'port',
    message: `What ${chalk.cyan('port')} would you like to run on?`,
    default: 3000,
  },
  {
    name: 'apiKey',
    message: `What's your app's ${chalk.cyan('api key')}?`,
    validate: required,
  },
  {
    name: 'secret',
    message: `What's your app's ${chalk.cyan('secret')}? Don't worry we won't tell anyone.`,
    validate: required,
  },
]).then(async (answers) => {
  const {host} = answers
  if(host.slice(-1) === '/') {
    answers.host = host.slice(0, -1);
  }

  const templatesDirectory = path.join(__dirname, 'templates', 'express');
  const targetDirectory = path.join(process.cwd(), targetPath);

  try {
    const renderPromises = await render(templatesDirectory, targetDirectory, answers, ({path: filePath}) => {
      const renderable = filePath.indexOf(`${templatesDirectory}/client`) == -1;
      if (renderable) {
        console.log(`Attempting to create file ${chalk.cyan(filePath.replace(templatesDirectory, targetDirectory))}`);
        return true;
      }
    }, {handlebars});

    const renderResults = await Promise.all(renderPromises);

    renderResults.forEach((filePath) => {
      console.log(`Succeeded creating file ${chalk.green(filePath)}`);
    });

    // copy client directory without templating
    const successfulFiles = [];
    await copy(
      path.join(templatesDirectory, 'client'),
      path.join(targetDirectory, 'client'),
      {
        filter(_, filePath) {
          if (filePath) {
            console.log(`Attempting to create file ${chalk.cyan(filePath)}`);
            successfulFiles.push(filePath);
          }
          return true
        }
      }
    );

    successfulFiles.forEach((filePath) => {
      console.log(`Succeeded creating file ${chalk.green(filePath)}`);
    });

    await exec('yarn install', { cwd: targetDirectory });
    await exec(`open ${answers.host}/install`)

  } catch (err) {
    console.error(chalk.red(err))
  }
});

function required(input) {
  if (input != null && input.length > 0) {
    return true;
  }
  return `We need this to work! Please input a value. ${referToDocs}`;
}
