const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Replace with your own secret key
const secretKey = 'mySecretKey';

router.post('/register', async (req, res) => {
  const { email, username, password, confirm, firstname, lastname } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (password !== confirm) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Generate a salt and hash the password
    const hash = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hash, firstname, lastname });

    // Save the user in the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during user registration' });
  }
});




// User login endpoint

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(password);
    console.log(user.password);

    // Check if passwords match
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username: user.username, userId: user._id }, secretKey, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during user login' });
  }
});


// ...
router.get('/dashboard', (req, res) => {
  // Retrieve the JWT token from the request headers
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, secretKey);

    // Access the user ID and username from the decoded token
    const userId = decoded.userId;
    const userName = decoded.username;
    console.log(userName);

    // Perform further actions to fetch data or perform operations specific to the user

    res.status(200).json({ message: 'Access to the dashboard granted', username: userName });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});




module.exports = router;
