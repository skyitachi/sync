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
      respond(res, error.code, {status: 0, msg: error.msg, file: pathname});
      return;
    }
  respond(res, 200, {status: 1, msg: "ok", file:pathname});
}

function addContent(res, pathname, content) {
  var dirName = path.dirname(pathname);
    try {
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, "0777");
      }
      fs.writeFileSync(pathname, content);
      fs.chmodSync(pathname, "0777");
    } catch(e) {
      var error = parseError(e);
      respond(res, error.code, {status: 0, msg: error.msg, file: pathname});
      return;
    }
  respond(res, 200, {status: 1, msg: "ok", file: pathname});

}

function deleteContent(res, pathname) {
  try {
    fs.unlinkSync(pathname);
  } finally {
    respond(res, 200, {status: 1, msg: "ok", file: pathname});
  }
}

function respond(res, statusCode, resData) {
    res.writeHead(statusCode, HTTPStatus[statusCode]);
    res.write(new Buffer(JSON.stringify(resData)));
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
          respond(res, 200, {status: 1, msg: "ok"});
        } catch (error) {
          respond(res, error.code, {status: 0, msg: error.msg});
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
                respond(res, 400, {status: 0, msg: "wrong url"});
            }
        });
}

http.createServer(function (req, res) {
    chainHandle(req, res, [syncRepo, updateRepo]);
}).listen(18088, '127.0.0.1');
