const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../user/User');
const config = require('../config');
const verifyToken = require('./VerifyToken');

router.post('/register', function (req, res, next) {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  return User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  })
    .then((user) => {
      const token = jwt.sign({ id: user._id }, config.JWTSecretKey, {
        expiresIn: 86400
      });

      return res.status(200).send({ auth: true, token: token });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send('There was a problem registering a user');
    });
});

router.get('/me', verifyToken, function (req, res, next) {
  User.findById(req.userId, { password: 0 })
    .then((user) => {
      if (!user) return res.status(404).send('User not found');
      return res.status(200).send(user);
    })
    .catch(err => res.status(500).send('There was a problem finding the user'))
});

router.post('/login', function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) return res.status(404).send('User not found');
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) return res.status(401).send({ auth: false, token: null });
      const token = jwt.sign({ id: user._id }, config.JWTSecretKey, { expiresIn: 86400 });
      res.status(200).send({ auth: true, token: token });
    })
    .catch(err => res.status(500).send('Error on the server'));
});

router.get('/logout', function (req, res, next) {
  return res.status(200).send({ auth: false, token: null });
});

module.exports = router;