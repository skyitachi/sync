var http = require("http");
var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;

http.createServer(function (req, res) {
    var data = [];
    req.on("data", function (chunk) {
        data.push(chunk);
    });
    req.on("end", function () {
        data = Buffer.concat(data);
        var offset = data.readUIntLE(0, 2);
        var pathName = data.slice(2, 2 + offset).toString();
        if (fs.existsSync(pathName)) {
            fs.writeFileSync(pathName , data.slice(2 + offset));
        } else {
            execSync("mkdir -p " + path.dirname(pathName));
            fs.writeFileSync(pathName , data.slice(2 + offset));
        }
        res.writeHead(200, "OK");
        res.end();
    })

}).listen(18088, '127.0.0.1');