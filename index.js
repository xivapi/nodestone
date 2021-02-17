const fs = require("fs");
const args = process.argv;
//Parsers
const getCharacter = require("./parser/profile/character");
const getAchievements = require("./parser/profile/achievments")

const fulltestid = "9575452";
const baretestid = "9426169";

if (args[2] == "test") {
  console.log("Running tests!");
  getCharacter(fulltestid).then(function (result) {
    fs.writeFileSync("./dist/character.json", JSON.stringify(result));
    console.log(`Test Character Parsed!\nOutput: ${__dirname}/dist`);
  });

  getAchievements(fulltestid).then(function (results) {
    console.log(results)
  })
} else if (args[2] == "baretest") {
  console.log("Running tests!");
  getCharacter(baretestid).then(function (result) {
    fs.writeFileSync("./dist/character.json", JSON.stringify(result));
    console.log(`Test Character Parsed!\nOutput: ${__dirname}/dist`);
  });
} else {
  getCharacter(args[2]).then((result) => {
    console.log("Character: Base character JSON created.");
    console.log(result);
  });
}
