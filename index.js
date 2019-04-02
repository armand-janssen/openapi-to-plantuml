const YAML = require('yaml')
const fs = require('fs')
const program = require('commander')

const lineBreak = "\n"
const mdRowSeperator = "| "
const mdHeaderCenterAligned = " :---: "
const mdHeaderLeftAligned = " :--- "
const mdHeaderRightAligned = " ---: "
const tab = "  "
const colon = " : "
const detailStart = "["
const detailEnd = "]"
var allParsedSchemas = []
let verbose = false
let extraAttributeDetails = false

class Property {
  constructor(name, type, required, details, description, example) {
    this.name = name
    this.type = type
    this.required = required
    this.details = details
    this.description = description
    this.example = example
  }

  static parseProperties(properties, required) {

    var parsedProperties = []

    var relationShips = []
    var referencedFiles = []

    for (var propertyIndex in properties) {
      var property = properties[propertyIndex]

      var name = propertyIndex
      var type = property.type
      var description = property.description
      var example = property.example

      if (verbose) console.log("***************** processing property :: [" + name + "] of type ::  [" + type + "]")
      // reference to other object, maybe in other file
      if (type === undefined && property['$ref'] != undefined) {
        var reference = property['$ref']
        var referencedFile = reference.match('^.*yaml')
        if (referencedFile != undefined && referencedFile.length === 1 && !referencedFiles.includes(referencedFile[0])) {
          referencedFiles.push(referencedFile[0])
        }
        type = name
        // add relationShip
        relationShips.push(" -- " + lastToken(reference, '/') + ' : ' + name)
      } else if (type === 'array') {
        var items = property.items
        for (var itemIndex in property.items) {
          var item = property.items[itemIndex]
          if (itemIndex === 'type') {
            type = 'array[] of ' + item + "s"
          }
          else if (itemIndex === '$ref') {
            if (typeof item === 'string') {
              // add relationShip
              let objectName = lastToken(item, '/')
              relationShips.push(" *-- " + objectName + ' : ' + name)

              type = 'array[] of ' + objectName

              // is it a reference to an external file?
              var referencedFile = item.match('^.*yaml')
              if (referencedFile != undefined && referencedFile.length === 1 && !referencedFiles.includes(referencedFile[0])) {
                referencedFiles.push(referencedFile[0])
              }
            }
            else if (typeof item === 'object') {
              item.forEach(ref => {
                var reference = ref["$ref"]
                let objectName = lastToken(reference, '/')
                relationShips.push(" -- " + objectName + ' : ' + name)
                type = 'array[] of ' + objectName

                var referencedFile = reference.match('^.*yaml')
                if (referencedFile.length === 1) {
                  referencedFiles.push(referencedFile[0])
                }
              })
            }
          }
        }
      }

      var details = '<'
      let properyType = property.type
      if (properyType === 'string') {
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
          details += detailStart + 'pattern: YYYY-MM-dd'
        } else if (property.format === 'datetime') {
          type = 'datetime'
          details += detailStart + 'pattern: YYYY-MM-ddTHH:mm:SS'
        } else if (property.format === 'binary') {
          type = 'string [binary]'
        } else if (property.format === 'byte') {
          type = 'string [byte]'
        }
      } else if (properyType === 'number' || properyType === 'integer') {
        details += property.format == undefined ? '' : detailStart + 'format:' + property.format + detailEnd
        details += property.minimum == undefined ? '' : detailStart + 'minimum:' + property.minimum + detailEnd
        details += property.maximum == undefined ? '' : detailStart + 'maximum:' + property.maximum + detailEnd
        details += property.multipleOf == undefined ? '' : detailStart + 'multipleOf:' + property.multipleOf + detailEnd
      } else if (properyType === 'array') {
        details += property.minItems == undefined ? '' : detailStart + 'minItems:' + property.minItems + detailEnd
        details += property.maxItems == undefined ? '' : detailStart + 'maxItems:' + property.maxItems + detailEnd
        details += property.uniqueItems == undefined ? '' : detailStart + 'uniqueItems:' + property.uniqueItems + detailEnd
      }

      details += '>'

      // if no details are added, then clear the brackets
      if (details.length === 2 || !extraAttributeDetails) {
        if (verbose) console.log('No details for property ' + name)
        details = ''
      } else {
        if (verbose) console.log('Details for property ' + name + ': ' + details)
      }


      var requiredProperty = (required == undefined ? undefined : required.includes(name))
      parsedProperties.push(new Property(name, type, requiredProperty, details, description, example))
    }

    return [parsedProperties, relationShips, referencedFiles]
  }

  toUml() {
    return tab + this.name + (this.required ? ' * ' : '') + colon + this.type + " " + this.details + lineBreak
  }

  toMarkDown() {
    var markDownDetails = (this.details == undefined || this.details == '') ? ' &nbsp; ' : this.details.replace(/\]\>/g, '').replace(/\<\[/g, '').replace(/:/g, ' : ').replace(/\>/g, '').replace(/\]\[/g, '<br/>')
    var markDownDescription = this.description == undefined ? ' &nbsp; ' : this.description.replace(/\n/g, "<br/>").replace(/todo/gi, "<span style=\"color:red\"> **TODO** </span>")
    var markDownExample = this.example == undefined ? ' &nbsp; ' : this.example.toString().replace(/\n/g, "<br/>")
    return mdRowSeperator + this.name
      + mdRowSeperator + (this.required ? ' Y ' : '')
      + mdRowSeperator + this.type
      + mdRowSeperator + markDownDescription
      + mdRowSeperator + markDownDetails
      + mdRowSeperator + markDownExample
      + mdRowSeperator + lineBreak
  }
}



class Schema {
  constructor(name, properties, description, relationShips, parent) {
    this.name = name
    this.properties = properties
    this.description = description
    this.relationShips = relationShips
    this.parent = parent
  }

  static parseSchemas(schemas) {
    var allReferencedFiles = []

    for (var schemaIndex in schemas) {
      var schema = schemas[schemaIndex]

      var name = schemaIndex;
      var parent = undefined;
      var description = schema.description;

      if (verbose) console.log("\n\n############################### schema name :: " + name + " ###############################")

      if (schema.allOf != undefined) {
        referencedFiles = this.processInheritance(schema, schemaIndex, schema.allOf)
        if (referencedFiles.length > 0) {
          referencedFiles.forEach(referencedFile => {
            if (!allReferencedFiles.includes(referencedFile)) {
              allReferencedFiles.push(referencedFile)
            }
          })
        }
      } else {
        // parse properties of this schema
        var [parsedProperties, relationShips, referencedFiles] = Property.parseProperties(schema.properties, schema.required)
        if (allParsedSchemas[name] === undefined) {
          allParsedSchemas[name] = new Schema(name, parsedProperties, description, relationShips, parent)
          if (referencedFiles.length > 0) {
            referencedFiles.forEach(referencedFile => {
              if (!allReferencedFiles.includes(referencedFile)) {
                allReferencedFiles.push(referencedFile)
              }
            })
          }
        }
      }
    }
    return allReferencedFiles
  }

  static processInheritance(schema, schemaIndex, allOf) {
    if (verbose) console.log("***************** schema == allOf :: ")
    if (verbose) console.log(allOf)
    var parsedSchemas = []
    var parent = undefined
    var allReferencedFiles = []
    var description = schema.description

    for (var attributeIndex in allOf) {
      var attribute = allOf[attributeIndex]
      if (attribute["$ref"] != undefined) {
        parent = lastToken(attribute["$ref"], '/')
        if (verbose) console.log("***************** parent :: " + parent)
      } else if (attribute["type"] != undefined) {
        var allOfType = attribute["type"]
        if (verbose) console.log("***************** type :: " + allOfType)
        var [parsedProperties, relationShips, referencedFiles] = Property.parseProperties(attribute.properties, attribute.required)
        if (referencedFiles.length > 0) {
          referencedFiles.forEach(referencedFile => {
            if (!allReferencedFiles.includes(referencedFile)) {
              allReferencedFiles.push(referencedFile)
            }
          })
        }
      }
    }
    if (parsedSchemas[schemaIndex] === undefined) {
      allParsedSchemas[schemaIndex] = new Schema(schemaIndex, parsedProperties, description, relationShips, parent)
    }

    return allReferencedFiles
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
        uml += lineBreak + this.name + relationShip + lineBreak
      })
    }

    // uml the parents
    if (this.parent != undefined) {
      uml += this.parent + " <|-- " + this.name + lineBreak
    }
    return uml
  }

  toMarkDown() {
    var md = "# " + this.name + lineBreak
    md += this.description == undefined ? ' &nbsp;' : this.description.replace(/\n/g, "<br/>").replace(/todo/gi, "<span style=\"color:red\"> **TODO** </span>")
    md += lineBreak + lineBreak

    md += lineBreak + mdRowSeperator + " property "
    md += mdRowSeperator + " required "
    md += mdRowSeperator + " type "
    md += mdRowSeperator + " description "
    md += mdRowSeperator + " details "
    md += mdRowSeperator + " example "
    md += mdRowSeperator + lineBreak

    md += mdRowSeperator + mdHeaderLeftAligned  // property
    md += mdRowSeperator + mdHeaderCenterAligned  // required
    md += mdRowSeperator + mdHeaderCenterAligned  // type
    md += mdRowSeperator + mdHeaderLeftAligned // description
    md += mdRowSeperator + mdHeaderLeftAligned // details
    md += mdRowSeperator + mdHeaderLeftAligned // example
    md += mdRowSeperator + lineBreak


    this.properties.forEach(property => {
      md += property.toMarkDown()
    })
    md += lineBreak + lineBreak

    return md
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
        var referencedFiles = Schema.parseSchemas(schemas)

        if (referencedFiles != undefined && referencedFiles.length > 0) {
          referencedFiles.forEach(referencedFile => {
            loadYamlFile("./" + referencedFile)
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
  loadYamlFile(inputFile)

  var uml = "@startuml" + lineBreak
  for (schemaIndex in allParsedSchemas) {
    uml += allParsedSchemas[schemaIndex].toUml()
  }
  uml += "@enduml" + lineBreak


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