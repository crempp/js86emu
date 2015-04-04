var path = require('path');
var requirejs = require('requirejs');
var assert = require("assert")
var should = require('should');

// Minimal configuration of require.js for this test run
requirejs.config({
    baseUrl: path.normalize(__dirname + "/../src/js"),
    nodeRequire: require,
});

//Useful Functions
function checkBin(n){return/^[01]{1,64}$/.test(n)}
function checkDec(n){return/^[0-9]{1,64}$/.test(n)}
function checkHex(n){return/^[0-9A-Fa-f]{1,64}$/.test(n)}
function pad(s,z){s=""+s;return s.length<z?pad("0"+s,z):s}
function unpad(s){s=""+s;return s.replace(/^0+/,'')}

//Decimal operations
function Dec2Bin(n){if(!checkDec(n)||n<0)return 0;return n.toString(2)}
function Dec2Hex(n){if(!checkDec(n)||n<0)return 0;return parseInt(n.toString(16),16)}

//Binary Operations
function Bin2Dec(n){if(!checkBin(n))return 0;return parseInt(parseInt(n,2).toString(10),10)}
function Bin2Hex(n){if(!checkBin(n))return 0;return parseInt(parseInt(n,2).toString(16),16)}

//Hexadecimal Operations
function Hex2Bin(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(2)}
function Hex2Dec(n){if(!checkHex(n))return 0;return parseInt(parseInt(n,16).toString(10),10)}

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
            debugUpdateDecode    : function(opcode){ /*noop*/ },
            debugUpdateMemory    : function(memoryV){ /*noop*/ },
            debugUpdateRegisters : function(regObj){ /*noop*/ },
            halt                 : function(options) { /*noop*/ }
        };

        var mockSettings = {
            "address": 0,
            "cpu-init": {
                "registers": {
                    "ip": 0,
                    "sp": 0
                },
                "type": "8086"
            },
            "file": "files/program-blobs/tester.bin",
            "id": "test",
            "name": "Test Program",
            "selected": true
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
                    done();
                });
            });


            describe('Cpu Intialization', function(){
                it('should configure', function() {
                    // TODO: Write test
                    // cpu8086.configure();
                });

                it('should initialize memory', function() {
                    cpu8086.initializeMemory();

                    cpu8086._memory.should.be.an.instanceOf(ArrayBuffer);
                    cpu8086._memoryV.should.be.an.instanceOf(Uint8Array);
                    cpu8086._memoryV.length.should.equal(1048576);
                });

                it('should clear registers', function() {
                    // TODO: Write test
                    // cpu8086.clearRegisters()
                });

                it('should initialize instruction pointer', function() {
                    // TODO: Write test
                    // cpu8086.initIP()
                });

                it('should clear memory', function() {
                    // TODO: Write test
                    // cpu8086.clearMemory()
                });

                it('should load binary', function() {
                    // TODO: Write test
                    // cpu8086.loadBinary()
                });
            });


            describe('Cpu utilities', function() {
                before(function(){
                    cpu8086.configure(cpuMock, mockSettings);
                    cpu8086.initializeMemory();
                    cpu8086.clearRegisters();
                });

                beforeEach(function(){
                    // Assign identifying numbers to the registers
                    // Main Registers
                    cpu8086._regAH = 0x01; cpu8086._regAL = 0x02; // primary accumulator
                    cpu8086._regBH = 0x03; cpu8086._regBL = 0x04; // base, accumulator
                    cpu8086._regCH = 0x05; cpu8086._regCL = 0x06; // counter, accumulator
                    cpu8086._regDH = 0x07; cpu8086._regDL = 0x08; // accumulator, other functions

                    // Index registers
                    cpu8086._regSI = 0x09; // Source Index
                    cpu8086._regDI = 0x0A; // Destination Index
                    cpu8086._regBP = 0x0B; // Base Pointer
                    cpu8086._regSP = 0x0C; // Stack Pointer

                    // Program counter
                    cpu8086._regIP = 0x0D; // Instruction Pointer

                    // Segment registers
                    cpu8086._regCS = 0x0E; // Code Segment
                    cpu8086._regDS = 0x0F; // Data Segment
                    cpu8086._regES = 0x10; // ExtraSegment
                    cpu8086._regSS = 0x11; // Stack Segment

                    cpu8086._regFlags = 0x12;

                    cpu8086.initIP();
                    cpu8086.clearMemory();
                })

                it('should return register value based on opcode <_getRegValueForOp>', function () {
                    /**
                     *   REG w=0 w=1  REG w=0 w=1
                     *   000 AL  AX   100 AH  SP
                     *   001 CL  CX   101 CH  BP
                     *   010 DL  DX   110 DH  SI
                     *   011 BL  BX   111 BH  DI
                     */
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000000"), Bin2Hex("00000000")))
                        .should.equal(cpu8086._regAL);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000000"), Bin2Hex("00001000")))
                        .should.equal(cpu8086._regCL);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000000"), Bin2Hex("00010000")))
                        .should.equal(cpu8086._regDL);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000000"), Bin2Hex("00011000")))
                        .should.equal(cpu8086._regBL);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000000"), Bin2Hex("00100000")))
                        .should.equal(cpu8086._regAH);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000000"), Bin2Hex("00101000")))
                        .should.equal(cpu8086._regCH);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000000"), Bin2Hex("00110000")))
                        .should.equal(cpu8086._regDH);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000000"), Bin2Hex("00111000")))
                        .should.equal(cpu8086._regBH);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000001"), Bin2Hex("00000000")))
                        .should.equal(((cpu8086._regAH<<8)|cpu8086._regAL));
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000001"), Bin2Hex("00001000")))
                        .should.equal(((cpu8086._regCH<<8)|cpu8086._regCL));
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000001"), Bin2Hex("00010000")))
                        .should.equal(((cpu8086._regDH<<8)|cpu8086._regDL));
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000001"), Bin2Hex("00011000")))
                        .should.equal(((cpu8086._regBH<<8)|cpu8086._regBL));
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000001"), Bin2Hex("00100000")))
                        .should.equal(cpu8086._regSP);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000001"), Bin2Hex("00101000")))
                        .should.equal(cpu8086._regBP);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000001"), Bin2Hex("00110000")))
                        .should.equal(cpu8086._regSI);
                    cpu8086._getRegValueForOp(cpu8086._decode(Bin2Hex("00000001"), Bin2Hex("00111000")))
                        .should.equal(cpu8086._regDI);
                });

                it('should return register/memory based on opcode <_getRMValueForOp>', function () {
                    // TODO: Write test
                    // cpu8086._getRMValueForOp()
                });

                it('should set register value based on opcode <_setRegValueForOp>', function () {
                    // TODO: Write test
                    // cpu8086._setRegValueForOp()
                });

                it('should set register/memory based on opcode <_setRMValueForOp>', function () {
                    // TODO: Write test
                    // cpu8086._setRMValueForOp()
                });

                it('should ??? <_getRMIncIP>', function () {
                    // TODO: Write test
                    // cpu8086._getRMIncIP()
                });

                it('should execute push', function () {
                    // TODO: Write test
                   // cpu8086. _push()
                });

                it('should execute pop', function () {
                    // TODO: Write test
                    // cpu8086._pop()
                });

                it('should execute short jump', function () {
                    // TODO: Write test
                    // cpu8086._shortJump()
                });

                it('should set flag register', function () {
                    // TODO: Write test
                    // cpu8086._setFlags()
                });

                it('should bundle register values', function () {
                    // TODO: Write test
                    // cpu8086._bundleRegisters()
                });

                afterEach(function(){
                    cpu8086.clearRegisters()
                })
            });


            describe('Cpu Instructions', function(){

                beforeEach("State Setup", function(){
                    cpu8086.configure(cpuMock, mockSettings);
                    cpu8086.initializeMemory();
                    cpu8086.clearRegisters();
                    cpu8086.initIP();
                    cpu8086.clearMemory();
                });

                // https://defuse.ca/online-x86-assembler.htm

                it('should ADD', function() {
                    //var settings = SettingsModel.get('emuSettings')["blobSettings"]
                    var opcode = buildOpcode(0x10, 0xD8);
                    cpu8086.run

                });
            });



//            emulateCycle

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
