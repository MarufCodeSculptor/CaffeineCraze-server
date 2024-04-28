const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

const port = process.env.PORT || 5000;

// midlewere
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('server working fine');
});

const uri = `mongodb+srv://${user}:${pass}@cluster1.6mzg5rv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db('coffieData');
    const coffieCollection = database.collection('coffieInfo');

    // posting data
    app.post('/coffie', async (req, res) => {
      const data = req.body;
      console.log(`backend hitted successfully`, data);
      const result = await coffieCollection.insertOne(data);
      res.send(result);
    });
    // getting data
    app.get('/coffies', async (req, res) => {
      const cursor = coffieCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    
    // getting a sigle item =>
    app.get('/coffie/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffieCollection.findOne(query);
      res.send(result);
    });

    app.put('/coffie/:id', async (req, res) => {
      const id = req.params.id;

      console.log(`put hitted id ${id}`);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = req.body;
      const coffie = {
        $set: {
          name: updatedCoffee.name,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photoUrl: updatedCoffee.photoUrl,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
        },
      };
      const result = await coffieCollection.updateOne(filter, coffie, options);
      res.send(result);
      console.log(result);
    });

    // deleting data = >
    app.delete('/coffie/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffieCollection.deleteOne(query);
      res.send(result);
      console.log(`delete hitted`);
    });
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log('server listening  at PORT', port);
});

//
//
