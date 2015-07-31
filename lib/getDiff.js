var execSync = require("child_process").execSync;
var Promise = require("promise");
var option = {
    cwd: process.cwd()
};

module.exports = function () {
    return new Promise(function (resolve, reject) {
        try {
            execSync("git rev-parse --git-dir > /dev/null 2>&1 ", option);
            var stdout = execSync("git diff origin/master HEAD --name-only");
            var diffFiles = stdout.toString().trim().split("\n");
            resolve(diffFiles);
        } catch (e) {
            reject(e.message);
        }
    });
};

