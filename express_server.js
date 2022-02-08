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
      password: "abcd" 
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
    const userID = req.session.username;
    const shortURLToRemove = req.params.shortURL;

    if (userID === urlDatabase[shortURLToRemove].userID) { 
        delete urlDatabase[shortURLToRemove];
        res.redirect('/urls');
    } else {
        return res.status(403).send("You are not the owner of this url. Access denied.");
    }
});

app.post("/urls/:shortURL/edit", (req, res) => {
    const newURL = req.body.newURL;
    const userID = req.session.username; 
    const shortURLToEdit = req.params.shortURL;

    if (userID === urlDatabase[shortURLToEdit].userID) {
        urlDatabase[shortURLToEdit].longURL = newURL;
        res.redirect('/urls');
    } else {
        return res.status(403).send("You are not the owner of this url. Access denied.");
    }
});


app.post("/login", (req, res) => {
    const user = helper.findUserByEmail(req.body.email, users);
    const password = req.body.password; 
    
    if (!user) {
        return res.status(400).send('Can not find a user with that email.');
    }; 
    if (!bcrypt.compareSync(password, user.password)){ 
        return res.status(400).send('Password does not match recorded password.');
    }; 
    req.session.username = user.id;
    res.redirect('/urls');       
});

app.post('/logout', (req, res) => {
    
    req.session = null;
    res.redirect('/login');
});


app.post("/register", (req, res) => {
    const newId = generateRandomString();
    const newEmail = req.body.email;
    const newPassword = req.body.password;
    
    const user = helper.findUserByEmail(newEmail, users);
    
    
    if (!newEmail || !newPassword) {
        return res.status(400).send('Must have both password and email');
    };

    if (user) {
        return res.status(400).send('A user with that email already exists');
    };

    users[newId] = {
        "id": newId,
        "email": newEmail,
        "password": newPassword
    };
    
    req.session.username = newId;
    res.redirect('/urls');
});

app.post("/urls/new", (req, res) => {
    const shortURL = generateRandomString();

    urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: req.session.username
    };

    res.redirect(`/urls/${shortURL}`);
})



//All server get requests
//Added displaying the username
app.get("/urls", (req, res) => {
    const userID = req.session.username;
    const user = users[userID]; 
    const newDB = urlsForUser(userID);

    if (!userID) {
        return res.status(400).send('You should log in or register first');
    } else {
        const templateVars = {
            urls: newDB,
            user: user
        };
      res.render("urls_index", templateVars); 
    }
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
    const userID = req.session.username;
    const user = users[userID];
    
    if(!user) {
        return res.redirect('/login');
    } else {
        const templateVars = {
            urls: urlDatabase,
            user: user 
        };
        res.render("urls_new", templateVars);
    }  
});

app.get("/register", (req, res) => {
    const templateVars = {
        user: null
    };
    res.render('urls_registration', templateVars);
});
  

app.get("/urls/:shortURL", (req, res) => {
    const userID = req.session.username;
    const user =  users[userID];
    if (!user) {
        return res.status(403).send("You must login first to see your urls.");
    }

    const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL,  
      user: user
    }; 
    
    res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
    if(!users[req.session.userID]) {
        res.redirect('/login');
        return;
    }
    res.redirect('/urls');
    return;
});
  
app.get("/urls.json", (req, res) => {
    const templateVars = { username: req.session.username };
    res.json(urlDatabase, templateVars);
});

  
//Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




