'use strict';

const { assert, expect } = require('chai');
const YAML = require('yaml')
const Mocha = require('mocha');
const fs = require('fs')
const Property = require('../property')

function getTestData(testYamlFile) {
  var loadedFile = fs.readFileSync(testYamlFile, 'UTF-8')
  return YAML.parse(loadedFile)
}

describe('test uml generation for properties', () => {
  let testData = getTestData('./test/propertyTestPropertiesNoRelationShipsNoReferencesToOtherFiles.yaml')

  let properties = testData.components.schemas.owner.properties
  let required = []
  let extraAttributeDetails = true
  let verbose = false;

  let arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose)
  assert.isTrue(arrayUnderTest != undefined)
  it("Reponse is array of 4 sub-arrays of which only first one contains data", () => {
    assert.equal(arrayUnderTest.length, 3)
    assert.equal(arrayUnderTest[0].length, 6)
    assert.equal(arrayUnderTest[1].length, 0)
    assert.equal(arrayUnderTest[2].length, 0)
  })

  it("test generation of planuml config for properties", () => {
    let expectedUml = '  name : string <[maxLength:30]>\n';
    assert.equal(arrayUnderTest[0][0].toUml(), expectedUml)
    
    expectedUml = '  from : date <[pattern: YYYY-mm-dd]>\n';
    assert.equal(arrayUnderTest[0][1].toUml(), expectedUml)

    expectedUml = '  to : date <[pattern: YYYY-mm-dd]>\n';
    assert.equal(arrayUnderTest[0][2].toUml(), expectedUml)

    expectedUml = '  age : integer <[minimum:15][maximum:120][multipleOf:1]>\n';
    assert.equal(arrayUnderTest[0][3].toUml(), expectedUml)

    expectedUml = '  nicknames : array[] of strings <[minItems:1][maxItems:5][uniqueItems:true]>\n';
    assert.equal(arrayUnderTest[0][4].toUml(), expectedUml)

    expectedUml = '  gender : enum <[male, female]>\n';
    assert.equal(arrayUnderTest[0][5].toUml(), expectedUml)
  })

})

describe('test markdown generation for properties', () => {
  let testData = getTestData('./test/propertyTestPropertiesNoRelationShipsNoReferencesToOtherFiles.yaml')

  let properties = testData.components.schemas.owner.properties
  let required = []
  let extraAttributeDetails = true
  let verbose = false;

  let arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose)
  assert.isTrue(arrayUnderTest != undefined)
  it("Reponse is array of 4 sub-arrays of which only first one contains data", () => {
    assert.equal(arrayUnderTest.length, 3)
    assert.equal(arrayUnderTest[0].length, 6)
    assert.equal(arrayUnderTest[1].length, 0)
    assert.equal(arrayUnderTest[2].length, 0)
  })

  it("test generation of planuml config for properties", () => {
    let expectedUml = '| name| | string| the name of the owner| maxLength : 30| John Doe| \n';
    assert.equal(arrayUnderTest[0][0].toMarkDown(), expectedUml)
    
    expectedUml = '| from| | date| the date the owner, bought the vehicle| pattern :  YYYY-mm-dd| 2018-08-24| \n';
    assert.equal(arrayUnderTest[0][1].toMarkDown(), expectedUml)

    expectedUml = '| to| | date| the date the owner, sold the vehicle| pattern :  YYYY-mm-dd| 2019-07-28| \n';
    assert.equal(arrayUnderTest[0][2].toMarkDown(), expectedUml)

    expectedUml = '| age| | integer| the age of the owner| minimum : 15<br/>maximum : 120<br/>multipleOf : 1| 23| \n';
    assert.equal(arrayUnderTest[0][3].toMarkDown(), expectedUml)

    expectedUml = '| nicknames| | array[] of strings| the nicknames of the owner| minItems : 1<br/>maxItems : 5<br/>uniqueItems : true|  &nbsp; | \n';
    assert.equal(arrayUnderTest[0][4].toMarkDown(), expectedUml)

    expectedUml = '| gender| | enum| the gender of the owner| male, female|  &nbsp; | \n';
    assert.equal(arrayUnderTest[0][5].toMarkDown(), expectedUml)
  })

})
describe('parseProperties no required, including details, not verbose', () => {
  let testData = getTestData('./test/propertyTestPropertiesNoRelationShipsNoReferencesToOtherFiles.yaml')

  let properties = testData.components.schemas.owner.properties
  let required = []
  let extraAttributeDetails = true
  let verbose = false;

  let arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose)
  assert.isTrue(arrayUnderTest != undefined)
  it("Reponse is array of 4 sub-arrays of which only first one contains data", () => {
    assert.equal(arrayUnderTest.length, 3)
    assert.equal(arrayUnderTest[0].length, 6)
    assert.equal(arrayUnderTest[1].length, 0)
    assert.equal(arrayUnderTest[2].length, 0)
  })
  it("Check first property: name", () => {
    assertPropertyName(arrayUnderTest[0][0], false, '<[maxLength:30]>')
  })
  it("Check second property: from", () => {
    assertPropertyFrom(arrayUnderTest[0][1], false, '<[pattern: YYYY-mm-dd]>')
  })

  it("Check third property: to", () => {
    assertPropertyTo(arrayUnderTest[0][2], false, '<[pattern: YYYY-mm-dd]>')
  })

  it("Check fourth property: age", () => {
    assertPropertyAge(arrayUnderTest[0][3], false, '<[minimum:15][maximum:120][multipleOf:1]>')
  })
  it("Check fifth property: nicknames", () => {
    assertPropertyNicknames(arrayUnderTest[0][4], false, '<[minItems:1][maxItems:5][uniqueItems:true]>')
  })
  it("Check sixed property: gender", () => {
    assertPropertyGender(arrayUnderTest[0][5], false, '<[male, female]>')
  })

});

describe('parseFourProperties including required, no details, not verbose', () => {
  let testData = getTestData('./test/propertyTestPropertiesNoRelationShipsNoReferencesToOtherFiles.yaml')

  let properties = testData.components.schemas.owner.properties
  let required = testData.components.schemas.owner.required
  let extraAttributeDetails = false
  let verbose = false;

  let arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose)
  assert.isTrue(arrayUnderTest != undefined)
  it("Reponse is array of 4 sub-arrays of which only first one contains data", () => {
    assert.equal(arrayUnderTest.length, 3)
    assert.equal(arrayUnderTest[0].length, 6)
    assert.equal(arrayUnderTest[1].length, 0)
    assert.equal(arrayUnderTest[2].length, 0)
  })
  it("Check first property: name", () => {
    assertPropertyName(arrayUnderTest[0][0], true, '')
  })
  it("Check second property: from", () => {
    assertPropertyFrom(arrayUnderTest[0][1], true, '')
  })

  it("Check third property: to", () => {
    assertPropertyTo(arrayUnderTest[0][2], false, '')
  })
  it("Check fourth property: age", () => {
    assertPropertyAge(arrayUnderTest[0][3], true, '')
  })
  it("Check fifth property: nicknames", () => {
    assertPropertyNicknames(arrayUnderTest[0][4], false, '')
  })
});

function assertPropertyName(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'name')
  assert.equal(property.type, 'string')
  assert.equal(property.required, expectedRequired)
  assert.equal(property.details, expectedDetails)
  assert.equal(property.description, 'the name of the owner')
  assert.equal(property.example, 'John Doe')
}

function assertPropertyFrom(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'from')
  assert.equal(property.type, 'date')
  assert.equal(property.required, expectedRequired)
  assert.equal(property.details, expectedDetails)
  assert.equal(property.description, 'the date the owner, bought the vehicle')
  assert.equal(property.example, '2018-08-24')

}
function assertPropertyTo(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'to')
  assert.equal(property.type, 'date')
  assert.equal(property.required, expectedRequired)
  assert.equal(property.details, expectedDetails)
  assert.equal(property.description, 'the date the owner, sold the vehicle')
  assert.equal(property.example, '2019-07-28')
}
function assertPropertyAge(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'age')
  assert.equal(property.type, 'integer')
  assert.equal(property.required, expectedRequired)
  assert.equal(property.details, expectedDetails)
  assert.equal(property.description, 'the age of the owner')
  assert.equal(property.example, '23')
}

function assertPropertyNicknames(property, expectedRequired, expectedDetails) {
  assert.equal(property .name, 'nicknames')
  assert.equal(property.type, 'array[] of strings')
  assert.equal(property.required, expectedRequired)
  assert.equal(property.details, expectedDetails)
  assert.equal(property.description, 'the nicknames of the owner')
  assert.equal(property.example, undefined)
}

function assertPropertyGender(property, expectedRequired, expectedDetails) {
  assert.equal(property .name, 'gender')
  assert.equal(property.type, 'enum')
  assert.equal(property.required, expectedRequired)
  assert.equal(property.details, expectedDetails)
  assert.equal(property.description, 'the gender of the owner')
  assert.equal(property.example, undefined)
}

describe('parseTwoProperties containting 1 relationship in the same file including required, no details, not versbose', () => {
  let testData = getTestData('./test/propertyTestTwoPropertiesOneRelationShipsNoReferencesToOtherFiles.yaml')

  let properties = testData.components.schemas.owner.properties
  let required = testData.components.schemas.owner.required
  let extraAttributeDetails = false
  let verbose = false;

  let arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose)
  assert.isTrue(arrayUnderTest != undefined)
  it("Reponse is array of 4 sub-arrays of which the first one contains properties and the second one the ", () => {
    assert.equal(arrayUnderTest.length, 3)
    assert.equal(arrayUnderTest[0].length, 2) // properties
    assert.equal(arrayUnderTest[1].length, 1) // relation ships
    assert.equal(arrayUnderTest[2].length, 0) // external files
  })
  it("Check first property: name", () => {
    let property = arrayUnderTest[0][0]
    assert.equal(property.name, 'name')
    assert.equal(property.type, 'string')
    assert.equal(property.required, false)
    assert.equal(property.details, '')
    assert.equal(property.description, 'the name of the owner')
    assert.equal(property.example, 'John Doe')
  })
  it("Check first relationship: partner", () => {
    let relationShip = arrayUnderTest[1][0]
    assert.equal(relationShip, ' -- partner : partner');
  })
})

describe('parseThreeProperties containting 2 relationship in the same file and other file including required, no details, not versbose', () => {
  let testData = getTestData('./test/propertyTestTwoPropertiesTwoRelationShipsOneReferencesToOtherFiles.yaml')

  let properties = testData.components.schemas.owner.properties
  let required = testData.components.schemas.owner.required
  let extraAttributeDetails = false
  let verbose = false;

  let arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose)
  assert.isTrue(arrayUnderTest != undefined)
  it("Reponse is array of 4 sub-arrays of which the first one contains properties and the second one the ", () => {
    assert.equal(arrayUnderTest.length, 3)
    assert.equal(arrayUnderTest[0].length, 3) // properties
    assert.equal(arrayUnderTest[1].length, 2) // relation ships
    assert.equal(arrayUnderTest[2].length, 1) // external files
  })
  it("Check first property: name", () => {
    let property = arrayUnderTest[0][0]
    assert.equal(property.name, 'name')
    assert.equal(property.type, 'string')
    assert.equal(property.required, false)
    assert.equal(property.details, '')
    assert.equal(property.description, 'the name of the owner')
    assert.equal(property.example, 'John Doe')
  })
  it("Check second property: name", () => {
    let property = arrayUnderTest[0][1]
    assert.equal(property.name, 'partner')
    assert.equal(property.type, 'partner')
    assert.equal(property.required, true)
    assert.equal(property.details, '')
    assert.equal(property.description, 'partner of the owner')
    assert.equal(property.example, undefined)
  })
  it("Check third property: name", () => {
    let property = arrayUnderTest[0][2]
    assert.equal(property.name, 'children')
    assert.equal(property.type, 'array[] of child')
    assert.equal(property.required, false)
    assert.equal(property.details, '')
    assert.equal(property.description, 'children of the owner')
    assert.equal(property.example, undefined)
  })
  it("Check first relationship: partner", () => {
    let relationShip = arrayUnderTest[1][0]
    assert.equal(relationShip, ' -- partner : partner');
  })
  it("Check second relationship: child", () => {
    let relationShip = arrayUnderTest[1][1]
    assert.equal(relationShip, ' *-- child : children');
  })
  it("Check external file: child", () => {
    let file = arrayUnderTest[2][0]
    assert.equal(file, 'child.yaml');
  })
})
