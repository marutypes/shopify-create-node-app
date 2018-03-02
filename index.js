#!/usr/bin/env node
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

const path = argv['_'][0] || '.';

console.log(`🚀 Creating a new ${chalk.magenta('Shopify')} embedded app in ${path}`);
console.log(referToDocs);
inquirer.prompt([
  {
    name: 'name',
    message: `What's your app's ${chalk.cyan('name')}?`,
    default: 'node-app',
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
  {
    name: 'host',
    message: `What ${chalk.cyan('hostname')} do you want your app to use?`,
    validate: required,
  },
  {
    name: 'port',
    message: `What ${chalk.cyan('port')} would you like to run on?`,
    default: 3000,
  },
]).then((answers) => {
  Object.entries(answers).map(([name, answer]) => {
    console.log(name, ':', answer);
  });
});

function required(input) {
  if (input != null && input.length > 0) {
    return true;
  }
  return `We need this to work! Please input a value. ${referToDocs}`;
}
