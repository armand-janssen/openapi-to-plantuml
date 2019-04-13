/* eslint-disable no-console */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const YAML = require('yaml');
const fs = require('fs');
const program = require('commander');
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

let verbose = false;
let extraAttributeDetails = false;

program
  .version('0.1')
  .usage('[options] <inputfile>')
  .option('-d, --details', 'Show extra attribute details')
  .option('-o, --output <output file>', 'The output file for plantuml')
  .option('-m, --markdown <output file>', 'The output file for markdown')
  .option('-v, --verbose', 'Show verbose debug output')
  .parse(process.argv);

if (program.verbose) {
  verbose = true;
}
if (program.details) {
  extraAttributeDetails = true;
}
if (!program.args.length) {
  program.help();
} else {
  const allParsedSchemas = loadYamlFile(program.args[0], extraAttributeDetails, verbose);

  let uml = `@startuml${constants.lineBreak}`;
  for (const schemaIndex in allParsedSchemas) {
    if (Object.prototype.hasOwnProperty.call(allParsedSchemas, schemaIndex)) {
      uml += allParsedSchemas[schemaIndex].toUml();
    }
  }
  uml += `@enduml${constants.lineBreak}`;


  if (program.output !== undefined) {
    fs.writeFileSync(program.output, uml, 'utf8');
  }

  if (program.markdown !== undefined) {
    let md = '';
    for (const schemaIndex in allParsedSchemas) {
      md += allParsedSchemas[schemaIndex].toMarkDown();
    }
    fs.writeFileSync(program.markdown, md, 'utf8');
  }
}
