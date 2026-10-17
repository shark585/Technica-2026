const fs = require('fs');

function getRandomItems(count = 10) {
  try {
    const rawData = fs.readFileSync('database.json', 'utf8');
    const dataArray = JSON.parse(rawData);

    if (!Array.isArray(dataArray)) {
      throw new Error('database.json must contain an array');
    }

    // Fisher-Yates shuffle on a copy, then take the first `count`
    const shuffled = [...dataArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const items = shuffled.slice(0, count); // safely handles count > length

    items.forEach(item => console.log("Random data retrieved:", item));
    return items;
  } catch (error) {
    console.error("Error loading random items:", error);
    return [];
  }
}

getRandomItems(10);