var http = require("http");
var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;
var HTTPStatus = require("http-status");

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

function modifyContent(res, pathname, content) {
    try {
        fs.writeFileSync(pathname, content);
    } catch (e) {
        var error = parseError(e);
        respond(res, error.code, error.msg);        
        return;
    }
    respond(res, 200, "OK");
}

function addContent(pathname, content) {
    var dirname = path.dirname(pathname);
    try {
        if (fs.existsSync(dirname)) {
            fs.writeFileSync(pathname, content);
        } else {
            fs.mkdirSync(dirname, "0664");
            fs.writeFileSync(pathname, content)
        }
    } catch(e) {
        var error = parseError(e);
        respond(res, error.code, error.msg);        
        return;
    }
    respond(res, 200, "OK");
}

function deleteContent(pathname) {
    try {
        fs.unlinkSync(pathname); 
    } catch (e) {
        var error = parseError(e);
        respond(res, error.code, error.msg);        
        return;
    }
    respond(res, 200, "OK");
}

function respond(res, statusCode, msg) {
    res.writeHead(statusCode, HTTPStatus[statusCode]);
    res.write(new Buffer(msg));
    res.end();
}

function parseError(error) {
    var msg = error.message;
    var re = /(EACCES|ENOENT)/;
    var codeMap = {
        "EACCES": 403,
        "ENOENT": 503,
    }
    var matches = re.exec(msg);
    if (!matches) {
        return {
            msg: HTTPStatus[500],
            code: 500
        }
    }
    return {
        msg: msg,
        code: codeMap[matches[1]]
    };
}

http.createServer(function (req, res) {
    var data = [];
    var params = parseUrl(req.url);
    if (!params.offset) {
        respond(res, 400, "url wrong");
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
            case 'M': modifyContent(res, pathName, data.slice(2 + offset));break;
            case 'A': addContent(res, pathName, data.slice(2 + offset));break;
            case 'D': deleteContent(res, pathName);break;
        }
    })

}).listen(18088, '127.0.0.1');
