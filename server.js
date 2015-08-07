var http = require("http");
var fs = require("fs");
var path = require("path");
var execSyncSafe = require("./lib/execSyncSafe.js");
var HTTPStatus = require("http-status");
var util = require("util");
var getRequestBody = require("./lib/getRequestBody.js");

var debug = require("debug")("server");

function parseSyncUrl(url) {
    var matches = /^\/node\/sync\/(\d+)\/([MAD])\/?$/.exec(url);
    if (matches) {
        return {
            offset: +matches[1],
            status: matches[2]
        }    
    }
    return false;
}

function parseUpdateUrl(url) {
    var matches = /^\/node\/update\/?$/.exec(url);
    return matches ? true : false;
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

function addContent(res, pathname, content) {
    var dirName = path.dirname(pathname);
    try {
        if (fs.existsSync(dirName)) {
            fs.writeFileSync(pathname, content);
        } else {
            fs.mkdirSync(dirName, "0755");
            fs.writeFileSync(pathname, content);
        }
    } catch(e) {
        var error = parseError(e);
        respond(res, error.code, error.msg);        
        return;
    }
    respond(res, 200, "OK");
}

function deleteContent(res, pathname) {
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
        "ENOENT": 503
    };
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

function updateRepo(req, res) {
    if (!parseUpdateUrl(req.url)) return Promise.resolve("unhandled");
    var cmd = "rsync -a %s %s";
    return getRequestBody(req).then(function (data) {
        data = JSON.parse(data.toString());
        try {
            execSyncSafe(util.format(cmd, data.srcDir, data.dstDir));
            respond(res, 200, "OK");
        } catch (e) {
            respond(res, 500, e.message);
        }
        return Promise.resolve("handled");
    });
}

function syncRepo(req, res) {
    var params = parseSyncUrl(req.url);
    if (!params) {
        return Promise.resolve("unhandled");
    }
    return getRequestBody(req).then(function (data) {
        var offset = data.readUIntLE(0, 2);
        var pathName = data.slice(2, 2 + offset).toString();
        switch(params.status) {
            case 'M': modifyContent(res, pathName, data.slice(2 + offset));break;
            case 'A': addContent(res, pathName, data.slice(2 + offset));break;
            case 'D': deleteContent(res, pathName);break;
        }
        return Promise.resolve("handled");
    });
}

function chainHandle(req, res, queue) {
    Promise.all(queue.map(function (handler) {return handler(req, res);}))
        .then(function (msgs) {
            var unhandled = msgs.every(function (msg) {return msg === "unhandled";});
            if (unhandled) {
                respond(res, 400, "wrong url");
            }
        });
}

http.createServer(function (req, res) {
    chainHandle(req, res, [syncRepo, updateRepo]);
}).listen(18088, '127.0.0.1');
