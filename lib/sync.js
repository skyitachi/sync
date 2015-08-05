var Promise = require("promise");
var fs = require("fs");
var path = require("path");
var upload = require("./upload.js");
var getDiff = require("./getDiff.js");

module.exports = function (option) {
    getDiff()
        .then(function (diffFiles) {
            if (!diffFiles || !diffFiles.length) {
                return Promise.resolve("no file to sync");
            } else {
                return Promise.all(diffFiles.map(function (diff) {
                    var src = diff.filename;
                    return upload(src, path.resolve(option.remoteDir, src), diff.status);
                }));
            }
        })
        .then(function (msg) {
            console.log(msg);
        })
        .catch(function (msg) {
            console.log(msg);
        });
}
