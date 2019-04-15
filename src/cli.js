#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const program = require('commander');
const openApiToPlantuml = require('./index.js');

program
  .version('1.0.1')
  .usage('[options] <inputfile>')
  .description('At least 1 output type must be selected: plantuml or markdown!')
  .option('-d, --details', 'Show extra attribute details')
  .option('-p, --plantuml <plantuml file>', 'The output file for plantuml')
  .option('-m, --markdown <markdown file>', 'The output file for markdown')
  .option('-v, --verbose', 'Show verbose debug output')
  .parse(process.argv);

if (!program.args.length || (program.plantuml == null && program.markdown == null)) {
  program.help();
} else {
  console.log('Reading openAPI...');
  const allParsedSchemas = openApiToPlantuml.loadYamlFile(program.args[0], program.details, program.verbose);


  if (program.plantuml !== undefined) {
    console.log('Writing plantuml...');
    const uml = openApiToPlantuml.renderUml(allParsedSchemas);
    fs.writeFileSync(program.plantuml, uml, 'utf8');
  }

  if (program.markdown !== undefined) {
    console.log('Writing markdown...');
    const md = openApiToPlantuml.renderMarkDown(allParsedSchemas);
    fs.writeFileSync(program.markdown, md, 'utf8');
  }
  console.log('Finished!');
}
