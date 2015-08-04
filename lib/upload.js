/**
 * Created by skyitachi on 15/7/31.
 */
var fs = require("fs");
var http = require("http");
var option = require("../config.json");
var Promise = require("promise");
var path = require("path");
var originPath = option.path;

module.exports = function (src, dest, status) {
    return new Promise(function (resolve, reject) {
        var nameBuf = new Buffer(dest);
        var low = nameBuf.length & 0x00ff;
        var high = (nameBuf.length & 0xff00) >> 8;
        var lenBuf = new Buffer([low, high]);
        var statusBuf = new Buffer(status);
        var contentBuf;

        if (status === "D") {
            contentBuf = new Buffer("");
        } else {
            contentBuf = fs.readFileSync(src);
        }
        option.path = path.resolve(originPath, nameBuf.length.toString(), status);
        var req = http.request(option, function (res) {
            var resBody = [];
            res.on("data", function (chunk) {
                resBody.push(chunk);
            });
            res.on("close", function () {
                console.log("close");
                if (res.statusCode === 200) {
                    resolve("ok");
                } else {
                    reject(Buffer.concat(resBody).toString());
                }
            });
        });
        req.write(Buffer.concat([lenBuf, nameBuf, contentBuf]));
        req.end();
    });
};
