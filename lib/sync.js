var Promise = require("promise");
var fs = require("fs");
var path = require("path");
var upload = require("./upload.js");
var getDiff = require("./getDiff.js");
var chalk = require("chalk");
var util = require("util");

module.exports = function (option) {
    getDiff()
        .then(function (diffFiles) {
            if (!diffFiles || !diffFiles.length) {
                return Promise.reject("no file to sync");
            } else {
                return Promise.all(diffFiles.map(function (diff) {
                    var src = diff.filename;
                    return upload(src, path.resolve(option.remoteDir, src), diff.status)
                      .then(function (res) {
                        var ret = JSON.parse(res);
                        if (ret.status) {
                          console.log(src + " " + chalk.green("ok"));
                        } else {
                          console.log(src + " " + chalk.red(ret.msg));
                        }
                      });
                }));
            }
        })
        .catch(function (msg) {
            console.log(chalk.red(msg));
        });
};
