'use strict';

var fs = require('fs');
var chalk = require('chalk');
var inquirer = require("inquirer");
var projectSetup = require('./utils/project-setup');


var startApp,
    dbConfig,
    dbCondigPath = 'database.json',
    project = new projectSetup();

fs.exists(dbCondigPath, function (exists) {

  if (exists) {
    fs.readFile(dbCondigPath,{encoding:'utf8'},  function (err, data) {
      dbConfig = JSON.parse(data);
      project.init(dbConfig, startApp);
    });
  } else {
    console.log(chalk.blue('Hi! Welcome to nodeEdtion!\n'));

    console.log('I can see your are new. Please answer some questions to setup your project');
    console.log(chalk.bold('First the database settings:\n'));

    inquirer.prompt([{
      name: 'hostname',
      message: "Whats the host of your database?"
    },{
      name: 'database',
      message: "Whats the name of the database?"
    },{
      name: 'user',
      message: "Thanks, now please tell me your username:"
    },{
      name: 'password',
      type: 'password',
      message: "And the last question. Your password?"
    }], function (answer) {
      dbConfig = answer;
      fs.writeFile(dbCondigPath, function () {
        console.log(chalk.green('Yiha! We configured your project succesfully!'));
        project.init(dbConfig, function () {
          startApp();
        });
      });
    });
  }
});

startApp = function () {
  inquirer.prompt([{
    name: 'whatNow',
    type: 'list',
    message: 'What would you like to do now?',
    choices: [
      {name: 'Run the Project', value: 'run'},
      {name: 'Configure your Project', value: 'configure'},
      {name: 'Nothing..', value: 'nothing'},
      new inquirer.Separator()
    ]
  }], function (answer) {

    if (answer.whatNow === 'run') {
      console.log('run');
    }

    if (answer.whatNow === 'configure') {
      console.log('configure');
    }

    if (answer.whatNow === 'nothing') {
      return;
    }
  });
};

