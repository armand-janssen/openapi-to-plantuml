/* eslint-disable no-console */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const YAML = require('yaml');
const fs = require('fs');
const Schema = require('./schema');
const utils = require('./utils');
const { constants } = require('./constants');

function loadYamlFile(file, extraAttributeDetails, verbose) {
  if (verbose) console.log(`***************** processing file :: ${file}`);
  const allParsedSchemas = [];

  const loadedFile = fs.readFileSync(file, 'UTF-8');
  const myYaml = YAML.parse(loadedFile);

  if (myYaml !== undefined) {
    if (myYaml.components !== undefined) {
      if (myYaml.components.schemas !== undefined) {
        const { schemas } = myYaml.components;
        const [referencedFiles, parsedSchemas] = Schema.parseSchemas(schemas, extraAttributeDetails, verbose);

        utils.addValuesOfArrayToOtherArrayIfNotExist(parsedSchemas, allParsedSchemas);

        if (referencedFiles !== undefined && referencedFiles.length > 0) {
          for (const referencedFileIndex in referencedFiles) {
            const referencedParsedSchemas = loadYamlFile(`./${referencedFiles[referencedFileIndex]}`, extraAttributeDetails, verbose);

            utils.addValuesOfArrayToOtherArrayIfNotExist(referencedParsedSchemas, allParsedSchemas);
          }
        }
      }
    }
  }
  return allParsedSchemas;
}

function renderUml(allParsedSchemas) {
  let uml = `@startuml${constants.lineBreak}`;
  for (const schemaIndex in allParsedSchemas) {
    if (Object.prototype.hasOwnProperty.call(allParsedSchemas, schemaIndex)) {
      uml += allParsedSchemas[schemaIndex].toUml();
    }
  }
  uml += `@enduml${constants.lineBreak}`;
  return uml;
}

function renderMarkDown(allParsedSchemas) {
  let md = '';
  for (const schemaIndex in allParsedSchemas) {
    md += allParsedSchemas[schemaIndex].toMarkDown();
  }
  return md;
}
module.exports = { loadYamlFile, renderUml, renderMarkDown };
