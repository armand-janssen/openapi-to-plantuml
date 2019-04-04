const YAML = require('yaml')
const fs = require('fs')
const program = require('commander')
const Schema = require('./schema')
const utils = require('./utils')()
const constants = require('./constants').constants

function loadYamlFile(file, extraAttributeDetails, verbose) {
  if (verbose) console.log("***************** processing file :: " + file)
  let allParsedSchemas = []

  let loadedFile = fs.readFileSync(file, 'UTF-8')
  let myYaml = YAML.parse(loadedFile)

  if (myYaml != undefined) {
    if (myYaml.components != undefined) {
      if (myYaml.components.schemas != undefined) {
        schemas = myYaml.components.schemas
        var [referencedFiles, parsedSchemas] = Schema.parseSchemas(schemas, extraAttributeDetails, verbose)

        addValuesOfArrayToOtherArrayIfNotExist(parsedSchemas,allParsedSchemas)

        if (referencedFiles != undefined && referencedFiles.length > 0) {
          for(var referencedFileIndex in referencedFiles) {
            var parsedSchemas = loadYamlFile("./" + referencedFiles[referencedFileIndex])

            addValuesOfArrayToOtherArrayIfNotExist(parsedSchemas,allParsedSchemas)
          }
        }
      }
    }
  }
  return allParsedSchemas
}


function lastToken(value, token) {
  var xs = value.split(token);
  return xs.length > 1 ? xs.pop() : null;
}

var inputFilename = undefined
let verbose = false
let extraAttributeDetails = false

program
  .version('0.1')
  .usage('[options] <inputfile>')
  .option('-d, --details', 'Show extra attribute details')
  .option('-o, --output <output file>', 'The output file for plantuml')
  .option('-m, --markdown <output file>', 'The output file for markdown')
  .option('-v, --verbose', 'Show verbose debug output')
  .parse(process.argv)

if (program.verbose) {
  verbose = true
}
if (program.details) {
  extraAttributeDetails = true
}
if (!program.args.length) {
  program.help();

} else {

  inputFile = program.args[0]
  let allParsedSchemas = loadYamlFile(inputFile, extraAttributeDetails, verbose)

  var uml = "@startuml" + constants.lineBreak
  for (schemaIndex in allParsedSchemas) {
    uml += allParsedSchemas[schemaIndex].toUml()
  }
  uml += "@enduml" + constants.lineBreak


  if (program.output != undefined) {
    fs.writeFileSync(program.output, uml, 'utf8')
  }

  if (program.markdown != undefined) {
    var md = ""
    for (schemaIndex in allParsedSchemas) {
      md += allParsedSchemas[schemaIndex].toMarkDown()
    }
    fs.writeFileSync(program.markdown, md, 'utf8')
  }
}