const { assert } = require('chai');
const YAML = require('yaml');
// const Mocha = require('mocha');
const fs = require('fs');
const Property = require('../src/property');

function getTestData(testYamlFile) {
  const loadedFile = fs.readFileSync(testYamlFile, 'UTF-8');
  return YAML.parse(loadedFile);
}


function assertPropertyName(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'name');
  assert.equal(property.type, 'string');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, 'the name of the owner');
  assert.equal(property.example, 'John Doe');
}

function assertPropertyFrom(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'from');
  assert.equal(property.type, 'date');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, 'the date the owner, bought the vehicle');
  assert.equal(property.example, '2018-08-24');
}
function assertPropertyTo(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'to');
  assert.equal(property.type, 'date');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, 'the date the owner, sold the vehicle\n');
  assert.equal(property.example, '2019-07-28');
}
function assertPropertyAge(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'age');
  assert.equal(property.type, 'integer');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, 'the age of the owner\n\nTODO\nHowto determine age?\n');
  assert.equal(property.example, '23');
}

function assertPropertyNicknames(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'nicknames');
  assert.equal(property.type, 'array[] of strings');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, 'the nicknames of the owner');
  assert.equal(property.example, undefined);
}

function assertPropertyGender(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'gender');
  assert.equal(property.type, 'enum');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, 'the gender of the owner');
  assert.equal(property.example, undefined);
}
function assertPropertyFile1(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'file1');
  assert.equal(property.type, 'string [binary]');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, undefined);
  assert.equal(property.example, undefined);
}
function assertPropertyFile2(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'file2');
  assert.equal(property.type, 'string [byte]');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, 'the second file');
  assert.equal(property.example, undefined);
}
function assertPropertyShoeSize(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'shoeSize');
  assert.equal(property.type, 'integer');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, undefined);
  assert.equal(property.example, undefined);
}
function assertPropertySomeDouble(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'someDouble');
  assert.equal(property.type, 'integer');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, undefined);
  assert.equal(property.example, undefined);
}
function assertPropertyPipe(property, expectedRequired, expectedDetails) {
  assert.equal(property.name, 'pipe');
  assert.equal(property.type, 'string');
  assert.equal(property.required, expectedRequired);
  assert.equal(property.details, expectedDetails);
  assert.equal(property.description, undefined);
  assert.equal(property.example, undefined);
}

describe('test uml generation for properties', () => {
  const testData = getTestData('./test/resources/propertyTestPropertiesNoRelationShipsNoReferencesToOtherFiles.yaml');

  const { properties } = testData.components.schemas.owner;
  const { required } = testData.components.schemas.owner;
  const extraAttributeDetails = true;
  const verbose = true;

  const arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose);
  assert.isDefined(arrayUnderTest);
  it('Reponse is array of 4 sub-arrays of which only first one contains data', () => {
    assert.equal(arrayUnderTest.length, 3);
    assert.equal(arrayUnderTest[0].length, 11);
    assert.equal(arrayUnderTest[1].length, 0);
    assert.equal(arrayUnderTest[2].length, 0);
  });

  it('test generation of plantuml config for properties', () => {
    let expectedUml = '  name *  : string <[minLength:1][maxLength:30]>\n';
    assert.equal(arrayUnderTest[0][0].toUml(), expectedUml);

    expectedUml = '  from *  : date <[pattern: yyyy-MM-dd]>\n';
    assert.equal(arrayUnderTest[0][1].toUml(), expectedUml);

    expectedUml = '  to : date <[pattern: yyyy-MM-dd]>\n';
    assert.equal(arrayUnderTest[0][2].toUml(), expectedUml);

    expectedUml = '  age *  : integer <[minimum:15][maximum:120][multipleOf:1]>\n';
    assert.equal(arrayUnderTest[0][3].toUml(), expectedUml);

    expectedUml = '  nicknames : array[] of strings <[minItems:1][maxItems:5][uniqueItems:true]>\n';
    assert.equal(arrayUnderTest[0][4].toUml(), expectedUml);

    expectedUml = '  gender : enum <[male, female]>\n';
    assert.equal(arrayUnderTest[0][5].toUml(), expectedUml);

    expectedUml = '  file1 : string [binary] \n';
    assert.equal(arrayUnderTest[0][6].toUml(), expectedUml);

    expectedUml = '  file2 : string [byte] \n';
    assert.equal(arrayUnderTest[0][7].toUml(), expectedUml);

    expectedUml = '  shoeSize : integer \n';
    assert.equal(arrayUnderTest[0][8].toUml(), expectedUml);

    expectedUml = '  someDouble : integer <[format:double]>\n';
    assert.equal(arrayUnderTest[0][9].toUml(), expectedUml);

    expectedUml = '  pipe : string <[pattern:^(nl|NL|Nederland)$]>\n';
    assert.equal(arrayUnderTest[0][10].toUml(), expectedUml);
  });
});

describe('test markdown generation for properties', () => {
  const testData = getTestData('./test/resources/propertyTestPropertiesNoRelationShipsNoReferencesToOtherFiles.yaml');

  const { properties } = testData.components.schemas.owner;
  const { required } = testData.components.schemas.owner;
  const extraAttributeDetails = true;
  const verbose = false;

  const arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose);
  assert.isDefined(arrayUnderTest);
  it('Reponse is array of 4 sub-arrays of which only first one contains data', () => {
    assert.equal(arrayUnderTest.length, 3);
    assert.equal(arrayUnderTest[0].length, 11);
    assert.equal(arrayUnderTest[1].length, 0);
    assert.equal(arrayUnderTest[2].length, 0);
  });

  it('test generation of planuml config for properties', () => {
    let expectedMarkDown = '| name|  Y | string| the name of the owner| minLength : 1<br/>maxLength : 30| John Doe| \n';
    assert.equal(arrayUnderTest[0][0].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| from|  Y | date| the date the owner, bought the vehicle| pattern :  yyyy-MM-dd| 2018-08-24| \n';
    assert.equal(arrayUnderTest[0][1].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| to| | date| the date the owner, sold the vehicle<br/>| pattern :  yyyy-MM-dd| 2019-07-28| \n';
    assert.equal(arrayUnderTest[0][2].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| age|  Y | integer| the age of the owner<br/><br/><span style="color:red"> **TODO** </span><br/>Howto determine age?<br/>| minimum : 15<br/>maximum : 120<br/>multipleOf : 1| 23| \n';
    assert.equal(arrayUnderTest[0][3].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| nicknames| | array[] of strings| the nicknames of the owner| minItems : 1<br/>maxItems : 5<br/>uniqueItems : true|  &nbsp; | \n';
    assert.equal(arrayUnderTest[0][4].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| gender| | enum| the gender of the owner| male, female|  &nbsp; | \n';
    assert.equal(arrayUnderTest[0][5].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| file1| | string [binary]|  &nbsp; |  &nbsp; |  &nbsp; | \n';
    assert.equal(arrayUnderTest[0][6].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| file2| | string [byte]| the second file|  &nbsp; |  &nbsp; | \n';
    assert.equal(arrayUnderTest[0][7].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| shoeSize| | integer|  &nbsp; |  &nbsp; |  &nbsp; | \n';
    assert.equal(arrayUnderTest[0][8].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| someDouble| | integer|  &nbsp; | format : double|  &nbsp; | \n';
    assert.equal(arrayUnderTest[0][9].toMarkDown(), expectedMarkDown);

    expectedMarkDown = '| pipe| | string|  &nbsp; | pattern : ^(nl\\|NL\\|Nederland)$|  &nbsp; | \n';
    assert.equal(arrayUnderTest[0][10].toMarkDown(), expectedMarkDown);
  });
});

describe('parseProperties no required, including details, not verbose', () => {
  const testData = getTestData('./test/resources/propertyTestPropertiesNoRelationShipsNoReferencesToOtherFiles.yaml');

  const { properties } = testData.components.schemas.owner;
  const required = [];
  const extraAttributeDetails = true;
  const verbose = false;

  const arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose);
  assert.isDefined(arrayUnderTest);
  it('Reponse is array of 4 sub-arrays of which only first one contains data', () => {
    assert.equal(arrayUnderTest.length, 3);
    assert.equal(arrayUnderTest[0].length, 11);
    assert.equal(arrayUnderTest[1].length, 0);
    assert.equal(arrayUnderTest[2].length, 0);
  });
  it('Check first property: name', () => {
    assertPropertyName(arrayUnderTest[0][0], false, '<[minLength:1][maxLength:30]>');
  });
  it('Check second property: from', () => {
    assertPropertyFrom(arrayUnderTest[0][1], false, '<[pattern: yyyy-MM-dd]>');
  });
  it('Check third property: to', () => {
    assertPropertyTo(arrayUnderTest[0][2], false, '<[pattern: yyyy-MM-dd]>');
  });
  it('Check fourth property: age', () => {
    assertPropertyAge(arrayUnderTest[0][3], false, '<[minimum:15][maximum:120][multipleOf:1]>');
  });
  it('Check fifth property: nicknames', () => {
    assertPropertyNicknames(arrayUnderTest[0][4], false, '<[minItems:1][maxItems:5][uniqueItems:true]>');
  });
  it('Check sixed property: gender', () => {
    assertPropertyGender(arrayUnderTest[0][5], false, '<[male, female]>');
  });
  it('Check seventh property: file1', () => {
    assertPropertyFile1(arrayUnderTest[0][6], false, '');
  });
  it('Check eigth property: file2', () => {
    assertPropertyFile2(arrayUnderTest[0][7], false, '');
  });
  it('Check ninth property: shoeSize', () => {
    assertPropertyShoeSize(arrayUnderTest[0][8], false, '');
  });
  it('Check tenth property: someDouble', () => {
    assertPropertySomeDouble(arrayUnderTest[0][9], false, '<[format:double]>');
  });
  it('Check eleventh property: pipe', () => {
    assertPropertyPipe(arrayUnderTest[0][10], false, '<[pattern:^(nl|NL|Nederland)$]>');
  });
});

describe('parseFourProperties including required, no details, not verbose', () => {
  const testData = getTestData('./test/resources/propertyTestPropertiesNoRelationShipsNoReferencesToOtherFiles.yaml');

  const { properties } = testData.components.schemas.owner;
  const { required } = testData.components.schemas.owner;
  const extraAttributeDetails = false;
  const verbose = false;

  const arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose);
  assert.isDefined(arrayUnderTest);
  it('Reponse is array of 4 sub-arrays of which only first one contains data', () => {
    assert.equal(arrayUnderTest.length, 3);
    assert.equal(arrayUnderTest[0].length, 11);
    assert.equal(arrayUnderTest[1].length, 0);
    assert.equal(arrayUnderTest[2].length, 0);
  });
  it('Check first property: name', () => {
    assertPropertyName(arrayUnderTest[0][0], true, '');
  });
  it('Check second property: from', () => {
    assertPropertyFrom(arrayUnderTest[0][1], true, '');
  });
  it('Check third property: to', () => {
    assertPropertyTo(arrayUnderTest[0][2], false, '');
  });
  it('Check fourth property: age', () => {
    assertPropertyAge(arrayUnderTest[0][3], true, '');
  });
  it('Check fifth property: nicknames', () => {
    assertPropertyNicknames(arrayUnderTest[0][4], false, '');
  });
  it('Check sixed property: gender', () => {
    assertPropertyGender(arrayUnderTest[0][5], false, '');
  });
  it('Check seventh property: file1', () => {
    assertPropertyFile1(arrayUnderTest[0][6], false, '');
  });
  it('Check eigth property: file2', () => {
    assertPropertyFile2(arrayUnderTest[0][7], false, '');
  });
  it('Check ninth property: shoeSize', () => {
    assertPropertyShoeSize(arrayUnderTest[0][8], false, '');
  });
  it('Check tenth property: someDouble', () => {
    assertPropertySomeDouble(arrayUnderTest[0][9], false, '');
  });
  it('Check eleventh property: pipe', () => {
    assertPropertyPipe(arrayUnderTest[0][10], false, '');
  });
});

describe('parseTwoProperties containting 1 relationship in the same file including required, no details, not versbose', () => {
  const testData = getTestData('./test/resources/propertyTestTwoPropertiesOneRelationShipsNoReferencesToOtherFiles.yaml');

  const { properties } = testData.components.schemas.owner;
  const { required } = testData.components.schemas.owner;
  const extraAttributeDetails = false;
  const verbose = false;

  const arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose);
  assert.isDefined(arrayUnderTest);
  it('Reponse is array of 4 sub-arrays of which the first one contains properties and the second one the ', () => {
    assert.equal(arrayUnderTest.length, 3);
    assert.equal(arrayUnderTest[0].length, 2); // properties
    assert.equal(arrayUnderTest[1].length, 1); // relation ships
    assert.equal(arrayUnderTest[2].length, 0); // external files
  });
  it('Check first property: name', () => {
    const property = arrayUnderTest[0][0];
    assert.equal(property.name, 'name');
    assert.equal(property.type, 'string');
    assert.equal(property.required, false);
    assert.equal(property.details, '');
    assert.equal(property.description, 'the name of the owner');
    assert.equal(property.example, 'John Doe');
  });
  it('Check first relationship: partner', () => {
    const relationShip = arrayUnderTest[1][0];
    assert.equal(relationShip, ' -- partner : partner');
  });
});

describe('parseThreeProperties containting 2 relationship in the same file and other file including required, no details, not versbose', () => {
  const testData = getTestData('./test/resources/propertyTestTwoPropertiesTwoRelationShipsOneReferencesToOtherFiles.yaml');

  const { properties } = testData.components.schemas.owner;
  const { required } = testData.components.schemas.owner;
  const extraAttributeDetails = false;
  const verbose = false;

  const arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose);
  assert.isDefined(arrayUnderTest);
  it('Reponse is array of 4 sub-arrays of which the first one contains properties and the second one the ', () => {
    assert.equal(arrayUnderTest.length, 3);
    assert.equal(arrayUnderTest[0].length, 3); // properties
    assert.equal(arrayUnderTest[1].length, 2); // relation ships
    assert.equal(arrayUnderTest[2].length, 1); // external files
  });
  it('Check first property: name', () => {
    const property = arrayUnderTest[0][0];
    assert.equal(property.name, 'name');
    assert.equal(property.type, 'string');
    assert.equal(property.required, false);
    assert.equal(property.details, '');
    assert.equal(property.description, 'the name of the owner');
    assert.equal(property.example, 'John Doe');
  });
  it('Check second property: partner', () => {
    const property = arrayUnderTest[0][1];
    assert.equal(property.name, 'partner');
    assert.equal(property.type, 'partner');
    assert.equal(property.required, true);
    assert.equal(property.details, '');
    assert.equal(property.description, 'partner of the owner');
    assert.equal(property.example, undefined);
  });
  it('Check third property: children', () => {
    const property = arrayUnderTest[0][2];
    assert.equal(property.name, 'children');
    assert.equal(property.type, 'array[] of child');
    assert.equal(property.required, false);
    assert.equal(property.details, '');
    assert.equal(property.description, 'children of the owner');
    assert.equal(property.example, undefined);
  });
  it('Check first relationship: partner', () => {
    const relationShip = arrayUnderTest[1][0];
    assert.equal(relationShip, ' -- partner : partner');
  });
  it('Check second relationship: child', () => {
    const relationShip = arrayUnderTest[1][1];
    assert.equal(relationShip, ' *-- child : children');
  });
  it('Check external file: child', () => {
    const file = arrayUnderTest[2][0];
    assert.equal(file, 'child.yaml');
  });
});
describe('parse Four Properties containting 1 relationship in the same file and 2 in 2 other files including required, no details, not versbose', () => {
  const testData = getTestData('./test/resources/propertyTestPropertiesRelationShipsTwoReferencesToOtherFiles.yaml');

  const { properties } = testData.components.schemas.owner;
  const { required } = testData.components.schemas.owner;
  const extraAttributeDetails = false;
  const verbose = false;

  const arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose);
  assert.isDefined(arrayUnderTest);
  it('Reponse is array of 4 sub-arrays of which the first one contains properties and the second one the ', () => {
    assert.equal(arrayUnderTest.length, 3);
    assert.equal(arrayUnderTest[0].length, 4); // properties
    assert.equal(arrayUnderTest[1].length, 3); // relation ships
    assert.equal(arrayUnderTest[2].length, 2); // external files
  });
  it('Check first property: name', () => {
    const property = arrayUnderTest[0][0];
    assert.equal(property.name, 'name');
    assert.equal(property.type, 'string');
    assert.equal(property.required, false);
    assert.equal(property.details, '');
    assert.equal(property.description, 'the name of the owner');
    assert.equal(property.example, 'John Doe');
  });
  it('Check second property: partner', () => {
    const property = arrayUnderTest[0][1];
    assert.equal(property.name, 'partner');
    assert.equal(property.type, 'partner');
    assert.equal(property.required, true);
    assert.equal(property.details, '');
    assert.equal(property.description, 'partner of the owner');
    assert.equal(property.example, undefined);
  });
  it('Check third property: children', () => {
    const property = arrayUnderTest[0][2];
    assert.equal(property.name, 'children');
    assert.equal(property.type, 'array[] of child');
    assert.equal(property.required, false);
    assert.equal(property.details, '');
    assert.equal(property.description, 'children of the owner');
    assert.equal(property.example, undefined);
  });
  it('Check third property: parents', () => {
    const property = arrayUnderTest[0][3];
    assert.equal(property.name, 'parents');
    assert.equal(property.type, 'array[] of parent');
    assert.equal(property.required, false);
    assert.equal(property.details, '');
    assert.equal(property.description, 'parents of the owner');
    assert.equal(property.example, undefined);
  });
  it('Check first relationship: partner', () => {
    const relationShip = arrayUnderTest[1][0];
    assert.equal(relationShip, ' -- partner : partner');
  });

  it('Check second relationship: child', () => {
    const relationShip = arrayUnderTest[1][1];
    assert.equal(relationShip, ' *-- child : children');
  });
  it('Check external file: child', () => {
    const file = arrayUnderTest[2][0];
    assert.equal(file, 'child.yaml');
  });

  it('Check third relationship: parent', () => {
    const relationShip = arrayUnderTest[1][2];
    assert.equal(relationShip, ' *-- parent : parents');
  });
  it('Check external file: parent', () => {
    const file = arrayUnderTest[2][1];
    assert.equal(file, 'parent.yaml');
  });
});

describe('parse  Properties containting 1 relationship in the same file and 3 in 2 other files including required, no details, not versbose', () => {
  const testData = getTestData('./test/resources/propertyTestPropertiesRelationShipAnyOfReferencesToOtherFiles.yaml');

  const { properties } = testData.components.schemas.owner;
  const { required } = testData.components.schemas.owner;
  const extraAttributeDetails = false;
  const verbose = false;

  const arrayUnderTest = Property.parseProperties(properties, required, extraAttributeDetails, verbose);
  assert.isDefined(arrayUnderTest);
  it('Check response from parseProperties', () => {
    assert.equal(arrayUnderTest.length, 3);
    assert.equal(arrayUnderTest[0].length, 2); // properties
    assert.equal(arrayUnderTest[1].length, 5); // relation ships
    assert.equal(arrayUnderTest[2].length, 2); // external files
  });
  it('Check property: child', () => {
    const property = arrayUnderTest[0][0];
    assert.equal(property.name, 'child');
    assert.equal(property.type, 'child');
    assert.equal(property.required, undefined);
    assert.equal(property.details, '');
    assert.equal(property.description, undefined);
    assert.equal(property.example, undefined);
  });
  it('Check property: family', () => {
    const property = arrayUnderTest[0][1];
    assert.equal(property.name, 'family');
    assert.equal(property.type, 'array[] of partner/father/mother/child');
    assert.equal(property.required, undefined);
    assert.equal(property.details, '');
    assert.equal(property.description, 'family of the owner');
    assert.equal(property.example, undefined);
  });

  it('Check relationship: child', () => {
    const relationShip = arrayUnderTest[1][0];
    assert.equal(relationShip, ' -- child : child');
  });
  it('Check relationship: partner', () => {
    const relationShip = arrayUnderTest[1][1];
    assert.equal(relationShip, ' *-- partner : family');
  });

  it('Check relationship: father', () => {
    const relationShip = arrayUnderTest[1][2];
    assert.equal(relationShip, ' *-- father : family');
  });
  it('Check relationship: mother', () => {
    const relationShip = arrayUnderTest[1][3];
    assert.equal(relationShip, ' *-- mother : family');
  });
  it('Check relationship: child', () => {
    const relationShip = arrayUnderTest[1][4];
    assert.equal(relationShip, ' *-- child : family');
  });

  it('Check external file: child', () => {
    const file = arrayUnderTest[2][0];
    assert.equal(file, 'child.yaml');
  });

  it('Check external file: parent', () => {
    const file = arrayUnderTest[2][1];
    assert.equal(file, 'parent.yaml');
  });
});
