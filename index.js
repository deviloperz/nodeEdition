// nodeEdition

'use strict';

var fs = require('fs');
var mysql = require('mysql');

var dbCondigPath = 'database.json';
var dbConfig;
var connection;

var templates = [];
var folders = [];

fs.exists(dbCondigPath, function() {
  dbConfig = JSON.parse(fs.readFileSync(dbCondigPath, 'utf8'));
  connection = mysql.createConnection(dbConfig);
  getFoldersFromDb();
});

var getFoldersFromDb = function () {

  connection.connect();
  connection.query('SELECT * FROM tbltemplates WHERE IsFolder = 1 ', function(err, rows, fields) {
      if (err) throw err;
      for (var i in rows) {
        folders.push(rows[i])
      }
      createTempalteFolders();
  });
  connection.end();
};


var createTempalteFolders = function () {
  var template, path;

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