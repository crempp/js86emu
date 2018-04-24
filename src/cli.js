import System from "./emu/System";
import SystemConfig from "./emu/config/SystemConfig";

let sysConfig = new SystemConfig({

  cpu: {
    registers16: [0, 0, 0, 0, 0, 0, 0, 0x0100, 0, 0, 0, 0, 0, 0],
  },

  renderer: {
    class: 'RendererPNG',
  },

  programBlob: {
    file: "files/program-blobs/codegolf",
    addr: 0x00
  },

  debug: true,
});

let system = new System(sysConfig);

async function runEmulation () {
  console.log("booting...");
  await system.boot();

  console.log("running...");
  system.run(50000);

  // force a video scan at the end of the run
  system.videoCard.scan();
}

runEmulation().then(() => {
  // If we're using RendererPNG or RendererBin we can't exit right away or the
  // writes won't finish
  setTimeout(() => {
    process.exit();
  }, 1000);
}).catch((e) => {
  console.error(e);
});
