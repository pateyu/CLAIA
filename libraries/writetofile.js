const fs = require("fs");

// Data to be written to the file
const data = "Hello, this is some text I want to write to a file.";

const WriteToFile = (data, fileName) => {
  try {
    // Writing data to the file synchronously
    fs.writeFileSync(fileName, data);
    console.log("File written successfully!");
  } catch (err) {
    // Handling any errors that occur
    console.error("An error occurred:", err);
  }
};

module.exports = { WriteToFile };
