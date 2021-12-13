const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
var cookieSession = require('cookie-session');
var helper = require('./helper');

app.set("view engine", "ejs");

app.use(cookieSession({
    name: 'session',
    keys: ["You'll only roll one d20", "OMFG you rolled 2 d20"]
}));

const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

const users = { 
    "aJ48lW": {
      id: "aJ48lW", 
      email: "user@example.com", 
      password: bcrypt.hashSync("abcd", 8) //"abcd"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "efgh"
    }
};

function generateRandomString() {
    let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let string = '';
    for (let i = 0; i < 6; i++) {
        string += char.charAt(Math.floor(Math.random() * char.length));
    }
    return string;
};

const urlsForUser = (id) => {
    let newURL = {};
    for (const shortURL in urlDatabase) {
        const user = urlDatabase[shortURL];
        if (user.userID === id) {
            newURL[shortURL] = {
                longURL: user.longURL,
                userID: user.userID
            };
        }
    }
    if (!newURL) {
        return null;
    } else {
        return newURL;
    }
};

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));



//All server post requests
//Post route that removes URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
    const userID = req.session.id; //This checks if the cookie has the userID value
    if (!userID) { //If the user is not logged in, they shouldnt be able to delete
        return res.status(400).send('You need to log in to have access.');
    }
    const shortURLToRemove = req.params.shortURL;
    delete urlDatabase[shortURLToRemove];
    res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
    
    const userID = req.session.id; //Gives the user_id from cookie value
    if (!userID) {
        return res.status(400).send('You need to log in to have access.');
    }
    const shortURLToEdit = req.params.shortURL;
    res.redirect(`/urls/${shortURLToEdit}`);
});

app.post("/urls/:shortURL", (req, res) => {
    const shortURLToEdit = req.params.shortURL;
    const newLongURL = req.body.lname;
    urlDatabase[shortURLToEdit].longURL = newLongURL;
    res.redirect('/urls');
});

app.post("/login", (req, res) => {
    const user = helper.findUserByEmail(req.body.email, users);
    const password = bcrypt.hashSync(req.body.password, 8); //req.body.password
    
    if (user === null) {
        return res.status(403).send('Can not find a user with that email.');
    }; 
    if (bcrypt.compareSync(password, user.password)){ //(password !== user.password)
        return res.status(403).send('Password does not match recorded password.');
    }; 
    req.session.id = user.id;
    res.redirect('/urls');       
});

app.post('/logout', (req, res) => {
    //res.clearCookie('user_id', req.body.user_id); //Changed w03d03t2
    req.session = null;
    res.redirect('/urls');
});

app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');         //string template iteral ${shortURL}
});

app.post("/register", (req, res) => {
    const newId = generateRandomString();
    const newEmail = req.body.email;
    const newPassword = bcrypt.hashSync(req.body.password, 8);
    
    
    if (!newEmail || !newPassword) {
        return res.status(400).send('Must have both password and email');
    };

    if (helper.findUserByEmail(newEmail, users)) {
        return res.status(400).send('A user with that email already exists');
    };

    const templateVars = {
        id: newId,
        email: newEmail,
        password: newPassword
    };
    users[newId] = templateVars;
    req.session.id = newId;
    res.redirect('/urls');
});

//All server get requests
//Added displaying the username
app.get("/urls", (req, res) => {
    if (!req.session.id) {
        return res.status(400).send('You should log in or register first');
    }
    const newDB = urlsForUser(req.session.id);
    const userId = req.session.id; //req.session['user_id'];
    console.log('userId', userId);
    const user = users[userId];
    console.log('user', user);
    const templateVars = { 
        urls: newDB, //Needs to be changed. Was urlDatabase, now newDB (only urls with the user_id)
        user: user //changed from username to user
    };
    res.render("urls_index", templateVars);
});

app.get('/logout', (req, res) => {
    res.clearCookie('user_id', req.body.user_id);
    res.render('urls_login');
});

app.get("/login", (req, res) => {
    const userId = helper.findUserByEmail(req.body.email);
    const templateVars = {
        user: users[userId]
    };
    res.render("urls_login", templateVars);
});


app.get("/urls/new", (req, res) => {
    const userId = req.session.id;
    const user = users[userId];
    const templateVars = {
        urls: urlDatabase,
        user: user 
    }
    if(!userId) {
        return res.redirect('/urls');
    }
    res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
    const templateVars = {
        user: users['user_id'] //changed from username to user_id
    }
    res.render('urls_registration', templateVars);
});
  

app.get("/urls/:shortURL", (req, res) => {
    if (!urlDatabase[req.params.shortURL]) {
        res.status(400).send('The id does not exist.');
    };
    const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL,  
      user: users['user_id'] 
    }; 
    console.log(templateVars.longURL);
    console.log(templateVars.shortURL);
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
    res.send("Hello!");
  });
  
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
  
app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});
  
//Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




