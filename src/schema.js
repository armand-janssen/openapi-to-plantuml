"use strict"
const Property = require('./property')
const constants = require('./constants').constants
const utils = require('./utils')()

class Schema {
    constructor(name, properties, description, relationShips, parent) {
        this.name = name
        this.properties = properties
        this.description = description
        this.relationShips = relationShips
        this.parent = parent
    }

    static parseSchemas(schemas, extraAttributeDetails, verbose) {
        let allReferencedFiles = []
        let allParsedSchemas = []

        for (var schemaIndex in schemas) {
            var schema = schemas[schemaIndex]

            var name = schemaIndex;
            var parent = undefined;
            var description = schema.description;

            if (verbose) console.log("\n\n############################### schema name :: " + name + " ###############################")

            if (schema.allOf != undefined) {
                var [referencedFiles, parsedSchemas] = this.processInheritance(schema, schemaIndex, schema.allOf, extraAttributeDetails, verbose)

                addValuesOfArrayToOtherArrayIfNotExist(parsedSchemas, allParsedSchemas)
                addValuesOfArrayToOtherArrayIfNotExist(referencedFiles, allReferencedFiles)
            } else {
                // parse properties of this schema
                var [parsedProperties, relationShips, referencedFiles] = Property.parseProperties(schema.properties, schema.required, extraAttributeDetails, verbose)
                if (allParsedSchemas[name] === undefined) {
                    allParsedSchemas[name] = new Schema(name, parsedProperties, description, relationShips, parent)

                    addValuesOfArrayToOtherArrayIfNotExist(referencedFiles, allReferencedFiles)
                }
            }
        }
        return [allReferencedFiles, allParsedSchemas]
    }

    static processInheritance(schema, schemaIndex, allOf, extraAttributeDetails, verbose) {
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
                var [parsedProperties, relationShips, referencedFiles] = Property.parseProperties(attribute.properties, attribute.required, extraAttributeDetails, verbose)
                addValuesOfArrayToOtherArrayIfNotExist(referencedFiles, allReferencedFiles)
            }
        }
        if (parsedSchemas[schemaIndex] === undefined) {
            parsedSchemas[schemaIndex] = new Schema(schemaIndex, parsedProperties, description, relationShips, parent)
        }

        return [allReferencedFiles, parsedSchemas]
    }

    toUml() {
        // uml the class + properties
        var uml = constants.lineBreak + "class " + this.name + " {" + constants.lineBreak
        this.properties.forEach(property => {
            uml += property.toUml()
        })
        uml += "}" + constants.lineBreak

        // uml the relation ships
        if (this.relationShips != undefined) {
            this.relationShips.forEach(relationShip => {
                uml += constants.lineBreak + this.name + relationShip + constants.lineBreak
            })
        }

        // uml the parents
        if (this.parent != undefined) {
            uml += this.parent + " <|-- " + this.name + constants.lineBreak
        }
        return uml
    }

    toMarkDown() {
        var md = "# " + this.name + constants.lineBreak
        md += this.description == undefined ? ' &nbsp;' : this.description.replace(/\n/g, "<br/>").replace(/todo/gi, "<span style=\"color:red\"> **TODO** </span>")
        md += constants.lineBreak + constants.lineBreak

        md += constants.lineBreak + constants.mdRowSeperator + " property "
        md += constants.mdRowSeperator + " required "
        md += constants.mdRowSeperator + " type "
        md += constants.mdRowSeperator + " description "
        md += constants.mdRowSeperator + " details "
        md += constants.mdRowSeperator + " example "
        md += constants.mdRowSeperator + constants.lineBreak

        md += constants.mdRowSeperator + constants.mdHeaderLeftAligned  // property
        md += constants.mdRowSeperator + constants.mdHeaderCenterAligned  // required
        md += constants.mdRowSeperator + constants.mdHeaderCenterAligned  // type
        md += constants.mdRowSeperator + constants.mdHeaderLeftAligned // description
        md += constants.mdRowSeperator + constants.mdHeaderLeftAligned // details
        md += constants.mdRowSeperator + constants.mdHeaderLeftAligned // example
        md += constants.mdRowSeperator + constants.lineBreak


        this.properties.forEach(property => {
            md += property.toMarkDown()
        })
        md += constants.lineBreak + constants.lineBreak

        return md
    }
}

module.exports = Schema