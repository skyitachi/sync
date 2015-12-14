/**
 * Created by skyitachi on 15/7/31.
 */
var fs = require("fs");
var http = require("http");
var Promise = require("promise");
var path = require("path");

module.exports = function (src, dest, status, option) {
  return new Promise(function (resolve, reject) {
    var nameBuf = new Buffer(dest);
    var low = nameBuf.length & 0x00ff;
    var high = (nameBuf.length & 0xff00) >> 8;
    var lenBuf = new Buffer([low, high]);
    var contentBuf;

    if (status === "D") {
      contentBuf = new Buffer("");
    } else {
      contentBuf = fs.readFileSync(src);
    }
    option.path = path.resolve("/node/sync", nameBuf.length.toString(), status);
    option.method = "post";
    var req = http.request(option, function (res) {
      var resBody = [];
      res.on("data", function (chunk) {
        resBody.push(chunk);
      });
      res.on("end", function () {
        var body = Buffer.concat(resBody).toString();
        resolve(body);
      });
    });
    req.on("error", function (error) {
      reject(error.stack);
    });
    req.write(Buffer.concat([lenBuf, nameBuf, contentBuf]));
    req.end();
  });
};
