var http = require("http");
var config = require("../config.json");
var path = require("path");
var Promise = require("promise");
var assign = require("object-assign");
var chalk = require("chalk");

function uploadPromise(option, data) {
    return new Promise(function (resolve, reject) {
        var req = http.request(option, function (res) {
            var resBody = [];
            res.on("data", function (chunk) {
                resBody.push(chunk);
            });
            res.on("end", function () {
                resolve(Buffer.concat(resBody).toString());   
            });
        });
        req.write(data);
        req.end();
    });
}

module.exports = function (option) {
    if (!option.remoteDir) {
        console.log("please check your remoteDir");
        return;
    }
    config.path = path.resolve(config.path, "update");
    var postData = JSON.stringify({
        srcDir: config.srcDir,
        dstDir: config.remoteDir
    });
    var uploadOption = assign(config, option, {
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    });
    uploadPromise(uploadOption, postData)
        .then(function (res) {
          var ret = JSON.parse(res);
          if (ret.status) {
            console.log(chalk.green("update ok"));
          } else {
            console.log(chalk.red("update failed: ") + ret.msg);
          }
        });
};
