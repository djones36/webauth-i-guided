const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');
const bcrypt = require('bcryptjs');
const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {

  res.send("It's alive!");
});
server.get('/hash', (req, res) => {
  const password = req.headers.authorization;
  if (password) {
    const hash = bcrypt.hashSync(password, 12);
    res.status(200).json({ hash })
  } else {
    res.status(400).json({ message: 'please provide password' })
  }

})

server.post('/api/register', (req, res) => {
  let user = req.body;

  //validate the user


  //hash the password
  const hash = bcrypt.hashSync(user.password, 12);

  //we override the password with the hash
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;


  Users.findBy({ username })
    .first()
    .then(user => {

      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', protected, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

//implement the proctected middlewar that will check for user name and password
//in the headers and if valid provide access to the endpoint
function protected() {

  const { password, user } = req.headers.authorization;
  if (user && bcrypt.compareSync(password, user.password)) {
    next()
  } else {
    res.status(401).json({ message: 'wrong password' })
  }

}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
