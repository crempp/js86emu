import BSON from 'bson';

export default class State {
  constructor () {

  }

  writeState (state, file) {
    let bson = new BSON();
    let data = bson.serialize(state);

    fs.writeFile(file, data, (err) => {
      if (err) throw err;
    });
  }

  loadState (file) {
    let bson = new BSON();
    let data = fs.readFileSync(file);
    return bson.deserialize(data);
  }

  compareStates (givenState, expectedState) {
    let diff = "";
    let same = true;

    // let reg16 = new Uint16Array(givenState.reg8.buffer);

    let registersWord = {regAX, regBX, regCX, regDX, regSI, regDI, regBP, regSP, regIP, regCS, regDS, regES, regSS};

    if (givenState.cycleCount !== expectedState.cycleCount) {
      same = false;
      diff += "CYCLE COUNT: " + givenState.cycleCount + " (given) != " + expectedState.cycleCount + " (expected)\n";
    }
    if (givenState.addrSeg !== expectedState.addrSeg) {
      same = false;
      diff += "ADDR SEG: " + givenState.addrSeg + " (given) != " + expectedState.addrSeg + " (expected)\n";
    }
    if (givenState.repType !== expectedState.repType) {
      same = false;
      diff += "REP TYPE: " + givenState.repType + " (given) != " + expectedState.repType + " (expected)\n";
    }
    if (givenState.instIPInc !== expectedState.instIPInc) {
      same = false;
      diff += "INST INC IP: " + givenState.instIPInc + " (given) != " + expectedState.instIPInc + " (expected)\n";
    }

    for (let k in givenState.opcode) {
      if (givenState.opcode[k] !== expectedState.opcode[k]) {
        same = false;
        diff += "OPCODE: [" + k + "] " + givenState.opcode[k] + " (given) != " + expectedState.opcode[k] + " (expected)\n";
      }
    }

    // Compare memory addresses
    for (let i = 0; i < givenState.mem16.length; i++) {
      if (givenState.mem16[i] !== expectedState.mem16[i]) {
        same = false;
        diff += "MEM: [" + hexString16(i) + "] " + hexString16(givenState.mem16[i]) + " (given) != " + hexString16(expectedState.mem16[i]) + " (expected)\n";
      }
    }

    // Compare registers
    for (let reg in registersWord) {
      if (givenState.mem16[registersWord[reg]] !== expectedState.mem16[registersWord[reg]]) {
        same = false;
        diff += "REG: [" + reg + "] " + hexString16(givenState.mem16[registersWord[reg]]) + " (given) != " + hexString16(expectedState.mem16[registersWord[reg]]) + " (expected)\n";
      }
    }

    return [same, diff];
  };
}
