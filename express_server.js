/* eslint-disable camelcase */
const cookieSession = require('cookie-session');
const express = require("express");
const app = express();
//const cookieParser = require("cookie-parser");
// bcrypt for hashing passwords
//const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
// Cookie parser is important to read the cookie
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["key1","key2"],
}));
// Include ejs view engine
app.set("view engine", "ejs");

//let bcrypt = dcodeIO.bcrypt;
//  Generated urls
// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

// Username and passwords
const users = {
  'aJ48lW': {
    id: "aJ48lW",
    email: "user@example.com",
    //password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
    password: bcrypt.hashSync("purple-monkey-dinosaur",bcrypt.genSaltSync(10)),
  },
  'user2RandomID': {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk",bcrypt.genSaltSync(10)),
    //password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

// Generates ID for urls and users
const generateRandomString = () => {
  let length = 6;
  return Math.random().toString(20).substr(2, length);
};

// Checks for userlogin credentials
const loginCheck = (username, password) => {
  for (let user in users) {
    if (
      users[user]["email"] === username &&
       bcrypt.compareSync(password, users[user]["password"])
    ) {
      return users[user]["id"];
    }
  }
  return undefined;
};

// Checks if email already in registered in database
const emailCheck = (email) => {
  for (const key in users) {
    if (users[key]["email"] === email) {
      return false;
    }
  }
  return true;
};

// Gets all urls that belong to a specific userID
const getUrlsForUser = (userID) => {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === userID) {
      urls[url] = urlDatabase[url]["longURL"];
    }
  }
  return urls;
};

// GET/ -- handler for home page
app.get("/", (req, res) => {
  const user_id = req.session["user_id"];
  if (user_id !== undefined) {
    //console.log("here");
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

// GET/urls -- Shows all generated short urls and their long urls
app.get("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  //const templateVars = { urls: urlDatabase };
  let templateVars = {};
  if (user_id !== "undefined") {
    templateVars["urls"] = getUrlsForUser(user_id);
    templateVars["user"] = users[user_id];
    //Object.assign(templateVars, { user: users[user_id] });
    console.log("Inside if", templateVars);
  }
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

// POST/urls -- handler for generating url and then redirects to the url page.
app.post("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  const templateVars = { urls: urlDatabase, user: users[user_id] };
  //console.log(req.body.longURL); // Log the POST request body to the console
  let randomStrGenerated = generateRandomString();
  urlDatabase[randomStrGenerated] = req.body.longURL;
  console.log(templateVars);
  res.render(`urls_index`, templateVars);
});

// GET/urls/new -- Shows form to generate a new short url
app.get("/urls/new", (req, res) => {
  const user_id = req.session["user_id"];
  let templateVars = { user: undefined };
  if (user_id === undefined) {
    //Object.assign(templateVars, { user: users[user_id] });
    return res.render("user_login", templateVars);
  }
  res.render("urls_new", templateVars);
});

// GET/urls/:shortURL -- Shows long url by short url code
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.session["user_id"];
  let templateVars = { user: undefined };
  const url_id = req.params.shortURL;
  console.log(url_id);
  let urls = getUrlsForUser(user_id);

  if (user_id !== undefined) {
    templateVars["urls"] = { shortURL: [url_id], longURL: urls[url_id] };
    templateVars["user"] = users[user_id];
    //Object.assign(templateVars, { user: users[user_id] });
    //console.log("Inside if", templateVars);
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("this url was not foud or it belongs to another user");
  }
});

// POST/urls/:shortURL -- Post back the modified url
app.post("/urls/:shortURL", (req, res) => {
  let user_id = req.session["user_id"];
  const url_id = req.params.shortURL;

  const templateVars = {
    urls: urlDatabase,
  };
  if (user_id !== "undefined") {
    Object.assign(templateVars, { user: users[user_id] });
  }
  urlDatabase[url_id].longURL = req.body.longURL;
  //res.render("urls_index", templateVars);
  res.redirect("/urls");
});

// POST/:id/delete -- Delete a generated URL
app.post("/urls/:id/delete", (req, res) => {
  let user_id = req.session["user_id"];

  if (user_id !== undefined) {
    delete urlDatabase[req.params.id];
  } else {
    res
      .status(400)
      .send("this url was not found or it belongs to another user");
  }
  //res.render("urls_index", templateVars);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user_id = req.session["user_id"];

  let templateVars = { user: undefined };

  if (user_id === undefined) {
    res.render("user_login", templateVars);
  }
});

// POST/login -- Handles user login
app.post("/login", (req, res) => {
  //const username = req.body.username;
  const templateVars = { urls: urlDatabase };

  const user_id = loginCheck(req.body.email, req.body.password);
  console.log(user_id);
  if (user_id !== undefined) {
    //req.session("user_id", user_id);
    req.session.user_id = user_id;
    templateVars.user = users[user_id];
    //return res.render("urls_index", templateVars);
    return res.redirect("/urls");
  }
  res.status(403).send("Not found!");

  //console.log(templateVars);
});

// GET -- Logout of user account
app.get("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session = null;
  res.redirect("urls");
});

// GET -- Registration form for user
app.get("/register", (req, res) => {
  let templateVars = { user: undefined };
  res.render("user_register", templateVars);
});

// POST -- Create User
app.post("/register", (req, res) => {
  const newId = generateRandomString();
  // Checks if any of the form fields are empty
  if (
    req.body.email === "" ||
    req.body.password === ""
  ) {
    return res.status(400).send("Must enter all fields");
  } else if (!emailCheck(req.body.email)) {
    return res.status(400).send("Wrong credentials");
  }
  //console.log(`req.body.password`, req.body.password);
  console.log(bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)));
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
  };
  console.log(users);
  res.cookie("user_id", newId);
  res.redirect("/urls");
  //res.render("urls_index", { urls: urlDatabase, user });
});

//GET/u/:shortURL - To redirect urls details for a URL to redirect
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    return res.send("Short url not found!");
  }
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
