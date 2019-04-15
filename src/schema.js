/* eslint-disable no-console */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */

const Property = require('./property');
const { constants } = require('./constants');
const utils = require('./utils');

class Schema {
  constructor(name, properties, description, relationShips, parent) {
    this.name = name;
    this.properties = properties;
    this.description = description;
    this.relationShips = relationShips;
    this.parent = parent;
  }

  static parseSchemas(schemas, extraAttributeDetails, verbose) {
    const allReferencedFiles = [];
    const allParsedSchemas = [];

    for (const schemaIndex in schemas) {
      const schema = schemas[schemaIndex];

      const name = schemaIndex;
      const parent = undefined;
      const { description } = schema;

      if (verbose) console.log(`\n\n############################### schema name :: ${name} ###############################`);

      if (schema.allOf !== undefined) {
        const [referencedFiles, parsedSchemas] = this.processInheritance(schema, schemaIndex, schema.allOf, extraAttributeDetails, verbose);

        utils.addValuesOfArrayToOtherArrayIfNotExist(parsedSchemas, allParsedSchemas);
        utils.addValuesOfArrayToOtherArrayIfNotExist(referencedFiles, allReferencedFiles);
      } else {
        // parse properties of this schema
        const [parsedProperties, relationShips, referencedFiles] = Property.parseProperties(schema.properties, schema.required, extraAttributeDetails, verbose);
        if (allParsedSchemas[name] === undefined) {
          allParsedSchemas[name] = new Schema(name, parsedProperties, description, relationShips, parent);

          utils.addValuesOfArrayToOtherArrayIfNotExist(referencedFiles, allReferencedFiles);
        }
      }
    }
    return [allReferencedFiles, allParsedSchemas];
  }

  static processInheritance(schema, schemaIndex, allOf, extraAttributeDetails, verbose) {
    if (verbose) console.log('***************** schema === allOf :: ');
    if (verbose) console.log(allOf);
    const parsedSchemas = [];
    let parent;
    const allReferencedFiles = [];
    const { description } = schema;

    for (const attributeIndex in allOf) {
      const attribute = allOf[attributeIndex];
      if (attribute.$ref !== undefined) {
        parent = utils.lastToken(attribute.$ref, '/');
        if (verbose) console.log(`***************** parent :: ${parent}`);
      } else if (attribute.type !== undefined) {
        const allOfType = attribute.type;
        if (verbose) console.log(`***************** type :: ${allOfType}`);
        const [parsedProperties, relationShips, referencedFiles] = Property.parseProperties(attribute.properties, attribute.required, extraAttributeDetails, verbose);
        utils.addValuesOfArrayToOtherArrayIfNotExist(referencedFiles, allReferencedFiles);

        // deze heb ik twee haakjes naar boven geschoven
        if (parsedSchemas[schemaIndex] === undefined) {
          parsedSchemas[schemaIndex] = new Schema(schemaIndex, parsedProperties, description, relationShips, parent);
        }
      }
    }

    return [allReferencedFiles, parsedSchemas];
  }

  toUml() {
    // uml the class + properties
    let uml = `${constants.lineBreak}class ${this.name} {${constants.lineBreak}`;
    this.properties.forEach((property) => {
      uml += property.toUml();
    });
    uml += `}${constants.lineBreak}`;

    // uml the relation ships
    if (this.relationShips !== undefined) {
      this.relationShips.forEach((relationShip) => {
        uml += constants.lineBreak + this.name + relationShip + constants.lineBreak;
      });
    }

    // uml the parents
    if (this.parent !== undefined) {
      uml += `${this.parent} <|-- ${this.name}${constants.lineBreak}`;
    }
    return uml;
  }

  toMarkDown() {
    let md = `# ${this.name}${constants.lineBreak}`;
    md += this.description === undefined ? ' &nbsp;' : this.description.replace(/\n/g, '<br/>').replace(/todo/gi, '<span style="color:red"> **TODO** </span>');
    md += constants.lineBreak + constants.lineBreak;

    md += `${constants.lineBreak + constants.mdRowSeperator} property `;
    md += `${constants.mdRowSeperator} required `;
    md += `${constants.mdRowSeperator} type `;
    md += `${constants.mdRowSeperator} description `;
    md += `${constants.mdRowSeperator} details `;
    md += `${constants.mdRowSeperator} example `;
    md += constants.mdRowSeperator + constants.lineBreak;

    md += constants.mdRowSeperator + constants.mdHeaderLeftAligned; // property
    md += constants.mdRowSeperator + constants.mdHeaderCenterAligned; // required
    md += constants.mdRowSeperator + constants.mdHeaderCenterAligned; // type
    md += constants.mdRowSeperator + constants.mdHeaderLeftAligned; // description
    md += constants.mdRowSeperator + constants.mdHeaderLeftAligned; // details
    md += constants.mdRowSeperator + constants.mdHeaderLeftAligned; // example
    md += constants.mdRowSeperator + constants.lineBreak;


    this.properties.forEach((property) => {
      md += property.toMarkDown();
    });
    md += constants.lineBreak + constants.lineBreak;

    return md;
  }
}

module.exports = Schema;
