const bcrypt = require("bcryptjs");

/**
 *
 * @param {*} email Email of user to search for in database
 * @param {*} database Database to search in
 * @returns true if found otherwise returns false
 */
const getUserByEmail = (email, database) => {
  for (const key in database) {
    if (database[key]["email"] === email) {
      return false;
    }
  }
  return true;
};
/**
 *
 * @returns a random string
 */
const generateRandomString = () => {
  let length = 6;
  return Math.random().toString(20).substr(2, length);
};

/**
 *
 * @param {*} username Username to validate in database
 * @param {*} password Password to validate in database
 * @param {*} database Database to search in
 * @returns user id if user exists otherwiser returns false
 */
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

/**
 *
 * @param {*} userID User Id to get urls for
 * @param {*} urlDatabase Database of urls to search in
 * @returns List of urls that user owns
 */
const getUrlsForUser = (userID, urlDatabase) => {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === userID) {
      urls[url] = { longURL: urlDatabase[url]["longURL"], userID };
    }
  }
  return urls;
};
module.exports = {
  getUserByEmail,
  generateRandomString,
  loginCheck,
  getUrlsForUser,
};
