const { Configuration, OpenAIApi } = require("openai");
const { config } = require("../config");

const configuration = new Configuration({
  apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const completion = async (prompt) => {
  console.log("Answering...");
  try {
    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      max_tokens: 250,
      temperature: 0.7,
      stream: false,
      n: 1,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error in OpenAI completion:", error);
    throw error;
  }
};

module.exports = { completion };
