import connect from 'connect';
import serveStatic from 'serve-static'
import path from 'path';
import compression from 'compression';
import morgan from 'morgan';

let STATIC_DIR = path.normalize(`${__dirname}/../../web`);
let FILES_DIR = path.normalize(`${__dirname}/../../files`);
let PORT = 8080;

let app = connect();

app.use(compression());
app.use(morgan('tiny'));

// app.use(serveStatic(STATIC_DIR)).listen(PORT);
app.use(serveStatic(STATIC_DIR));
app.use('/files', serveStatic(FILES_DIR));
app.listen(PORT);

process.stdout.write(`Server started:\n`);
process.stdout.write(`   URL: http://localhost:${PORT}\n`);
process.stdout.write(`   PATH: ${STATIC_DIR}\n`);
process.stdout.write(`   FILES: ${FILES_DIR}\n`);
