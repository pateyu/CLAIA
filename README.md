# COMMAND LINE AI Assistant CLAIA 
# Installation & Setup

```bash
npm install
```

create an environment file and add you API key like this:

```bash
API_KEY=
```

```bash
cp .env.example .env
```

To set up as a global command:

1. Run `chmod -x cli.js`
2. Run `npm link` while in the project folder

## Usage

Call `claia "<your prompt>"` from any folder to call OpenAI.



## Writing files

You can write the OpenAI API response to a file using the `-o <filename>` syntax.

### Example:

```bash
CLAIA "make a python program that can ... " -o main.py
```
