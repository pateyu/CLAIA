const axios = require("axios");
const { config } = require("../config");
const openai = {
  completion: (prompt) => {
    const opts = {
      url: "https://api.openai.com/v1/completions",
      method: "POST",
      data: {
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 250,
        temperature: 0.7,
        stream: false,
        n: 1,
      },
      headers: {
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
      },
    };
    console.log("Answering...");
    return axios.request(opts);
  },
};

module.exports = { openai };
