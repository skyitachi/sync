#!/usr/bin/env node
process.env.DEBUG = "sync";
var fs = require("fs");
var config = require("./config.json");
if (fs.existsSync("~/.sync/config.json")) {
  config = require("~/.sync/config.json");
}
var program = require("commander");
var pkg = require("./package.json");
var sync = require("./lib/sync.js");
var update = require("./lib/update.js");

program
  .version(pkg.version)
  .usage("<options>")
  .option("-r, --remote <value>", "远程目录")
  .option("-u, --update", "更新远程目录")
  .option("-b, --beforeCommit", "同步未提交的内容")
  .parse(process.argv);

//global variables

var remoteDir = program.remote || config.remoteDir;
if (program.update) {
  update({
    remoteDir: remoteDir
  });
} else {
  sync({
    remoteDir: remoteDir,
    beforeCommit: program.beforeCommit
  });
}
