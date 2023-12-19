#!/usr/bin/env node
const { program } = require('commander');
const fetchResponseFromOpenAI = require('./openai');

program
  .name("claia")
  .description("CLI tool to interact with OpenAI")
  .usage("<prompt>")
  .arguments("<prompt>")
  .action(async (prompt) => {
    const response = await fetchResponseFromOpenAI(prompt);
    console.log(response);
  });

program.parse(process.argv);
