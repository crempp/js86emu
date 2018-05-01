# js86emu

js86emu is an x86 emulator written in Javascript. Currently it correctly
emulates an 8086(88) processor along with auxiliary hardware such as hard disk
controllers and graphics. I plan on adding support for newer processors and
systems until it speed becomes a significant issue.

Demo : http://js86emu.chadrempp.com

Current Progress

* Support for all documented 8086 instructions and addressing modes
* Functioning stack
* Basic debugging logging
* 80x25 MDA text mode graphics using code page 437 font set
* Video renderer support for canvas, PNG and binary output
* 80% or better test coverage

## Documentation


## Quickstart

There are two ways to run js86emu: a command line client or as a web application.

First build the entire package

```
$ npm run build
```

### Command Line Client

```
$ npm run run:cli
```

### Web Application

```
$ npm run run:web
```

Then access the application at http://localhost:8080

### Test

js86emu has very good test coverage.

```
$ npm test
```

### Profiling performance

To profile the performance of js86emu the built-in node profiler works quite
well.

```
node --prof ./dist/runner.js
node --prof-process isolate-0x102801e00-v8.log
```
