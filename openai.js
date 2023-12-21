const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { openaiApiKey } = require('./config');

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
        content: `Only generate a shell command to: ${prompt}, do not say anything that is not a shell command. If no shell command exists say "Error"`
    }];

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 50 
        }, { headers: headers });

        const aiResponse = response.data.choices[0].message.content.trim();
        console.log("OpenAI Response:", aiResponse);
        saveToTempHistory(prompt, aiResponse);
        return aiResponse;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
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

module.exports = { fetchResponseFromOpenAI, fetchCommandFromOpenAI };
