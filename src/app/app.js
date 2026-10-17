const fs = require('fs');

function getRandomItemFromNode() {
  try {
    // 1. Read the JSON file synchronously (or use fs.readFile asynchronously)
    const rawData = fs.readFileSync('database.json', 'utf8');

    // 2. Parse the string data into a JavaScript array
    const dataArray = JSON.parse(rawData);

    // 3. Select a random index
    const randomIndex = Math.floor(Math.random() * dataArray.length);
    
    // 4. Grab the item
    const randomItem = dataArray[randomIndex];

    console.log("Random data retrieved:", randomItem);
    return randomItem;
  } catch (error) {
    console.error("Error reading file:", error);
  }
}
getRandomItemFromNode();