const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('./db'); // Import MongoDB connection
const { User, AuctionItem } = require('./models'); // Import models

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'my_super_secret_123!';

// Middleware to authenticate token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
};

// ======================== AUTH ROUTES ======================== //

// Signup (Register)
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Signin (Login)
app.post('/signin', async (req, res) => {
  try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ userId: user._id, username }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ message: 'Signin successful', token });
  } catch (error) {
      console.error('Signin Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ======================== AUCTION ROUTES ======================== //

// Create an auction item (Protected)
app.post('/auction', authenticate, async (req, res) => {
  try {
      const { itemName, description, startingBid, closingTime } = req.body;
      if (!itemName || !description || !startingBid || !closingTime) return res.status(400).json({ message: 'All fields are required' });

      const newItem = new AuctionItem({
          itemName,
          description,
          currentBid: startingBid,
          highestBidder: '',
          closingTime
      });

      await newItem.save();
      res.status(201).json({ message: 'Auction item created', item: newItem });
  } catch (error) {
      console.error('Auction Post Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all auction items
app.get('/auctions', async (req, res) => {
  try {
      const auctions = await AuctionItem.find();
      res.json(auctions);
  } catch (error) {
      console.error('Fetching Auctions Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a single auction item by ID
app.get('/auctions/:id', async (req, res) => {
  try {
      const auctionItem = await AuctionItem.findById(req.params.id);
      if (!auctionItem) return res.status(404).json({ message: 'Auction not found' });

      res.json(auctionItem);
  } catch (error) {
      console.error('Fetching Auction Item Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Edit an auction (Protected)
app.put('/auction/:id', authenticate, async (req, res) => {
  try {
      const { id } = req.params;
      const { itemName, description, currentBid, highestBidder, closingTime } = req.body;

      const updatedAuction = await AuctionItem.findByIdAndUpdate(
          id,
          { itemName, description, currentBid, highestBidder, closingTime },
          { new: true }
      );

      if (!updatedAuction) return res.status(404).json({ message: 'Auction not found' });

      res.json({ message: 'Auction updated successfully', updatedAuction });
  } catch (error) {
      console.error('Edit Auction Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete an auction (Protected)
app.delete('/auction/:id', authenticate, async (req, res) => {
  try {
      const { id } = req.params;
      const auction = await AuctionItem.findByIdAndDelete(id);

      if (!auction) return res.status(404).json({ message: 'Auction not found' });

      res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
      console.error('Delete Auction Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Bidding on an item (Protected)
app.post('/bid/:id', authenticate, async (req, res) => {
  try {
      const { id } = req.params;
      const { bid } = req.body;
      const item = await AuctionItem.findById(id);

      if (!item) return res.status(404).json({ message: 'Auction item not found' });
      if (item.isClosed) return res.status(400).json({ message: 'Auction is closed' });

      if (new Date() > new Date(item.closingTime)) {
          item.isClosed = true;
          await item.save();
          return res.json({ message: 'Auction closed', winner: item.highestBidder });
      }

      if (bid > item.currentBid) {
          item.currentBid = bid;
          item.highestBidder = req.user.username;
          await item.save();
          res.json({ message: 'Bid successful', item });
      } else {
          res.status(400).json({ message: 'Bid too low' });
      }
  } catch (error) {
      console.error('Bidding Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(5001, () => {
  console.log('Server is running on port 5001');
});