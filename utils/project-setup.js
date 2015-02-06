'use strict';
var fs = require('fs');
var mysql = require('mysql');

var setupProject = function () {

  var dbConfig = {};
  var connection;
  
  var templates = [];
  var folders = [];

  var init, getFoldersFromDb, createTempalteFolders, createTempalteFiles;

  init = function (config, callback) {
    var _callback = callback;
    dbConfig = config;
    getFoldersFromDb(_callback);
  };

  getFoldersFromDb = function (callback) {
    var _callback = callback;
    connection = mysql.createConnection(dbConfig);
    connection.connect();
    connection.query('SELECT * FROM tbltemplates WHERE IsFolder = 1 ', function(err, rows, fields) {
        if (err) {
          throw err;
        }
        for (var i in rows) {
          folders.push(rows[i]);
        }
        createTempalteFolders(_callback);
    });
    connection.end();
  };

  createTempalteFolders = function (callback) {
    var _callback = callback;
    if(!fs.existsSync('app')) {
      fs.mkdirSync('app');
    }

    for(var i in folders) {
      if(!fs.existsSync('app' + folders[i].Path)) {
        fs.mkdirSync('app' + folders[i].Path);
      }
    }

    createTempalteFiles(_callback);
  };

  createTempalteFiles = function (callback) {
    var _callback = callback;
    connection = mysql.createConnection(dbConfig);
    connection.connect();
    connection.query('SELECT * FROM tbltemplates WHERE IsFolder = 0 ', function(err, rows, fields) {
        if (err) {
          throw err;
        }

        for (var i in rows) {
          templates.push(rows[i]);
          if (!fs.existsSync('app' + rows[i].Path)) {
            fs.writeFileSync('app' + rows[i].Path, '');
          }
        }
        _callback();
    });
    connection.end();

  };

  return {
    init: init
  };
};

module.exports = setupProject;