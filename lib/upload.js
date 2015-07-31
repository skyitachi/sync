/**
 * Created by skyitachi on 15/7/31.
 */
var fs = require("fs");
var http = require("http");
var option = require("../config.json");
var Promise = require("promise");

module.exports = function (src, dest) {
    return new Promise(function (resolve, reject) {
        var nameBuf = new Buffer(dest);
        var low = nameBuf.length & 0x00ff;
        var high = (nameBuf.length & 0xff00) >> 8;
        var lenBuf = new Buffer([low, high]);
        var contentBuf = fs.readFileSync(src);
        var req = http.request(option);
        req.write(Buffer.concat([lenBuf, nameBuf, contentBuf]));
        req.end();
        req.on("response", function (res) {
            if (res.statusCode === 200) {
                resolve("ok");
            } else {
                reject(res.statusMessage);
            }
        });
    });
};
