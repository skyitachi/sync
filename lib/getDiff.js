var Promise = require("promise");
var execSyncSafe = require("./execSyncSafe.js");
var option = {
    "cwd": process.cwd(),
    "encoding": "utf8",
    "stdio": "pipe"
};
var cmdAfterCommit = "git diff origin/master HEAD --name-status";
var cmdBeforeCommit = "git diff-index HEAD --name-status";
module.exports = function (commandOption) {
    return new Promise(function (resolve, reject) {
      var cmd = cmdAfterCommit;
      if (commandOption && commandOption.beforeCommit) {
        cmd = cmdBeforeCommit;
      }
        try {
            execSyncSafe("git rev-parse --git-dir > /dev/null 2>&1 ", option);
            var stdout = execSyncSafe(cmd, option);
            if (!stdout) {
                resolve([]);
            } else {
                var diffFiles = stdout.toString().trim().split("\n");
                var diffFilesStatus = diffFiles
                    .filter(function (diff) {return diff.length;})
                    .map(function (line) {
                        var groups = line.split(/\s+/);
                        return {
                            status: groups[0],
                            filename: groups[1]
                        }
                    });
                resolve(diffFilesStatus);
            }
        } catch (e) {
            console.log(e.stack);
            reject(e.message);
        }
    });
};

