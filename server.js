var http = require("http");
var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;

function parseUrl(url) {
    var matches = /^\/node\/(\d+)\/([M,A,D])\/?$/.exec(url);
    if (matches) {
        return {
            offset: +matches[1],
            status: matches[2]
        }    
    }
    return {};
}

function modifyContent(pathname, content) {
    fs.writeFileSync(pathname, content);
}

function addContent(pathname, content) {
    var dirname = path.dirname(pathname);
    if (fs.existsSync(dirname)) {
        fs.writeFileSync(pathname, content);
    } else {
        fs.mkdirSync(dirname, "0644");
        fs.writeFileSync(pathname, content)
    }
}

function deleteContent(pathname) {
   fs.unlinkSync(pathname); 
}

http.createServer(function (req, res) {
    var data = [];
    var params = parseUrl(req.url);
    if (!params.offset) {
        console.log("url error");
        return;
    }
    req.on("data", function (chunk) {
        data.push(chunk);
    });
    req.on("end", function () {
        data = Buffer.concat(data);
        var offset = data.readUIntLE(0, 2);
        var pathName = data.slice(2, 2 + offset).toString();
        switch(params.status) {
            case 'M': modifyContent(pathname, data.slice(2 + offset));break;
            case 'A': addContent(pathname, data.slice(2 + offset));break;
            case 'D': deleteContent(pathname);break;
        }
        res.writeHead(200, "OK");
        res.end();
    })

}).listen(18088, '127.0.0.1');
