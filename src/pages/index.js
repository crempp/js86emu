import React  from "react";
import { css } from "@emotion/react";
import Emulator from "../components/Emulator";

import Menu from "../components/Menu";


const pageLayoutCss = {
  self: css({
    height: "100%",
    width: "100%",
    padding: "0",
    margin: "0",
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    alignContent: "stretch",
    alignItems: "flex-start",
  }),
  topRow: css({
    order: "0",
    flex: "0 0 auto",
    alignSelf: "stretch",
    backgroundColor: "#454545",
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    padding: "0.3rem",
  }),
  middleRow: css({
    order: "0",
    flex: "0 1 auto",
    alignSelf: "stretch",

    display: "flex",
    justifyContent: "center",
    backgroundColor: "#454545",
  }),
  bottomRow: css({
    order: "0",
    flex: "1 1 auto",
    alignSelf: "stretch",
    backgroundColor: "hotpink",
  }),


};

function HomePage() {
  return (
    <>
      <div css={pageLayoutCss.self}>
        <div css={pageLayoutCss.topRow}>
          <Menu />
        </div>

        <div css={pageLayoutCss.middleRow}>
          <Emulator />
          {/*<Emulator config={CodeGolf} />*/}
        </div>

        <div css={pageLayoutCss.bottomRow}>
          BOTTOM
        </div>
      </div>
    </>
  );
}

export default HomePage;
