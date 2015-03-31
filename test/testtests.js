var path = require('path');
var requirejs = require('requirejs');
var assert = require("assert")
var should = require('should');

// Minimal configuration of require.js for this test run
requirejs.config({
    baseUrl: path.normalize(__dirname + "/../src/js"),
    nodeRequire: require,
});

/**
 * Load the CPU Module using Require.js
 *
 * @param done
 */
function loadCpuModule(done) {
    // Load the CPU module using require.js
    requirejs(['emu/cpus/8086'], function (_File) {
        Cpu = _File;
        done();
    });
}

/**
 * Emulator tests
 */
describe('Emu', function () {

    /**
     * CPU Tests
     */
    describe('Cpu', function () {
        // Create a mock Cpu so we don't have to include the Cpu
        // module and all it's messy dependencies
        var cpuMock = {
            _cycles   : 0,
            _haltFlag : false,

            isDebug              : function(){ return true; },
            debugUpdateDecode    : function(opcode){ noop; },
            debugUpdateMemory    : function(memoryV){ noop; },
            debugUpdateRegisters : function(regObj){ noop; },
            halt                 : function(options) { noop; }
        };

        /**
         * 8086 Tests
         */
        describe('8086', function () {
            /**
             * Convenience function to build opcode objects
             *
             * @param opcode_byte
             * @param addressing_byte
             * @returns {{opcode_byte: *, addressing_byte: *, prefix: number, opcode: number, d: number, w: number, mod: number, reg: number, rm: number, cycle: number}}
             */
            var buildOpcode = function (opcode_byte, addressing_byte) {
                return {
                    opcode_byte: opcode_byte,
                    addressing_byte: addressing_byte,
                    prefix: 0x00, // Not supporting prefix opcodes yet
                    opcode: (opcode_byte & 0xFC) >>> 2,
                    d: (opcode_byte & 0x02) >>> 1,
                    w: (opcode_byte & 0x01),
                    mod: (addressing_byte & 0xC0) >>> 6,
                    reg: (addressing_byte & 0x38) >>> 3,
                    rm: (addressing_byte & 0x07),
                    cycle: 0
                };
            };

            // Setup the CPU
            var cpu8086;
            before("CPU Setup", function (done) {
                // Load the CPU module using require.js
                requirejs(['emu/cpus/8086'], function (_File) {
                    cpu8086 = _File;
                    console.log("1");
                    done();
                });
            });


            describe('Cpu Intialization', function(){
                it('should initialize memory', function() {
                    // Initialize
                    cpu8086.initializeMemory();

                    cpu8086._memory.should.be.an.instanceOf(ArrayBuffer);
                    cpu8086._memoryV.should.be.an.instanceOf(Uint8Array);
                    cpu8086._memoryV.length.should.equal(1048576);
                });

                it('should blah', function(){

                });
            });

            describe('Cpu Instructions', function(){
                beforeEach("State Setup", function(){
                    cpu8086.configure(cpuMock, settings);
                    cpu8086.initializeMemory();
                    cpu8086.clearRegisters();
                    cpu8086.initIP();
                    cpu8086.clearMemory();
                });

                // https://defuse.ca/online-x86-assembler.htm

                it('should ADD', function() {
                    //var settings = SettingsModel.get('emuSettings')["blobSettings"]
                    var settings = {
                        "cpu-init": {
                            registers: {
                                ah : 0,
                                sp : 0,
                                ip : 0
                            }
                        }
                    };



                    var opcode = buildOpcode(0x10, 0xD8);
                    cpu8086.run

                });
            });

            describe('_getRegValueForOp', function () {
//                it.skip("should return values from correctly decoded register", function() {
//                    var reg = cpu8086._getRegValueForOp(buildOpcode(0xff, 0xff));
//                    reg.should.equal(0);
//
//                    var reg = cpu8086._getRegValueForOp(buildOpcode(0xff, 0xff));
//                    reg.should.equal(0);
//
//                    // ...
//                });
            })


//            _getRegValueForOp
//            _getRMValueForOp
//            _setRegValueForOp
//            _setRMValueForOp
//            _getRMIncIP
//            configure
//            initializeMemory
//            clearRegisters
//            initIP
//            clearMemory
//            loadBinary
//            emulateCycle
//            _push
//            _pop
//            _shortJump
//            _setFlags
//            _bundleRegisters

//            it('should equal itself', function () {
//                console.log("2", cpu8086);
//                (5).should.be.exactly(5);
//            });
//
//            it('should ADD', function() {
//                cpu8086.configure(cpu8086, settings);
//                cpu8086.initializeMemory()
//                cpu8086.clearRegisters()
//            });
        });
    });
});
