import React, {Component} from "react";
import Image from "next/image";
import { css } from "@emotion/react";
import Toggle from "./radix/Toggle";
import DisplaySpeed from "./DisplaySpeed";
import RunToggle from "./RunToggle";
import DebugToggle from "./DebugToggle";

const style = {
  menuItem: css({
    marginLeft: "0.6rem",
  }),
  button: css({
    border: "1px solid white",
    borderRadius: "3px",
    padding: "3px",
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
  }),
  small: css({
    fontSize: "0.7rem",
  }),
};

export default class Menu extends Component {
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

        <div css={css`${style.menuItem};`}>
          js86emu
        </div>

        <div css={css`${style.menuItem}; flex-grow: 5`}></div>

        <RunToggle css={css`${style.menuItem}`} />
        <DebugToggle css={css`${style.menuItem}`} />

        <div css={css`${style.menuItem}; ${style.small};`}>
          <DisplaySpeed />
        </div>
      </>
    );
  }
}