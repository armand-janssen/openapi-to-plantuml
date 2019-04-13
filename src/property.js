/* eslint-disable no-console */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const { constants } = require('./constants');
const utils = require('./utils');

class Property {
  constructor(name, type, required, details, description, example) {
    this.name = name;
    this.type = type;
    this.required = required;
    this.details = details;
    this.description = description;
    this.example = example;
  }

  static parseProperties(properties, required, extraAttributeDetails, verbose) {
    const parsedProperties = [];

    const relationShips = [];
    const referencedFiles = [];

    for (const propertyIndex in properties) {
      const property = properties[propertyIndex];

      const name = propertyIndex;
      let { type } = property;
      const { description } = property;
      const { example } = property;
      if (verbose) console.log(`***************** processing property :: [${name}] of type ::  [${type}]`);

      // reference to other object, maybe in other file
      if (type == null && property.$ref != null) {
        const reference = property.$ref;
        const referencedFile = reference.match('^.*yaml');
        if (referencedFile != null && referencedFile.length === 1 && !referencedFiles.includes(referencedFile[0])) {
          referencedFiles.push(referencedFile[0]);
        }
        type = name;
        // add relationShip
        console.log(`aja 1: ${relationShips}`);
        relationShips.push(` -- ${utils.lastToken(reference, '/')} : ${name}`);
        console.log(`aja 2: ${relationShips}`);
      } else if (type === 'array') {
        type = 'array[] of ';
        let first = true;

        for (const itemIndex in property.items) {
          const item = property.items[itemIndex];

          if (itemIndex === 'type') {
            // process array of primitives
            type += `${item}s`;
          } else if (itemIndex === '$ref') {
            // process array of specific schema
            if (typeof item === 'string') {
              // add relationShip
              const objectName = utils.lastToken(item, '/');
              relationShips.push(` *-- ${objectName} : ${name}`);

              type += objectName;

              // is it a reference to an external file?
              const referencedFile = item.match('^.*yaml');
              if (referencedFile != null && referencedFile.length === 1 && !referencedFiles.includes(referencedFile[0])) {
                referencedFiles.push(referencedFile[0]);
              }
            }
          } else if (itemIndex === 'anyOf') { // typeof item === 'object') {
            // process anyOf / allOf / oneOf item
            for (const refIndex in item) {
              const reference = item[refIndex].$ref;

              const objectName = utils.lastToken(reference, '/');
              relationShips.push(` *-- ${objectName} : ${name}`);

              if (!first) {
                type += '/';
              }
              first = false;

              type += objectName;

              const referencedFile = reference.match('^.*yaml');
              if (referencedFile != null && referencedFile.length === 1 && !referencedFiles.includes(referencedFile[0])) {
                referencedFiles.push(referencedFile[0]);
              }
            }
          }
        }
      }


      let details = '<';

      if (property.type === 'string') {
        details += property.minLength === undefined ? '' : `${constants.detailStart}minLength:${property.minLength}${constants.detailEnd}`;
        details += property.maxLength === undefined ? '' : `${constants.detailStart}maxLength:${property.maxLength}${constants.detailEnd}`;
        details += property.pattern === undefined ? '' : `${constants.detailStart}pattern:${property.pattern}${constants.detailEnd}`;

        if (property.enum !== undefined) {
          type = 'enum';

          details += constants.detailStart;
          let first = true;
          property.enum.forEach((value) => {
            details += (first ? '' : ', ') + value;
            first = false;
          });
          details += constants.detailEnd;
        } else if (property.format === 'date') {
          type = 'date';
          details += `${constants.detailStart}pattern: yyyy-MM-dd${constants.detailEnd}`;
        } else if (property.format === 'binary') {
          type = 'string [binary]';
        } else if (property.format === 'byte') {
          type = 'string [byte]';
        }
      } else if (property.type === 'number' || property.type === 'integer') {
        details += property.format === undefined ? '' : `${constants.detailStart}format:${property.format}${constants.detailEnd}`;
        details += property.minimum === undefined ? '' : `${constants.detailStart}minimum:${property.minimum}${constants.detailEnd}`;
        details += property.maximum === undefined ? '' : `${constants.detailStart}maximum:${property.maximum}${constants.detailEnd}`;
        details += property.multipleOf === undefined ? '' : `${constants.detailStart}multipleOf:${property.multipleOf}${constants.detailEnd}`;
      } else if (property.type === 'array') {
        details += property.minItems === undefined ? '' : `${constants.detailStart}minItems:${property.minItems}${constants.detailEnd}`;
        details += property.maxItems === undefined ? '' : `${constants.detailStart}maxItems:${property.maxItems}${constants.detailEnd}`;
        details += property.uniqueItems === undefined ? '' : `${constants.detailStart}uniqueItems:${property.uniqueItems}${constants.detailEnd}`;
      }

      details += '>';

      // if no details are added, then clear the brackets
      if (details.length === 2 || !extraAttributeDetails) {
        if (verbose) console.log(`No details for property ${name}`);
        details = '';
      } else if (verbose) console.log(`Details for property ${name}: ${details}`);

      const requiredProperty = (required === undefined ? undefined : required.includes(name));

      parsedProperties.push(new Property(name, type, requiredProperty, details, description, example));
    }

    return [parsedProperties, relationShips, referencedFiles];
  }

  toUml() {
    return `${constants.tab + this.name + (this.required ? ' * ' : '') + constants.colon + this.type} ${this.details}${constants.lineBreak}`;
  }

  toMarkDown() {
    const markDownDetails = (this.details === undefined || this.details === '') ? ' &nbsp; ' : this.details.replace(/\]>/g, '').replace(/<\[/g, '').replace(/:/g, ' : ').replace(/>/g, '')
      .replace(/\]\[/g, '<br/>');
    const markDownDescription = this.description === undefined ? ' &nbsp; ' : this.description.replace(/\n/g, '<br/>').replace(/todo/gi, '<span style="color:red"> **TODO** </span>');
    const markDownExample = this.example === undefined ? ' &nbsp; ' : this.example.toString().replace(/\n/g, '<br/>');
    return constants.mdRowSeperator + this.name
      + constants.mdRowSeperator + (this.required ? ' Y ' : '')
      + constants.mdRowSeperator + this.type
      + constants.mdRowSeperator + markDownDescription
      + constants.mdRowSeperator + markDownDetails
      + constants.mdRowSeperator + markDownExample
      + constants.mdRowSeperator + constants.lineBreak;
  }
}

module.exports = Property;
