var execSync = require("child_process").execSync;

module.exports = function execSyncSafe() {
   var args = Array.prototype.slice.call(arguments, 0); 
   var option = {};
   if (!args[1]) {
       option.stdio = "pipe";
       args[1] = option;
   } else {
       args[1].stdio = "pipe";
   }
   option = null;
   return execSync.apply(null, args);
};
