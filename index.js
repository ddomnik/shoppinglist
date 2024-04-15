const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid'); // Library for generating unique identifiers

const app = express();
const port = 3000;

app.use(express.static("www"));
app.use(express.json());

// Use bodyParser middleware to parse JSON bodies
app.use(bodyParser.json());

// NoSQL database (e.g., MongoDB) connection setup
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let database;

// Connect to the database
client.connect(err => {
    if (err) throw err;
    console.log('Connected to the database');
    database = client.db('shoppingLists'); // Change to your database name
});

// GET endpoint to retrieve the current state
app.get('/items/:sessionHash', async (req, res) => {
    const sessionHash = req.params.sessionHash;
    const collection = database.collection('lists');
    const list = await collection.findOne({ sessionHash });
    if (!list) {
        return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.json(list);
});

// POST endpoint to add a new item to the shopping list
app.post('/items/:sessionHash', async (req, res) => {
    const sessionHash = req.params.sessionHash;
    const newItem = req.body.item;
    const collection = database.collection('lists');
    const result = await collection.updateOne({ sessionHash }, { $push: { items: newItem } });
    if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.status(201).json({ message: 'Item added to shopping list', newItem });
});

// DELETE endpoint to delete an item from the shopping list
app.delete('/items/:sessionHash/:index', async (req, res) => {
    const sessionHash = req.params.sessionHash;
    const index = req.params.index;
    const collection = database.collection('lists');
    const result = await collection.updateOne({ sessionHash }, { $pull: { items: { $eq: index } } });
    if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.json({ message: 'Item deleted from shopping list' });
});

// PUT endpoint to move an item between views
app.put('/items/:sessionHash/:index', async (req, res) => {
    const sessionHash = req.params.sessionHash;
    const index = req.params.index;
    // Your implementation logic here
});

// Endpoint to create a new session
app.post('/session', (req, res) => {
    const sessionHash = uuid.v4(); // Generate unique session hash
    // Your implementation logic here to save sessionHash
    res.json({ sessionHash });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
