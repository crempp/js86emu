import Head from 'next/head'
import Layout from "../components/Layout";
import Emulator from "../components/Emulator";
import SystemConfig from "../emu/config/SystemConfig";


let codeGolfConfig = new SystemConfig({
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

let sysConfig = new SystemConfig({
  bios: { file: "8086-tiny-bios.bin" },
  video: {
    class:        'VideoMDA',
    memorySize:   4 * 1024,
    memoryStart:  0xB0000,
    verticalSync: 50,       // Hertz
  },
  renderer: {
    class: 'RendererCanvas'
  },
  debug: false,
});

function HomePage() {
  return (
    <Layout>
      <Head>
        <title>js86emu</title>
      </Head>
      <div>
        {/*<Emulator config={codeGolfConfig} />*/}
        <Emulator config={sysConfig} />
      </div>
    </Layout>
  )
}



export default HomePage
