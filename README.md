# OpenAPI to PlantUML

This tool creates a [PlantUML Class Diagram](http://plantuml.com/class-diagram) from a **OpenApi 3 Yaml** specification

# Requirements
- OpenAPI 3.0.2
- OpenAPI specification should be in **YAML**
- [NodeJS](http://nodejs.org)

# Usage

```
Usage: index [options] <inputfile>

Options:
  -V, --version               output the version number
  -o, --output <output file>  The output file
  -v, --verbose               Show verbose debug output
  -h, --help                  output usage information
```
## Example
**Prints to standard output**
```
node index.js example/vehicle.yaml
```
**Prints to standard output with verbose debug info :)**
```
node index.js example/vehicle.yaml --verbose 
```

**Prints to standard output and outputfile**
```
node index.js example/vehicle.yaml --output ./example.plantuml
```

# TODO
- add command line option to show/hide details of attributes
- refactor / cleanup code
