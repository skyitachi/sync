var http = require("http");
var fs = require("fs");

http.createServer(function (req, res) {
    var data = [];
    req.on("data", function (chunk) {
        data.push(chunk);
    });
    req.on("end", function () {
        data = Buffer.concat(data);
        var offset = data.readUIntLE(0, 2);
        var pathName = data.slice(2, 2 + offset).toString();
        fs.writeFileSync("client", data.slice(2 + offset));
        res.writeHead(200, "OK");
        res.end();
    })

}).listen(18088, '127.0.0.1');