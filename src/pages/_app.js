import React, {Component} from "react";
import { globalCss } from "@stitches/react";
import { EmulationProvider } from "../Providers";

const globalStyles = globalCss({
  "html, body": {
    height: "100%",
    width: "100%",
    padding: 0,
    margin: 0,
    backgroundColor: "$background",
  },
  "html, body, input, textarea, button": {
    fontFamily: "'Space Mono', monospace",
    fontSize: "1rem",
    lineHeight: "1.4",
    color: "$fontColor",
  },
  "#__next": {
    height: "100%",
    width: "100%",
    padding: 0,
    margin: 0,
  }
});

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { Component, pageProps } = this.props;
    globalStyles();
    return (
      <EmulationProvider system={this.system}>
        <Component {...pageProps} />
      </EmulationProvider>
    );
  }
}
