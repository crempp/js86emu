import React  from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import Emulator from "../components/Emulator";
import IBM5150 from "../emu/config/IBM5150";
// import CodeGolf from "../emu/config/Test-CodeGolf";

function HomePage() {
  return (
    <Layout>
      <Head>
        <title>js86emu</title>
      </Head>
      <div>
        <Emulator config={IBM5150} />
        {/*<Emulator config={CodeGolf} />*/}
      </div>
    </Layout>
  );
}

export default HomePage;
