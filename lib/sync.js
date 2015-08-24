var Promise = require("promise");
var fs = require("fs");
var path = require("path");
var upload = require("./upload.js");
var getDiff = require("./getDiff.js");
var chalk = require("chalk");
var util = require("util");
var table = require("text-table");
var config = require("../config");
var debug = require("debug")("sync");

module.exports = function (option) {
  console.log("\n" + chalk.underline(option.remoteDir) + " on " + config.hostname + " : \n");
    getDiff()
        .then(function (diffFiles) {
            if (!diffFiles || !diffFiles.length) {
                return Promise.reject("no file to sync");
            } else {
                return Promise.all(diffFiles.map(function (diff) {
                    var src = diff.filename;
                    return upload(src, path.resolve(option.remoteDir, src), diff.status).then(JSON.parse);
                }));
            }
        })
        .then(function (files) {
          var rows = files.reduce(function (rows, file) {
            if (file.status) {
                rows.push([chalk.green("\u2714  "), file.file, chalk.green("upload ok")]);
            } else {
                rows.push([chalk.red("\u2716  "), file.file, chalk.red(file.msg)]);
            }
            return rows;
          }, []);
          console.log(table(rows) + "\n");
        })
        .catch(function (msg) {
            console.log(chalk.red(msg));
        });
};
