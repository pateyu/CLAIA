#!/usr/bin/env node
const { program } = require('commander');
const { fetchResponseFromOpenAI, fetchCommandFromOpenAI, fetchResponseForFileOperations } = require('./openai');
const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');

const tempHistoryFilePath = path.join(__dirname, 'temp_history.json');

function initializeHistoryFile() {
    if (!fs.existsSync(tempHistoryFilePath) || fs.readFileSync(tempHistoryFilePath, 'utf8').trim() === '') {
        fs.writeFileSync(tempHistoryFilePath, JSON.stringify([]));
    }
}

initializeHistoryFile();

program
  .option('-r, --read <filename>', 'Read from a file')
  .option('-o, --output <filename>', 'Write to a file');

async function executeCommand(commandParts, rl, isInteractive) {
    const commandPrompt = commandParts.join(' ');
    console.log("Fetching command suggestion...");
    const suggestedCommand = await fetchCommandFromOpenAI(commandPrompt);

    if (suggestedCommand.trim().toLowerCase() === 'error') {
        console.log("No valid command was suggested.");
        return isInteractive ? rl.prompt() : rl.close();
    }

    console.log(`Suggested Command: ${suggestedCommand}`);

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
                console.log(stdout ? `Stdout: ${stdout}` : "Stdout: None");
                if (!isInteractive) {
                    rl.close();
                } else {
                    rl.prompt();
                }
            });
        } else {
            console.log('Command execution cancelled.');
            if (!isInteractive) {
                rl.close();
            } else {
                rl.prompt();
            }
        }
    });
}

function viewHistory() {
    if (fs.existsSync(tempHistoryFilePath)) {
        const history = JSON.parse(fs.readFileSync(tempHistoryFilePath, 'utf8'));
        history.forEach((item, index) => {
            console.log(`Q${index + 1}: ${item.question}`);
            console.log(`A${index + 1}: ${item.answer}\n`);
        });
    } else {
        console.log("No history found.");
    }
}

function clearHistory() {
    fs.writeFileSync(tempHistoryFilePath, JSON.stringify([]));
    console.log("History has been cleared.");
}

function startInteractiveMode() {
  console.clear();
  console.log(chalk.hex('#008080').bold(figlet.textSync('CLAIA', { horizontalLayout: 'full' })));

  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.hex('#008080')('claia> ')
  });

  console.log("Interactive mode. Type 'exit' to leave.");
  rl.prompt();

  rl.on('line', async (line) => {
      if (line.trim() === 'exit') {
          rl.close();
      } else if (line.startsWith('execute') || line.startsWith('ex')) {
          await executeCommand(line.split(' ').slice(1), rl, true);
          rl.prompt();
      } else if (line.trim() === 'clear' || line.trim() === 'clr') {
          clearHistory();
          rl.prompt();
      } else if (line.trim() === 'history' || line.trim() === 'h') {
          viewHistory();
          rl.prompt();
      } else if (line.trim() === 'help') {
          console.log(program.helpInformation());
          rl.prompt();
      } else {
          const args = line.split(' ');
          const readIndex = args.indexOf('-r');
          const writeIndex = args.indexOf('-o');
          const readFilename = readIndex !== -1 ? args[readIndex + 1] : null;
          const writeFilename = writeIndex !== -1 ? args[writeIndex + 1] : null;
          const command = args.filter(arg => !['-r', '-o', readFilename, writeFilename].includes(arg)).join(' ');

          let response;
          if (readFilename || writeFilename) {
              response = await fetchResponseForFileOperations(command, readFilename, writeFilename);
          } else {
              response = await fetchResponseFromOpenAI(command);
          }

          console.log(response);
          rl.prompt();
      }
  }).on('close', () => {
      console.log('Exiting interactive mode.');
      process.exit(0);
  });
}
program
  .name("claia")
  .description("CLI tool to interact with OpenAI")
  .usage("<prompt>")
  .command('interactive')
  .alias("i")
  .description('Enter interactive mode')
  .action(startInteractiveMode);

program.arguments("<prompt...>")
  .action(async (promptParts) => {
    const options = program.opts();
    const prompt = promptParts.join(' '); 

    let response;
    if (options.read || options.output) {
        response = await fetchResponseForFileOperations(prompt, options.read, options.output);
    } else {
        response = await fetchResponseFromOpenAI(prompt);
    }

    console.log(response);
  });

program.command('execute <command...>')
  .description('Execute a shell command suggested by OpenAI')
  .alias("ex")
  .action((commandParts) => executeCommand(commandParts, readline.createInterface({
      input: process.stdin,
      output: process.stdout
  }), false));

program.command('history')
  .description('View the history of questions and answers')
  .alias("h")
  .action(viewHistory);

program.command('clear')
  .description('Clear the history of questions and answers')
  .alias("clr")
  .action(clearHistory);

program.command('help')
  .description('Display help information.')
  .action(() => {
    console.log(program.helpInformation());
  });

program.parse(process.argv);

if (program.args.length === 0) {
    startInteractiveMode();
}
