const { program } = require("commander");
const { completion } = require("./libraries/openai");
const { WriteToFile } = require("./libraries/writetofile");

program
  .name("cli-assistant")
  .description("CLI tool to interact with OpenAI's API")
  .version("1.0.0");

program
  .command("query <text>")
  .alias("q")
  .description("Send a text query to OpenAI")
  .option("-o, --output <output>", "Output file name")
  .action(async (text, opts) => {
    try {
      const responseText = await completion(text);
      console.log(responseText);

      if (opts.output) {
        WriteToFile(responseText, opts.output);
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program.parse(process.argv);
