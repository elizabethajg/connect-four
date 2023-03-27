require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connectDb = async () => {
  await client.connect();
  console.log('Connected to MongoDB');
  return client.db('connect_four');
};

module.exports = connectDb;