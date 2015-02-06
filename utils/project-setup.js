'use strict';
var fs = require('fs');
var mysql = require('mysql');

var setupProject = function () {

  var dbConfig = {};
  var connection;
  
  var folders = [];

  var init, getFoldersFromDb, createTempalteFolders, createTempalteFiles, save;

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
    var _callback = callback, getDataId, writeFiles, getData;
    var templates = [];
    var contentIds = [];
    var counter = 0;

    connection = mysql.createConnection(dbConfig);
    connection.connect();
    connection.query('SELECT * FROM tbltemplates WHERE IsFolder = 0 ', function(err, rows, fields) {
        if (err) {
          throw err;
        }

        for (var i in rows) {
          templates.push(rows[i]);
        }
        getDataId();
    });

    getDataId = function () {
      var templateId = templates[counter].ID, 
      query = 'SELECT CID FROM tbllink WHERE DID = ' + templateId + ' AND Name = "data" AND DocumentTable = "tblTemplates"';

      connection.query(query, function(err, rows, fields) {
        contentIds.push(rows[0].CID);
        if (counter < templates.length - 1) {
          counter++;
          getDataId();
        } else {
          console.log(contentIds);
          counter = 0;
          getData();
        }
      });
    };
    
    getData = function () {

      var contentId = contentIds[counter],
          query = 'SELECT Dat FROM tblcontent WHERE ID = ' + contentId;

      connection.query(query, function(err, rows, fields) {

        templates[counter].data = rows[0].Dat;
        if (counter < templates.length - 1) {
          counter++;
          getData();
        } else {
          connection.end();
          writeFiles();
        }
      });
    };

    writeFiles = function () {
      for (var i in templates) {
        if (!fs.existsSync('app' + templates[i].Path)) {
          fs.writeFileSync('app' + templates[i].Path, templates[i].data);
        }
      }
      _callback();
    };
  };

  save = function () {

  };

  return {
    init: init
  };
};

module.exports = setupProject;