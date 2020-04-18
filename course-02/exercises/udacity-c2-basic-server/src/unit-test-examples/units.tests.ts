import { add, divide, concat } from './units';

import { expect } from 'chai';
import 'mocha';

describe('add function', () => {

  it('should add two and two', () => {
    const result = add(2,2);
    expect(result).to.equal(4);
  });

  it('should add -2 and two', () => {
    const result = add(-2,2);
    expect(result).to.equal(0);
  });

});

describe('divide', () => {

  it('should divide 6 by 3', () => {
    const result = divide(6,3);
    expect(result).to.equal(2);
  });

  it('should divide 5 and 2', () => {
    const result = divide(5,2);
    expect(result).to.equal(2.5);
  });

  it('should throw an error if div by zero', () => {
    expect(()=>{ concat('blah', '') }).to.throw('empty string')
  });

});

// @TODO try creating a new describe block for the "concat" method
// it should contain an it block for each it statement in the units.ts @TODO.
// don't forget to import the method ;)
describe('concat', () => {

  it('should concat cat and dog', () => {
    const result = concat('cat','dog');
    expect(result).to.equal('catdog');
  });

  it('should concat moon and sun', () => {
    const result = concat('moon','sun');
    expect(result).to.equal('moonsun');
  });

  it('should throw an error if no string to concat', () => {
    expect(()=>{ divide(5,0) }).to.throw('div by 0')
  });

});
