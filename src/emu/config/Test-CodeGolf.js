import SystemConfig from "./SystemConfig";

let config = new SystemConfig({
  memorySize: 0x100000,
  cpu: {
    registers16: [
      /* AX */ 0,
      /* BX */ 0,
      /* CX */ 0,
      /* DX */ 0,
      /* SI */ 0,
      /* DI */ 0,
      /* BP */ 0,
      /* SP */ 0x0100,
      /* IP */ 0,
      /* CS */ 0,
      /* DS */ 0,
      /* ES */ 0,
      /* SS */ 0,
      /* FL */ 0,
    ],
  },

  timeSyncCycles: 10000,

  renderer: {
    class: "RendererCanvas"
  },

  ports: {
    memoryMapped: false,
    size: 0xFFFF,        // IBM 5150 has 64k I/O address space
    devices: [
      {"range": [0x0000, 0x03AF], "dir": "rw", "device": null},
      {"range": [0x03B0, 0x03BB], "dir": "rw", "device": "VideoMDA"},
      {"range": [0x03BC, 0xFFFF], "dir": "rw", "device": null}
    ]
  },

  programBlob: {
    file: "files/program-blobs/codegolf",
    addr: 0x00
  },

  video: { memoryStart:  0x8000 },
  debug: true,
});

export default config;
