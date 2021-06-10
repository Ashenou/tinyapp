/* eslint-disable camelcase */
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

//What would happen if a client requests a non-existent shortURL?
//What happens to the urlDatabase when the server is restarted?

app.use(express.urlencoded({ extended: true }));

// Cookie parser is important to read the cookie
app.use(cookieParser());
// Include ejs view engine
app.set("view engine", "ejs");

//  Generated urls
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Username and passwords
const users = {
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
      users[user]["password"] === password
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

// GET/ -- handler for home page
app.get("/", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (user_id !== undefined) {
    console.log("here");
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

// GET/urls -- Shows all generated short urls and their long urls
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase };
  if (user_id !== "undefined") {
    Object.assign(templateVars, { user: users[user_id] });
  }
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

// POST/urls -- handler for generating url and then redirects to the url page.
app.post("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[user_id] };
  //console.log(req.body.longURL); // Log the POST request body to the console
  let randomStrGenerated = generateRandomString();
  urlDatabase[randomStrGenerated] = req.body.longURL;
  console.log(templateVars);
  res.render(`urls_index`, templateVars);
});

// GET/urls/new -- Shows form to generate a new short url
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {};
  if (user_id !== "undefined") {
    Object.assign(templateVars, { user: users[user_id] });
  }
  res.render("urls_new", templateVars);
});

// GET/urls/:shortURL -- Shows long url by short url code
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = {
    urls: {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
    },
  };

  if (user_id !== "undefined") {
    Object.assign(templateVars, { user: users[user_id] });
  }
  res.render("urls_show", templateVars);
});

// GET/u/:shortURL - To display details for a URL with an option to edit it
app.get("/u/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {
    urls: {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
    },
  };
  if (user_id !== "undefined") {
    Object.assign(templateVars, { user: users[user_id] });
  }
  console.log(templateVars);
  //const longURL = urlDatabase[req.params.shortURL];
  if (templateVars["longURL"] === undefined) {
    res.send("Short url not found!");
  }
  //res.redirect(longURL);
  res.render("urls_show", templateVars);
});

// POST -- Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.render("urls_index", templateVars);
});

// POST/:id/delete -- Delete a generated URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (user_id === undefined) {
    res.render("user_login");
  }
});

// POST/login -- Handles user login
app.post("/login", (req, res) => {
  //const username = req.body.username;
  const templateVars = { urls: urlDatabase };

  const user_id = loginCheck(req.body.username, req.body.password);
  console.log(user_id);

  if (user_id !== undefined) {
    res.cookie("user_id", user_id);
    templateVars.user = users[user_id];
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("Not found!");
  }
  //console.log(templateVars);
});

// GET -- Logout of user account
app.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("urls");
});

// GET -- Registration form for user
app.get("/register", (req, res) => {
  res.render("user_register");
});

// POST -- Create User
app.post("/register", (req, res) => {
  const newId = generateRandomString();
  // Checks if any of the form fields are empty
  if (
    req.body.username === "" ||
    req.body.email === "" ||
    req.body.password === ""
  ) {
    return res.status(400).send("Must enter all fields");
  } else if (!emailCheck(req.body.email)) {
    return res.status(400).send("Wrong credentials");
  }
  const user = (users[newId] = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  console.log(users);
  res.cookie("user_id", newId);
  res.render("urls_index", { urls: urlDatabase, user });
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
