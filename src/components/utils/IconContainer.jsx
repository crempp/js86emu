import React, {Component} from "react";
import {styled} from "../../stitches.config";

const CenteredContainer = styled("div", {
  // display: "inline-flex",
  // justifyContent: "center",
  // alignContent: "center",
  // flexDirection: "column",
  // height:"100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100px",
  height: "100%",
});

export default class IconContainer extends Component {
  render() {
    return (
      <CenteredContainer>
        {this.props.children}
      </CenteredContainer>
    );
  }
}