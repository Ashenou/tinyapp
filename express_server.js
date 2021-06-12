/* eslint-disable camelcase */
const cookieSession = require("cookie-session");
const express = require("express");
const helper = require("./helper");
const app = express();

const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
// Include ejs view engine
app.set("view engine", "ejs");

// Database of URLS including the user who owns it
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

// Username and passwords
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", bcrypt.genSaltSync(10)),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", bcrypt.genSaltSync(10)),
  },
};

// GET/ -- route for "/"
app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id === undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

// GET/urls -- Shows all generated short urls and their long urls
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = {};

  if (typeof user_id !== "undefined") {
    const urls = helper.getUrlsForUser(user_id, urlDatabase);
    const user = users[user_id];
    templateVars["urls"] = urls;
    templateVars["user"] = user;
    res.render("urls_index", templateVars);
  } else if (typeof user_id === "undefined") {
    res.render("urls_index",templateVars);
  }
});

// POST/urls -- handler for generating url and then redirects to the url page.
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;

  let randomStrGenerated = helper.generateRandomString();
  urlDatabase[randomStrGenerated] = {
    longURL: req.body.longURL,
    userID: user_id,
  };
  res.redirect("/urls");
});

// GET/urls/new -- Shows form to generate a new short url
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = { user: undefined };
  if (typeof user_id === "undefined") {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// GET/urls/:shortURL -- Shows long url by short url code to edit it
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = { user: undefined };

  const url_id = req.params.shortURL;

  let urls = helper.getUrlsForUser(user_id, urlDatabase);

  if (user_id !== undefined) {
    templateVars["urls"] = {
      shortURL: [url_id],
      longURL: urls[url_id].longURL,
    };
    templateVars["user"] = users[user_id];
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("This url was not foud or it belongs to another user");
  }
});

// POST/urls/:shortURL -- Post back the modified url
app.post("/urls/:shortURL", (req, res) => {
  let user_id = req.session.user_id;
  const url_id = req.params.shortURL;

  const templateVars = {
    urls: urlDatabase,
  };
  if (user_id !== "undefined") {
    Object.assign(templateVars, { user: users[user_id] });
  }
  urlDatabase[url_id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// POST/:id/delete -- Delete a generated URL
app.post("/urls/:id/delete", (req, res) => {
  let user_id = req.session.user_id;

  if (user_id !== undefined) {
    delete urlDatabase[req.params.id];
  } else {
    res
      .status(400)
      .send("this url was not found or it belongs to another user");
  }
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = { user: undefined };
  if (typeof user_id === "undefined") {
    res.render("user_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

// POST/login -- Handles user login
app.post("/login", (req, res) => {
  const templateVars = {};

  const user_id = helper.loginCheck(req.body.email, req.body.password, users);
  if (user_id !== false) {
    req.session.user_id = user_id;
    templateVars.user = users[user_id];
    res.redirect("/urls");
  } else if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("You must enter all fields");
   } else {
    res.status(403).send("Not found!");
  }
});

// GET -- Logout of user account
app.get("/logout", (req, res) => {
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
  const newId = helper.generateRandomString();
  // Checks if any of the form fields are empty
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("You must enter all fields");
  } else if (!helper.getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Wrong credentials entered");
  } else {
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
    };
    req.session.user_id = newId;
    res.redirect("/urls");
  }
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
