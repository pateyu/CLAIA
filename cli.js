const { program } = require("commander");
const { openai } = require("./libraries/openai");
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
      const res = await openai.completion(text);
      console.log(res.data.choices[0].text.trim());

      if (opts.output) {
        WriteToFile(res.data.choices[0].text.trim(), opts.output);
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program.parse(process.argv);
