var connect = require('connect');
var serveStatic = require('serve-static');

var STATIC_DIR = __dirname;
var PORT = 8080;

connect().use(serveStatic(STATIC_DIR)).listen(PORT);

process.stdout.write("Server started:\n");
process.stdout.write("   http://localhost:" + PORT + "\n");