import React, {Component} from "react";
import { styled } from "../../stitches.config";
import {SystemContext} from "../../Context";
import {byte2Ascii, hexString32, hexString8} from "../../emu/utils/Debug";

const TableContainer = styled("div", {
  overflow: "scroll",
});

const Table = styled("table", {
  fontSize: "0.9rem",
  borderCollapse: "collapse",
});

const TableBody = styled("tbody", {});

const Row = styled("tr", {
  "&[data-current]": {
    backgroundColor: "$controlActive",
  }
});

const Cell = styled("td", {
  "&:first-child": {
    fontWeight: "bold",
  },
  "&:nth-child(17)": {
    borderRight: "3px double #888888",
  },
  padding: "4px",
});

export default class MemoryTable extends Component {
  static contextType = SystemContext;

  constructor(props) {
    super(props);
    this.initialized = false;
    this.tableRows = 11;
    this.tableColumns = 16;
    this.genSlice = this.genSlice.bind(this);
    this.containerRef = React.createRef();
    this.preventDefault = e => e.preventDefault();

    if (this.tableRows % 2 === 0) {
      throw new Error("Number of rows for memory table must be odd");
    }

    this.state = {
      mem8: [],
    };
  }

  componentDidMount() {
    this.containerRef.current.addEventListener("wheel", this.preventDefault);
    if (this.context.emuReady && !this.initialized && this.props.mem8 !== null) {
      this.init();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.context.emuReady && !this.initialized && this.props.mem8 !== null) {
      this.init();
    }
  }

  componentWillUnmount() {
    this.containerRef.current.removeEventListener("wheel", this.preventDefault);
  }

  init() {
    this.setState({mem8: this.props.mem8});
    this.initialized = true;
  }

  /**
   * Format a group of rows for the memory table
   *
   * @param data
   * @param start
   * @param width
   * @param height
   * @returns {(string|string)[][]}
   */
  genSlice (data, start, width, height) {
    return [...Array(height)].map((v, i) => {
      let a = start + (i * width);
      return [].concat(
        [(a < 0 || a >= this.props.memorySize) ? "-" : hexString32(a)],
        [...Array(width)].map((w, j) => {
          let address = start + ((i * width) + j);
          if (address < 0 || address >= this.props.memorySize ) return "-";
          else return hexString8(data[address]);
        }),
        [(a < 0 || a >= this.props.memorySize) ? ". ".repeat(width) : Array.from(data.slice(a, a + width)).map((u) => byte2Ascii(u)).join(" ")]
      );
    });
  }

  onScroll = (e) => {
    let delta = e.deltaY;
    let newPointer = this.props.memoryPointer + delta;
    if (newPointer > 0 && newPointer < this.props.memorySize) {
      this.props.onMemoryPointerUpdate(newPointer);
    }
  };

  render() {
    // Align start address with the width of the table.
    let offset = this.props.memoryPointer % this.tableColumns;
    let alignedPointer = this.props.memoryPointer - offset;
    let halfSize = Math.floor(((this.tableRows - 1) * this.tableColumns) / 2);
    let halfRows = Math.floor((this.tableRows - 1) / 2);

    let memData = [].concat(
      // First group (before current pointer)
      this.genSlice(
        this.state.mem8,
        alignedPointer - halfSize,
        this.tableColumns,
        halfRows
      ),
      // Current Group (current pointer)
      this.genSlice(
        this.state.mem8,
        alignedPointer,
        this.tableColumns,
        1
      ),
      // Post Group (after current pointer)
      this.genSlice(
        this.state.mem8,
        alignedPointer + this.tableColumns,
        this.tableColumns,
        halfRows
      )
    );

    return (
      <TableContainer
        ref={this.containerRef}
        onWheel={this.onScroll}
      >
        <Table>
          <TableBody>
            {memData.map((x, i) =>
              <Row
                key={`memrow-pre-${i}`}
                {...(i === halfRows && { "data-current": true })}
              >
                {memData[i].map((y, j) =>
                  <Cell key={`memcell-pre-${i}-${j}`}>
                    {memData[i][j]}
                  </Cell>
                )}
              </Row>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}