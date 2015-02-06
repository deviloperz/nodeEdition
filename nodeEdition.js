// nodeEdition

'use strict';

var fs = require('fs');
var mysql = require('mysql');
var chalk = require('chalk');
var inquirer = require("inquirer");

var dbCondigPath = 'database.json';
var dbConfig = {};
var connection;

var templates = [];
var folders = [];


fs.exists(dbCondigPath, function (exists) {

  if (exists) {
    fs.readFile(dbCondigPath,{encoding:'utf8'},  function (err, data) {
      dbConfig = JSON.parse(data);
      startApp();
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
        startApp();
      });
    });
  }
});

var startApp = function () {
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

var getFoldersFromDb = function () {
  connection = mysql.createConnection(dbConfig);
  connection.connect();
  connection.query('SELECT * FROM tbltemplates WHERE IsFolder = 1 ', function(err, rows, fields) {
      if (err) {
        throw err;
      }
      for (var i in rows) {
        folders.push(rows[i]);
      }
      createTempalteFolders();
  });
  connection.end();
};

var createTempalteFolders = function () {
  if(!fs.existsSync('app')) {
    fs.mkdirSync('app');
  }

  for(var i in folders) {
    if(!fs.existsSync('app' + folders[i].Path)) {
      fs.mkdirSync('app' + folders[i].Path);
    }
  }

  createTempalteFiles();
};

var createTempalteFiles = function () {
  connection = mysql.createConnection(dbConfig);
  connection.connect();
  connection.query('SELECT * FROM tbltemplates WHERE IsFolder = 0 ', function(err, rows, fields) {
      if (err) throw err;
      for (var i in rows) {
        templates.push(rows[i])
        if (!fs.existsSync('app' + rows[i].Path)) {
          fs.writeFileSync('app' + rows[i].Path, '');
        }
      }
  });
  connection.end();
};