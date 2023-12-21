#!/usr/bin/env node
const { program } = require('commander');
const { fetchResponseFromOpenAI, fetchCommandFromOpenAI } = require('./openai');
const { exec } = require('child_process');
const readline = require('readline');
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


  program.command('execute <command...>')
  .description('Execute a shell command suggested by OpenAI')
  .alias("ex")
  .action(async (commandParts) => {
    const commandPrompt = commandParts.join(' ');
    console.log("Fetching command suggestion...");
    const suggestedCommand = await fetchCommandFromOpenAI(commandPrompt);
    
    if (suggestedCommand.trim().toLowerCase() === 'error') {
      console.log("No valid command was suggested.");
      return;
    }

    console.log(`Suggested Command: ${suggestedCommand}`);
  
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Do you want to execute this command? (yes/no): ', (answer) => {
      if (answer.toLowerCase() === 'yes') {
        console.log('Executing command...');
        exec(suggestedCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
          }
          if (stdout) {
            console.log(`Stdout: ${stdout}`);
          } else {
            console.log("Stdout: None");
          }
          console.log("Successfully executed");
        });
      } else {
        console.log('Command execution cancelled.');
      }
      rl.close();
    });
  });

program.command('history')
  .description('View the history of questions and answers')
  .alias("h")
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
  .alias("clr")
  .action(() => {
    fs.writeFileSync(tempHistoryFilePath, JSON.stringify([]));
    console.log("History has been cleared.");
  });

program.command('help')
  .description('Display help information.')
  .action(() => {
    program.help();
  });

program.parse(process.argv);
