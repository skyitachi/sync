/**
 * Created by skyitachi on 15/7/30.
 */
var http = require("http");
var Promise = require("promise");
var fs = require("fs");
var path = require("path");
var upload = require("./lib/upload.js");
var getDiff = require("./lib/getDiff.js");
var remoteDir = "../sync_remote";

getDiff()
    .then(function (diffFiles) {
        return Promise.all(diffFiles.map(function (src) {
           return upload(src, path.resolve(remoteDir, src));
        }));
    })
    .catch(function (msg) {
        console.log(msg);
    });
