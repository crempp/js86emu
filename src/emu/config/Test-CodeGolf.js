import SystemConfig from "./SystemConfig";

let config = new SystemConfig({
  memorySize: 1024 * 1024,
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
  renderer: {
    class: 'RendererCanvas'
  },
  programBlob: {
    file: "files/program-blobs/codegolf",
    addr: 0x00
  },
  video: { memoryStart:  0x8000 },
  debug: false,
});

export default config;
