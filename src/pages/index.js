import React  from "react";
import { css } from "@emotion/react";
import Emulator from "../components/Emulator";
import Menu from "../components/Menu";
import * as Tabs from "@radix-ui/react-tabs";
import ControlTabs from "../components/ControlTabs";


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

    paddingTop: "1rem",
    paddingBottom: "1rem",
  }),
  bottomRow: css({
    order: "0",
    flex: "1 1 auto",
    alignSelf: "stretch",
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
          <ControlTabs />
        </div>
      </div>
    </>
  );
}

export default HomePage;
