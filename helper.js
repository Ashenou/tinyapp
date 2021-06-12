const bcrypt = require("bcryptjs");

const getUserByEmail = (email, database) => {
  for (const key in database) {
    if (database[key]["email"] === email) {
      return false;
    }
  }
  return true;
};
const generateRandomString = () => {
  let length = 6;
  return Math.random().toString(20).substr(2, length);
};

const loginCheck = (username, password, database) => {
  for (let user in database) {
    if (
      database[user]["email"] === username &&
      bcrypt.compareSync(password, database[user]["password"])
    ) {
      return database[user]["id"];
    }
  }
  return false;
};
const getUrlsForUser = (userID,urlDatabase) => {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === userID) {
      urls[url] = { longURL: urlDatabase[url]["longURL"], userID};
    }
  }
  return urls;
};
module.exports = { getUserByEmail, generateRandomString, loginCheck,getUrlsForUser };
