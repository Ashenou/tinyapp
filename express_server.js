const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//const bodyParser = require("body-parser");
//const { json } = require("body-parser");

//What would happen if a client requests a non-existent shortURL?
//What happens to the urlDatabase when the server is restarted?

//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

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
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: "Hello World!" };
//   res.render("hello_world", templateVars);
// });

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

// Shows all generated short urls and their long urls
app.get("/urls_index", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Shows form to generate a new short url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// POST handler for generating url and then redirects to the url page.
app.post("/urls", (req, res) => {
  //console.log(req.body.longURL); // Log the POST request body to the console
  let randomStrGenerated = generateRandomString();
  urlDatabase[randomStrGenerated] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${randomStrGenerated}`);
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// Shows long url by short url code
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

// GET - To display details for a URL with an option to edit it
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.send("Short url not found!");
  }
  res.redirect(longURL);
});

// POST - To submit changes to a specific URL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls_index");
});


// Delete a generated URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls_index");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
