
require('dotenv').config( { path: __dirname + '/.env' });

const openaiApiKey = process.env.OPENAI_API_KEY;

module.exports = {
    openaiApiKey
};
