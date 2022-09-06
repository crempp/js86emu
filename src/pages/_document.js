import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { css } from "@emotion/react";

class JSEmuDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
          <script noModule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
        </body>
      </Html>
    )
  }
}

export default JSEmuDocument;