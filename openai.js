
const axios = require('axios');
const { openaiApiKey } = require('./config');

async function fetchResponseFromOpenAI(prompt) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
    };

    const messages = [{ role: 'assistant', content: prompt }];

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 150
        }, { headers: headers });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

module.exports = fetchResponseFromOpenAI;

