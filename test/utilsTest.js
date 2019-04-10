'use strict';

const { assert, expect } = require('chai');
const utils = require('../src/utils')()

describe('test add to array if not exists', () => {
  let myArray = new Array();
  myArray.push("Sarah")
  myArray.push("John")

  it("Test adding new value is only added if not already present", ()=> {
    addValueToArrayIfNotExists(myArray, 'Kyle' )
    addValueToArrayIfNotExists(myArray, 'Sarah' )
    assert.equal(myArray.length, 3)
    assert.equal(myArray[0], 'Sarah')
    assert.equal(myArray[1], 'John')
    assert.equal(myArray[2], 'Kyle')
  })
})  
describe('test add array to array if value not exists', () => {
  let sourceArray = new Array();
  sourceArray.push("Kyle")
  sourceArray.push("Sarah")

  let targetArray = new Array();
  targetArray.push("Sarah")
  targetArray.push("John")


  it("Test adding new value is only added if not already present", ()=> {
    addValuesOfArrayToOtherArrayIfNotExist(sourceArray, targetArray )
    assert.equal(targetArray.length, 3)
    assert.equal(targetArray[0], 'Sarah')
    assert.equal(targetArray[1], 'John')
    assert.equal(targetArray[2], 'Kyle')
  })
})  
describe('test add array to array if targetArray is empty', () => {
  let sourceArray = new Array();
  sourceArray.push("Kyle")
  sourceArray.push("Sarah")

  let targetArray = new Array();


  it("Test adding new value is only added if not already present", ()=> {
    addValuesOfArrayToOtherArrayIfNotExist(sourceArray, targetArray )
    assert.equal(targetArray.length, 2)
    assert.equal(targetArray[0], 'Kyle')
    assert.equal(targetArray[1], 'Sarah')
  })
})  