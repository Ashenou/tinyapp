const { assert } = require("chai");

const { getUserByEmail } = require("../helper");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("#Check if email is found or not", function () {
  it("Should return false when email is found ", function () {
    const checkResult = getUserByEmail("user@example.com", testUsers);
    assert(checkResult === false, "Email was found");
  });
  it("Should return false when email is found", function () {
    const checkResult = getUserByEmail("user2@example.com", testUsers);
    assert(checkResult === false, "Email was found");
  });
  it("Should return true when email is not found", function () {
    const checkResult = getUserByEmail("users2@example.com", testUsers);
    assert(checkResult === true, "Email was found");
  });
});
