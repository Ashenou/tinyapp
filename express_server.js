const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080
//const bodyParser = require("body-parser");
//const { json } = require("body-parser");

//What would happen if a client requests a non-existent shortURL?
//What happens to the urlDatabase when the server is restarted?

app.use(express.urlencoded({ extended: true }));

// Cookie parser is important to read the cookie
app.use(cookieParser());
// Include ejs view engine
app.set("view engine", "ejs");

const generateRandomString = () => {
  let length = 6;
  return Math.random().toString(20).substr(2, length);
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Views Homepage
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: "Hello World!" };
//   res.render("hello_world", templateVars);
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

// Shows all generated short urls and their long urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// Shows form to generate a new short url
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// POST -- handler for generating url and then redirects to the url page.
app.post("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  //console.log(req.body.longURL); // Log the POST request body to the console
  let randomStrGenerated = generateRandomString();
  urlDatabase[randomStrGenerated] = req.body.longURL;
  //console.log(urlDatabase);
  res.render(`/urls/${randomStrGenerated}`, templateVars);
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// GET -- Shows long url by short url code
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username:req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// GET - To display details for a URL with an option to edit it
app.get("/u/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  //const longURL = urlDatabase[req.params.shortURL];
  if (templateVars["longURL"] === undefined) {
    res.send("Short url not found!");
  }
  //res.redirect(longURL);
  res.render("urls_show", templateVars);
});

// POST -- To submit changes to a specific URL
app.post("/urls/:shortURL", (req, res) => {
  const templateVars = {
    urls:urlDatabase,
    username: req.cookies["username"]
  };
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.render("urls_index", templateVars);
});

// POST -- Delete a generated URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  //res.redirect("/urls_index");
  const templateVars = {
    urls:urlDatabase,
    username:req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// POST -- Handles user login
app.post("/login", (req, res) => {
    const username = req.body.username;
    res.cookie("username", req.body.username);
    const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_index", templateVars);
});

app.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
