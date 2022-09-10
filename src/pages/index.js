import React  from "react";
import { styled } from "../stitches.config";
import Emulator from "../components/Emulator";
import Header from "../components/header/Header";
import DebugTabs from "../components/debug/DebugTabs";


const Container = styled("div", {
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
});

const TopRow = styled("div", {
  order: "0",
  flex: "0 0 auto",
  alignSelf: "stretch",
  backgroundColor: "#454545",
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
  padding: "0.3rem",
});

const MiddleRow = styled("div", {
  order: "1",
  flex: "0 1 auto",
  alignSelf: "stretch",

  display: "flex",
  justifyContent: "center",
  backgroundColor: "#454545",

  paddingTop: "1rem",
  paddingBottom: "1rem",
});

const BottomRow = styled("div", {
  order: "2",
  flex: "1 1 auto",
  alignSelf: "stretch",
});

function HomePage() {
  return (
    <>
      <Container>
        <TopRow>
          <Header />
        </TopRow>

        <MiddleRow>
          <Emulator />
          {/*<Emulator config={CodeGolf} />*/}
        </MiddleRow>

        <BottomRow>
          <DebugTabs />
        </BottomRow>
      </Container>
    </>
  );
}

export default HomePage;
