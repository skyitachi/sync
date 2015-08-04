var execSync = require("child_process").execSync;
var Promise = require("promise");
var option = {
    cwd: process.cwd()
};

module.exports = function () {
    return new Promise(function (resolve, reject) {
        try {
            execSync("git rev-parse --git-dir > /dev/null 2>&1 ", option);
            var stdout = execSync("git diff origin/master HEAD --name-status");
            var diffFiles = stdout.toString().trim().split("\n");
            var diffFilesStatus = diffFiles.map(function (line) {
                var groups = line.split(/\s+/);
                return {
                    status: groups[0],
                    filename: groups[1]
                }
            });
            resolve(diffFilesStatus);
        } catch (e) {
            reject(e.message);
        }
    });
};

