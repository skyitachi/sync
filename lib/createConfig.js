var readline = require("readline");
var Promise = require("promise");
var util = require("util");
var chalk = require("chalk");
var fs = require("fs");
var path = require("path");
var home = require("os").homedir();
var cwd = process.cwd();
// readline interface
var rl;

function question(qName, isOptional) {
  isOptional = isOptional ? true : false;
  return function (lastInput) {
    return new Promise(function (resolve, reject) {
      rl.question(qName, function (answer) {
        if (answer === "n") {
          reject(new Error("Cannot type n"));
          return;
        }
        if (!isOptional && !answer) {
          reject(new Error("Cannot be empty"));
          return;
        }
        resolve(lastInput.concat(answer));
      });
    });
  }
}

function sequence(promises) {
  var state = Promise.resolve([]);
  promises = [].concat(promises);
  promises.forEach(function (promise, index) {
    state = state.then(promise);
  })
  return state.then(function (ret) {
    return Promise.resolve(ret);
  });
}

module.exports = function createConfig() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  sequence([
    question("type your remote server name: "),
    question("type your remote server port(80): ", true),
    question("type your remote user name: "),
    question("type your remote target directory: "),
    question(util.format("type your local git repo directory(%s): ", cwd), true)
  ]).then(function (result) {
    var props = ["hostname", "port", "username", "remoteDir", "sourceDir"];
    var config = props.reduce(function (conf, prop, i) {
      conf[prop] = result[i];
      return conf;
    }, {});
    if (!config.sourceDir) config.sourceDir = cwd;
    if (!config.port) delete config.port;
    fs.writeFileSync(path.resolve(home, ".sync/config.json"), JSON.stringify(config, null, "\t"));
    rl.close();
    console.log(chalk.green("\u2714   update config successfully!"));
  }).catch(function (error) {
    console.log(chalk.red("\u2716   " + error.message));
    rl.close();
  });
}
