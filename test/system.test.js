import System from '../src/jsemu/emu/System'

describe('System class', () => {
  test('instantiates', () => {
    expect(new System('ibmpcjr')).toBeInstanceOf(System);
  });

  test('throws exception without system ID', () => {
    expect( () => {new System()} ).toThrowError('System needs an ID');
  });
});