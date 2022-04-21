import SystemConfig from "./SystemConfig";

let config = new SystemConfig({
  // Memory size must remain at 1Mb despite what the jumpers are set to because
  // the BIOS loads at the top of that and we don't support memory holes yet.
  memorySize: 0x100000,
  memory: null,

  /** The number of cycles between timing syncs */
  timeSyncCycles: 4 * 1000000 / 100, // About 100 times per sec

  /** Number of cycles per video sync. This is updated every timeSyncCycles */
  videoSync: 10000,

  programBlob: null,

  bios: {
    path: "/files/bios-roms/",
    // file: "8086-tiny-bios.bin"
    file: "BIOS_IBM5150_24APR81_5700051_U33.BIN"
  },

  cpu : {
    class:       '8086',
    registers16: [
      /* AX */ 0,
      /* BX */ 0,
      /* CX */ 0,
      /* DX */ 0,
      /* SI */ 0,
      /* DI */ 0,
      /* BP */ 0,
      /* SP */ 0,
      /* IP */ 0,      // Reset vector on 8086
      /* CS */ 0xFFFF, // Reset vector on 8086
      /* DS */ 0,
      /* ES */ 0,
      /* SS */ 0,
      /* FL */ 0,
    ],
    frequency:   10 * 1024**2, // 10 Mhz
    flags:       0x0000,
  },

  video: {
    class:        'VideoMDA',
    memorySize:   4 * 1024,
    memoryStart:  0xB8000,
    verticalSync: 50,       // Hertz
  },

  renderer: {
    class:   'RendererCanvas',
    options: {
      canvas: null,
    },
  },

  ports: {
    memoryMapped: false,
    size: 0xFFFF,        // IBM 5150 has 64k I/O address space
    devices: [
      {"range": [0x0000, 0x000F], "dir": "rw", "device": "DMA8237"},         // DMA
      {"range": [0x0010, 0x001F], "dir": "rw", "device": null},
      {"range": [0x0020, 0x0021], "dir": "rw", "device": "PIC8259"},         // Interrupt controller
      {"range": [0x0022, 0x003F], "dir": "rw", "device": null},
      {"range": [0x0040, 0x0043], "dir": "rw", "device": "PIT8253"},         // Counter timer
      {"range": [0x0044, 0x005F], "dir": "rw", "device": null},
      {"range": [0x0060, 0x0063], "dir": "rw", "device": "PPI8255"},         // PPI
      {"range": [0x0064, 0x007F], "dir": "rw", "device": null},
      {"range": [0x008         ], "dir": "rw", "device": null},              // Manufacturer systems checkpoint port (used during POST)
      {"range": [0x0081, 0x0083], "dir": "rw", "device": "DMA8237"},         // DMA page registerPort
      {"range": [0x0084, 0x009F], "dir": "rw", "device": null},
      {"range": [0x00A0],         "dir": "w",  "device": "NMIMaskRegister"}, // NMI mask registerPort
      {"range": [0x00A1, 0x01FF], "dir": "rw", "device": null},
      {"range": [0x0200, 0x020F], "dir": "rw", "device": null},      // Game port
      {"range": [0x0210, 0x0217], "dir": "rw", "device": null},      // Expansion Unit
      {"range": [0x0218, 0x02F7], "dir": "rw", "device": null},
      {"range": [0x02F8, 0x02FF], "dir": "rw", "device": null},      // Serial port 2
      {"range": [0x0300, 0x031F], "dir": "rw", "device": null},      // Prototype card
      {"range": [0x0320, 0x032F], "dir": "rw", "device": null},      // Fixed disk
      {"range": [0x0330, 0x0377], "dir": "rw", "device": null},
      {"range": [0x0378, 0x037F], "dir": "rw", "device": null},      // Parallel port 1
      {"range": [0x0380, 0x038F], "dir": "rw", "device": null},      // SDLC bi-synchronous 2
      {"range": [0x0390, 0x03AF], "dir": "rw", "device": null},
      {"range": [0x03B0, 0x03BB], "dir": "rw", "device": "VideoMDA"},        // Monochrome adaptor/printer
      {"range": [0x03BC, 0x03BF], "dir": "rw", "device": "ParallelCard"},    // Monochrome adaptor/printer
      {"range": [0x03C0, 0x03CF], "dir": "rw", "device": null},
      {"range": [0x03D0, 0x03D7], "dir": "rw", "device": null},      // CGA
      {"range": [0x03D8, 0x03EF], "dir": "rw", "device": null},
      {"range": [0x03F0, 0x03F7], "dir": "rw", "device": null},      // Floppy disk
      {"range": [0x03F8, 0x03FF], "dir": "rw", "device": null},      // Serial port
      {"range": [0x0400, 0xFFFF], "dir": "rw", "device": null}
    ]
  },
  jumpers: {
    // Switch 1
    // 1-7-8: Number of 5 1/4" drives
    // 2:     Co-processor installed
    // 3-4:   Installed memory on system board
    // 5-6:   Monitor Type
    //
    // Switch 2 [7] p.2-28
    // 1-2-3-4: Installed memory options
    // 5-6-7-8: Unused, must be off
    //
    // Drive settings
    //              --SW1--
    //              1  7  8
    //     0 drives 1  1  1
    //     1 drives 0  1  1
    //     2 drives 0  0  1
    //     3 drives 0  1  0
    //     4 drives 0  0  0
    //
    // Co-processor settings
    //               -SW1-
    //                 2
    //  installed      0
    //  not installed  1
    //
    // Monitor settings
    //                    -SW1-
    //                    5  6
    //     Card w/ BIOS   1  1
    //     CGA (40 x 25)  0  1
    //     CGA (80 x 25)  1  0
    //     MDA (80 x 25)  0  0
    //
    // Memory settings
    // These settings vary depending on BIOS version and have different meaning
    // when an expansion card is installed. See references for details. The
    // listed settings is for the 64KB-256KB main board
    //                -SW1-  ----SW2---
    //                3  4   1  2  3  4
    //       /  16kb  1  1   1  1  1  1
    //  System  32kb  0  1   1  1  1  1
    //   Board  48kb  1  0   1  1  1  1
    //       \  64kb  0  0   1  1  1  1
    //
    //       /  96kb  0  0   0  1  1  1
    //       | 128kb  0  0   1  0  1  1
    //  Option 160kb  0  0   0  0  1  1
    //   Board 192kb  0  0   1  1  0  1
    //       | 224kb  0  0   0  1  0  1
    //       \ 256kb  0  0   1  0  0  1
    // References:
    //    * [7] p.2-28
    //    * http://www.minuszerodegrees.net/5150/misc/5150_motherboard_switch_settings.htm
    //    * http://www.minuszerodegrees.net/5150/ram/5150_ram_64_256_SW2.jpg
    sw1: 0b11000011,
    sw2: 0b11110000,
  },
  debug: true,
  cycleBreak: false,
  debugAtCycle: null,
  debugAtIP: null,
  debugOpString: false,
});

export default config;
