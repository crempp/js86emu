
/**
 * Useful Functions
 */

var Util = {
    checkBin:function(n){return/^[01]{1,64}$/.test(n)},
    checkDec:function(n){return/^[0-9]{1,64}$/.test(n)},
    checkHex:function(n){return/^[0-9A-Fa-f]{1,64}$/.test(n)},
    pad:function(s,z){s=""+s;return s.length<z?Util.pad("0"+s,z):s},
    unpad:function(s){s=""+s;return s.replace(/^0+/,'')},
    Dec2Bin:function(n){if(!Util.checkDec(n)||n<0)return 0;return n.toString(2)},
    Dec2Hex:function(n){if(!Util.checkDec(n)||n<0)return 0;return parseInt(n.toString(16),16)},
    Bin2Dec:function(n){if(!Util.checkBin(n))return 0;return parseInt(parseInt(n,2).toString(10),10)},
    Bin2Hex:function(n){if(!Util.checkBin(n))return 0;return parseInt(parseInt(n,2).toString(16),16)},
    Hex2Bin:function(n){if(!Util.checkHex(n))return 0;return parseInt(n,16).toString(2)},
    Hex2Dec:function(n){if(!Util.checkHex(n))return 0;return parseInt(parseInt(n,16).toString(10),10)},

    /**
     * Convenience function to build opcode objects
     *
     * @param opcode_byte
     * @param addressing_byte
     * @returns {{opcode_byte: *, addressing_byte: *, prefix: number, opcode: number, d: number, w: number, mod: number, reg: number, rm: number, cycle: number}}
     */
    buildOpcode : function (opcode_byte, addressing_byte) {
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
    },

    /**
     * Assign identifying numbers to the registers
     *
     * @param cpu
     */
    setRegisterIdent : function (cpu) {
        // Main Registers
        cpu._regAH = 0x01;
        cpu._regAL = 0x02; // primary accumulator
        cpu._regBH = 0x03;
        cpu._regBL = 0x04; // base, accumulator
        cpu._regCH = 0x05;
        cpu._regCL = 0x06; // counter, accumulator
        cpu._regDH = 0x07;
        cpu._regDL = 0x08; // accumulator, other functions

        // Index registers
        cpu._regSI = 0x09; // Source Index
        cpu._regDI = 0x0A; // Destination Index
        cpu._regBP = 0x0B; // Base Pointer
        cpu._regSP = 0x0C; // Stack Pointer

        // Program counter
        cpu._regIP = 0x0D; // Instruction Pointer

        // Segment registers
        cpu._regCS = 0x0E; // Code Segment
        cpu._regDS = 0x0F; // Data Segment
        cpu._regES = 0x10; // ExtraSegment
        cpu._regSS = 0x11; // Stack Segment

        cpu._regFlags = 0x12;
    },

    /**
     * Set the value of the first _n_ bytes of memory to it's address (easy to
     * verify the value that way).
     *
     * @param cpu
     */
    setMemoryIdent : function (cpu, n) {
        n = n || 256;
        for (a = 0; a < n; a++) {
            cpu._memoryV.set(a, a);
        }
    },

    /**
     * Build a CPU mock.
     *
     * The Cpu object has many messy dependencies. This mock object allows us
     * to avoid those for most cases.
     *
     * @returns Object Fake CPU object
     */
    buildCPUMock : function () {
        return cpuMock = {
            _cycles   : 0,
            _haltFlag : false,

            isDebug              : function(){ return true; },
            debugUpdateDecode    : function(opcode){ /*noop*/ },
            debugUpdateMemory    : function(memoryV){ /*noop*/ },
            debugUpdateRegisters : function(regObj){ /*noop*/ },
            halt                 : function(options) { /*noop*/ }
        };
    },

    /**
     * Build a Settings mock
     *
     * @returns Object Fake Settings object
     */
    buildSettingsMock : function () {
        return mockSettings = {
            "address": 0,
            "use-bios" : false,
            "cpu-init": {
                "registers": {
                    "ah" : 0x0012,
                    "al" : 0x0011,
                    "bh" : 0x0010,
                    "bl" : 0x000F,
                    "ch" : 0x000E,
                    "cl" : 0x000D,
                    "dh" : 0x000C,
                    "dl" : 0x000B,
                    "si" : 0x000A,
                    "di" : 0x0009,
                    "bp" : 0x0008,
                    "sp" : 0x0007,
                    "ip" : 0x0006,
                    "cs" : 0x0005,
                    "ds" : 0x0004,
                    "es" : 0x0003,
                    "ss" : 0x0002,
                    "flags" : 0x0001
                },
                "type": "8086"
            },
            "file": "files/program-blobs/tester.bin",
            "id": "test",
            "name": "Test Program",
            "selected": true
        };
    },

    /**
     * Load the CPU Module using Require.js
     *
     * @param done
     */
    loadCpuModule : function(done) {
        // Load the CPU module using require.js
        requirejs(['emu/cpu'], function (_File) {
            Cpu = _File;
            done();
        });
    },

    /**
     * Load the CPU Module using Require.js
     *
     * @param done
     */
    loadCpuInstanceModule : function(done) {
        // Load the CPU module using require.js
        requirejs(['emu/cpus/8086'], function (_File) {
            Cpu = _File;
            done();
        });
    }
};

module.exports = Util;
