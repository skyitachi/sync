#!/usr/bin/env node

var config = require("./config.json");
var program = require("commander");
var pkg = require("./package.json");
var sync = require("./lib/sync.js");

program
    .version(pkg.version)
    .usage("<options>")
    .option("-r, --remote <value>", "远程目录")
    .parse(process.argv);

//global variables

var remoteDir = program.remote || config.remoteDir;

sync({
    remoteDir: remoteDir
});
