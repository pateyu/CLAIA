const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { openaiApiKey } = require('./config');
const os = require('os');
const platform = os.platform();

const tempHistoryFilePath = path.join(__dirname, 'temp_history.json');

async function fetchResponseFromOpenAI(prompt) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
    };

    let history = [];
    if (fs.existsSync(tempHistoryFilePath)) {
        history = JSON.parse(fs.readFileSync(tempHistoryFilePath, 'utf8'));
    }

    const messages = history.map(item => {
        return [{ role: 'user', content: item.question }, 
                { role: 'assistant', content: item.answer }];
    }).flat();

    messages.push({ role: 'user', content: prompt });

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 150
        }, { headers: headers });

        const aiResponse = response.data.choices[0].message.content.trim();
        saveToTempHistory(prompt, aiResponse); 
        return aiResponse;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function fetchCommandFromOpenAI(prompt) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
    };

    const messages = [{
        role: 'system',
        content: `Only generate a shell command to: ${prompt} for this ${platform}, do not say anything that is not a shell command. If no shell command exists say "Error"`
    }];

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 50 
        }, { headers: headers });

        const aiResponse = response.data.choices[0].message.content.trim();
        saveToTempHistory(prompt, aiResponse);
        return aiResponse;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function fetchResponseForFileOperations(userCommand, inputFile, outputFile) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
    };

    let prompt = userCommand;
    let fileContent = "";
    let maxTokens = outputFile ? 250 : 150;  
    if (inputFile) {
        fileContent = fs.readFileSync(inputFile, 'utf8');
        prompt += "\nFile Content: " + fileContent;
    }

    let systemMessage = `Perform task: ${userCommand}.`;
    if (inputFile) {
        systemMessage += ` Read from file: ${inputFile}. Some tasks that involve reading a file can be tasks such as summarizing stories/pages in short sentences, or understanding the requirements of a complex project.`;
    }
    if (outputFile) {
        systemMessage += ` Output to file: ${outputFile}. Outputting a task can be used to write code or creating notes.The response will be directly outputted into a file. For code, all non-code comments should be commented.`;
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{
                role: 'system',
                content: systemMessage
            }, {
                role: 'user',
                content: prompt
            }],
            max_tokens: maxTokens
        }, { headers: headers });

        let aiResponse = response.data.choices[0].message.content.trim();

        if (outputFile) {
            fs.writeFileSync(outputFile, aiResponse, { flag: 'w' });
        }

        let historyResponse;
        if (inputFile && !outputFile) {
            historyResponse = "File read.\n" + aiResponse;  
        } else if (inputFile && outputFile) {
            historyResponse = "File read and file outputted.";
        } else if (outputFile) {
            historyResponse = "File outputted.";
        } else {
            historyResponse = aiResponse;
        }

        saveToTempHistory(userCommand, historyResponse);
        return historyResponse;

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return "Error occurred during file operation.";
    }
}




function saveToTempHistory(question, answer) {
    let history = [];
    if (fs.existsSync(tempHistoryFilePath)) {
        history = JSON.parse(fs.readFileSync(tempHistoryFilePath, 'utf8'));
    }
    history.push({ question, answer });
    fs.writeFileSync(tempHistoryFilePath, JSON.stringify(history, null, 2));
}

module.exports = { fetchResponseFromOpenAI, fetchCommandFromOpenAI, fetchResponseForFileOperations };
