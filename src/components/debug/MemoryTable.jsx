import React, {Component} from "react";
import { styled } from "../../stitches.config";
import {SystemContext} from "../../Context";
import {hexString32, hexString8} from "../../emu/utils/Debug";

const Table = styled("table", {
  fontSize: "0.9rem",
  borderCollapse: "collapse",
});

const TableBody = styled("tbody", {

});

const Row = styled("tr", {
  "&[data-current]": {
    backgroundColor: "$controlActive",
  }
});

const Cell = styled("td", {
  "&:first-child": {
    fontWeight: "bold",
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

    if (this.tableRows % 2 === 0) {
      throw new Error("Number of rows for memory table must be odd");
    }

    this.state = {
      mem8: [],
    };
  }

  componentDidMount() {
    if (this.context.emuReady && !this.initialized) {
      this.setState({mem8: this.props.mem8});
      this.initialized = true;
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.context.emuReady && !this.initialized) {
      this.setState({mem8: this.props.mem8});
      this.initialized = true;
    }
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
      return [(a < 0) ? "-" : hexString32(a)].concat(
        [...Array(width)].map((w, j) => {
          let address = start + ((i * width) + j);
          if (address < 0 || address >= this.props.memorySize ) return "-";
          else return hexString8(data[address]);
        }));
    });
  }

  render() {
    console.log("table render", this.props.memoryPointer);
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
    );
  }
}