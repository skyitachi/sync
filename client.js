#!/usr/bin/env node
// test
// process.env.DEBUG = "sync";
var fs = require("fs");
var homeDir = require("os").homedir();
var path = require("path");
var userConfig = path.resolve(homeDir, ".sync/config.json");
var config = require(userConfig);
var program = require("commander");
var pkg = require("./package.json");
var sync = require("./lib/sync.js");
var update = require("./lib/update.js");
var createConfig = require("./lib/createConfig.js");

program
  .version(pkg.version)
  .usage("<options>")
  .option("-r, --remote <value>", "指定需要同步的远程目录")
  .option("-u, --update", "更新远程目录")
  .option("-b, --beforeCommit", "同步未提交的内容")
  .option("-c, --config", "配置基本信息")
  .option("-l, --listConfig", "查看基本信息")
  .parse(process.argv);

// global variables
var remoteDir = program.remote || config.remoteDir;
if (program.config) {
  createConfig();
} else if (program.listConfig) {
  console.log(config);
} else if (program.update) {
  update({
    remoteDir: remoteDir
  });
} else {
  sync({
    remoteDir: remoteDir,
    beforeCommit: program.beforeCommit || false
  }, config);
}
