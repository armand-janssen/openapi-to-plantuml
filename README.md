# OpenAPI to PlantUML

[![Coverage Status](https://coveralls.io/repos/github/armand-janssen/openapi-to-plantuml/badge.svg?branch=master)](https://coveralls.io/github/armand-janssen/openapi-to-plantuml?branch=master)

[![Build Status](https://travis-ci.org/armand-janssen/openapi-to-plantuml.svg?branch=master)](https://travis-ci.org/armand-janssen/openapi-to-plantuml)

This tool creates a [PlantUML Class Diagram](http://plantuml.com/class-diagram) from a **OpenApi 3 Yaml** specification

# Requirements
- OpenAPI 3.0.2
- OpenAPI specification should be in **YAML**
- [NodeJS](http://nodejs.org)
- All yaml files should be in 1 directory

# Usage
Always run the script from the directory in which the yaml file are.
```
Usage: index [options] <inputfile>

Options:
  -V, --version                   output the version number
  -p, --plantuml <plantuml file>  The plantuml file
  -v, --verbose                    Show verbose debug output
  -h, --help                       output usage information
```
## Example
**Prints to plantuml **
```
openapi-to-plantuml vehicle.yaml --plantuml vehicle.plantuml
```
**Prints to plantuml with verbose debug info :)**
```
openapi-to-plantuml vehicle.yaml --verbose --plantuml vehicle.plantuml
```

**Prints to plantuml file and markdown file**
```
openapi-to-plantuml vehicle.yaml --plantuml ./example.plantuml --markdown ./example.md
```
# Example output plantuml

## No details
![Example no details](https://raw.githubusercontent.com/armand-janssen/openapi-to-plantuml/master/example/example-no-details.png)

## Details
![Example with details](https://raw.githubusercontent.com/armand-janssen/openapi-to-plantuml/master/example/example-details.png)


# TODO
- refactor / cleanup code
- test loading the openapi yaml, instead of the vehicle.yaml
- add OpenAPI version validation
