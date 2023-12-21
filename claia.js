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
    const text = response.trim();
    console.log(text);
  });

program.parse(process.argv);
