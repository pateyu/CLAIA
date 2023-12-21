#!/usr/bin/env node
const { program } = require('commander');
const fetchResponseFromOpenAI = require('./openai');
const fs = require('fs');
const path = require('path');

const tempHistoryFilePath = path.join(__dirname, 'temp_history.json');


function initializeHistoryFile() {
    if (!fs.existsSync(tempHistoryFilePath) || fs.readFileSync(tempHistoryFilePath, 'utf8').trim() === '') {
        fs.writeFileSync(tempHistoryFilePath, JSON.stringify([]));
    }
}

initializeHistoryFile();

program
  .name("claia")
  .description("CLI tool to interact with OpenAI")
  .usage("<prompt>")
  .arguments("<prompt...>") 
  .action(async (promptParts) => {
    const prompt = promptParts.join(' '); 
    console.log("Answering...");
    const response = await fetchResponseFromOpenAI(prompt);
    const text = response.trim();
    console.log(text);
  });

program.command('history')
  .description('View the history of questions and answers')
  .action(() => {
    if (fs.existsSync(tempHistoryFilePath)) {
      const history = JSON.parse(fs.readFileSync(tempHistoryFilePath, 'utf8'));
      history.forEach((item, index) => {
        console.log(`Q${index + 1}: ${item.question}`);
        console.log(`A${index + 1}: ${item.answer}\n`);
      });
    } else {
      console.log("No history found.");
    }
  });

program.command('clear')
  .description('Clear the history of questions and answers')
  .action(() => {
    fs.writeFileSync(tempHistoryFilePath, JSON.stringify([]));
    console.log("History has been cleared.");
  });

program.parse(process.argv);
