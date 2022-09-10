import React, {Component} from "react";
import Image from "next/image";
import { styled } from "../../stitches.config";
import DisplaySpeed from "./DisplaySpeed";
import RunToggle from "./RunToggle";
import DebugToggle from "./DebugToggle";
import SoundToggle from "./SoundToggle";


const HeaderItem = styled("div", {
  marginLeft: "0.6rem",
});

const HeaderSpacer = styled("div", {
  marginLeft: "0.6rem",
  flexGrow: 5,
});

export default class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <>
        <Image
          src="/logo.svg"
          alt="Picture of the author"
          width={32}
          height={32}
        />

        <HeaderItem>js86emu</HeaderItem>

        <HeaderSpacer />

        <HeaderItem>
          <RunToggle  />
        </HeaderItem>
        <HeaderItem>
          <DebugToggle />
        </HeaderItem>
        <HeaderItem>
          <SoundToggle />
        </HeaderItem>
        <HeaderItem>
          <DisplaySpeed />
        </HeaderItem>

      </>
    );
  }
}