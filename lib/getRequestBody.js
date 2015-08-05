var Promise = require("promise"); 
var http  =require("http");
/**
 * @param request intanceof http.IncomingMessage
 */
module.exports = function (request) {
    return new Promise(function (resolve, reject) {
        if (!(request instanceof http.IncomingMessage)) {
            reject("request is not instanceof IncomingMessage");
            return;
        }
        var data = [];    
        request.on("data", function (chunk) {
            data.push(chunk);
        });
        request.on("end", function () {
            resolve(Buffer.concat(data));
        });
    });
}
