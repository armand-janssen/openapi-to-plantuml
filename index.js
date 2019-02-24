const YAML = require('yaml')
const fs = require('fs')
const program = require('commander')

const lineBreak = "\n"
const tab = "  "
const colon = " : "
const detailStart = "["
const detailEnd = "]"
var allParsedSchemas = []
let verbose = false
let extraAttributeDetails = false

class Property {
  constructor(name, type, required, details) {
    this.name = name
    this.type = type
    this.required = required
    this.details = details
  }

  static parseProperties(properties, required) {

    var parsedProperties = []

    var relationShips = []
    var referencedFiles = []

    for (var propertyIndex in properties) {
      var property = properties[propertyIndex]

      var name = propertyIndex
      var type = property.type

      if (verbose) console.log("***************** processing property :: [" + name + "] of type ::  [" + type + "]")
      if (type === 'array') {
        var items = property.items
        for (var itemIndex in property.items) {
          var item = property.items[itemIndex]
          if (typeof item === 'string') {
            // add relationShip
            relationShips.push(lastToken(item, '/') + ' : ' + name)

            // is it a reference to an external file?
            var referencedFile = item.match('^.*yaml')
            if (referencedFile != undefined && referencedFile.length === 1) {
              referencedFiles.push(referencedFile[0])
            }
          }
          else if (typeof item === 'object') {
            item.forEach(ref => {
              var reference = ref["$ref"]
              relationShips.push(lastToken(reference, '/') + ' : ' + name)

              var referencedFile = reference.match('^.*yaml')
              if (referencedFile.length === 1) {
                referencedFiles.push(referencedFile[0])
              }
            })
          }
        }
      }

      var details = '<'
       
        if (type === 'string') {
          details += property.minLength == undefined ? '' : detailStart + 'minLength:' + property.minLength + detailEnd
          details += property.maxLength == undefined ? '' : detailStart + 'maxLength:' + property.maxLength + detailEnd
          details += property.pattern == undefined ? '' : detailStart + 'pattern:' + property.pattern + detailEnd

          if (property.enum != undefined) {
            type = 'enum'

            details += detailStart
            var first = true
            property.enum.forEach(value => {
              details += (first ? '' : ', ') + value
              first = false
            })
            details += detailEnd
          } else if (property.format === 'date') {
            type = 'date'
            details += detailStart + 'pattern: YYYY-mm-dd'
          } else if (property.format === 'datetime') {
            type = 'datetime'
            details += detailStart + 'pattern: YYYY-mm-ddTHH:MM:SS'
          }
        } else if (type === 'number' || type === 'integer') {
          details += property.format == undefined ? '' : detailStart + 'format:' + property.format + detailEnd
          details += property.minimum == undefined ? '' : detailStart + 'minimum:' + property.minimum + detailEnd
          details += property.maximum == undefined ? '' : detailStart + 'maximum:' + property.maximum + detailEnd
          details += property.multipleOf == undefined ? '' : detailStart + 'multipleOf:' + property.multipleOf + detailEnd
        } else if (type === 'array') {
          details += property.minItems == undefined ? '' : detailStart + 'minItems:' + property.minItems + detailEnd
          details += property.maxItems == undefined ? '' : detailStart + 'maxItems:' + property.maxItems + detailEnd
          details += property.uniqueItems == undefined ? '' : detailStart + 'uniqueItems:' + property.uniqueItems + detailEnd
        }

        details += '>'
      
      // if no details are added, then clear the brackets
      if (details.length === 1 || !extraAttributeDetails) {
        details = ''
      }
      var requiredProperty = (required == undefined ? undefined : required.includes(name))
      parsedProperties.push(new Property(name, type, requiredProperty, details))
    }

    return [parsedProperties, relationShips, referencedFiles]
  }

  toUml() {
    return tab + this.name + (this.required ? ' * ' : '') + colon + this.type + " " + this.details + lineBreak
  }
}



class Schema {
  constructor(name, properties, relationShips, parent) {
    this.name = name
    this.properties = properties
    this.relationShips = relationShips
    this.parent = parent
  }
  static parseSchemas(schemas) {
    var parsedSchemas = []
    var allReferencedFiles = []

    for (var schemaIndex in schemas) {
      var schema = schemas[schemaIndex]

      var name = schemaIndex;
      var parent = undefined;
      if (verbose) console.log("\n\n############################### schema name :: " + name + " ###############################")

      if (schema.allOf != undefined) {
        referencedFiles = this.processInheritance(schema, schemaIndex, schema.allOf)
        allReferencedFiles.push(referencedFiles)

      } else {
        // parse properties of this schema
        var [parsedProperties, relationShips, referencedFiles] = Property.parseProperties(schema.properties, schema.required)
        if (parsedSchemas[name] === undefined) {
          allParsedSchemas[name] = new Schema(name, parsedProperties, relationShips, parent)
          allReferencedFiles.push(referencedFiles)

        }
      }

    }
    return [parsedSchemas, referencedFiles]
  }

  static processInheritance(schema, schemaIndex, allOf) {
    if (verbose) console.log("***************** schema == allOf :: ")
    if (verbose) console.log(allOf)
    var parsedSchemas = []
    var parent = undefined
    var properties = undefined

    for (var attributeIndex in allOf) {
      var attribute = allOf[attributeIndex]
      if (attribute["$ref"] != undefined) {
        parent = lastToken(attribute["$ref"], '/')
        if (verbose) console.log("***************** parent :: " + parent)
      } else if (attribute["type"] != undefined) {
        var allOfType = attribute["type"]
        if (verbose) console.log("***************** type :: " + allOfType)
        var [parsedProperties, relationShips, referencedFiles] = Property.parseProperties(attribute.properties, attribute.required)
        properties = parsedProperties

      }

    }
    // var [parsedProperties, relationShips, referencedFiles] = Property.parseProperties(schema.properties, schemaIndex)

    if (parsedSchemas[schemaIndex] === undefined) {
      allParsedSchemas[schemaIndex] = new Schema(schemaIndex, parsedProperties, relationShips, parent)
    }

    return referencedFiles
  }

  toUml() {
    // uml the class + properties
    var uml = lineBreak + "class " + this.name + " {" + lineBreak
    this.properties.forEach(property => {
      uml += property.toUml()
    })
    uml += "}" + lineBreak

    // uml the relation ships
    if (this.relationShips != undefined) {
      this.relationShips.forEach(relationShip => {
        uml += lineBreak + this.name + " *-- " + relationShip + lineBreak
      })
    }

    // uml the parents
    if (this.parent != undefined) {
      uml += this.parent + " <|-- " + this.name + lineBreak
    }
    return uml
  }

}

function loadYamlFile(file) {
  if (verbose) console.log("***************** processing file :: " + file)

  var loadedFile = fs.readFileSync(file, 'UTF-8')
  var myYaml = YAML.parse(loadedFile)

  if (myYaml != undefined) {
    if (myYaml.components != undefined) {
      if (myYaml.components.schemas != undefined) {
        schemas = myYaml.components.schemas
        var [parsedSchemas, referencedFiles] = Schema.parseSchemas(schemas)

        if (referencedFiles != undefined) {
          referencedFiles.forEach(referencedFile => {
            loadYamlFile(referencedFile)
          })
        }

      }
    }
  }
}

function lastToken(value, token) {
  var xs = value.split(token);
  return xs.length > 1 ? xs.pop() : null;
}

// var verbose = undefined
var inputFilename = undefined

program
  .version('0.1')
  .usage('[options] <inputfile>')
  .option('-d, --details', 'Show extra attribute details')
  .option('-o, --output <output file>', 'The output file')
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
  loadYamlFile(inputFile)

  var uml = "@startuml" + lineBreak
  for (schemaIndex in allParsedSchemas) {
    uml += allParsedSchemas[schemaIndex].toUml()
  }
  uml += "@enduml" + lineBreak

  console.log(uml)

  if (program.output != undefined) {
    fs.writeFileSync(program.output, uml, 'utf8')
  }
}