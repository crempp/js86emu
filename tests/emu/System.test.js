import {SystemConfigException} from "../../src/emu/utils/Exceptions";
import System from "../../src/emu/System";


test('undefined config throws', () => {
  expect(() => {
    let system = new System();
  }).toThrowError(SystemConfigException);
});
