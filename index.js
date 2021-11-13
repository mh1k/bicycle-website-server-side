const { MongoClient } = require('mongodb');
const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middle Ware //
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ippt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        console.log('database connect');
        const database = client.db('niche_site');
        const cyclesCollection = database.collection('cycles');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');
        const othersCollection = database.collection('otherfacility');


        // review post
        app.post('/reviews', async (req, res) => {

            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            console.log("got new user", req.body);
            console.log("added user", result);
            res.json(result)

        })

        // Get Others
        app.get('/otherfacility', async (req, res) => {
            const cursor = othersCollection.find({});
            const otherfacility = await cursor.toArray();
            res.send(otherfacility);
        });

        // Get review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });

        // Get Cycles API
        app.get('/cycles', async (req, res) => {
            const cursor = cyclesCollection.find({});
            const cycles = await cursor.toArray();
            res.send(cycles);
        });

        // Get Cycle Add
        app.post('/cycles', async (req, res) => {

            const newProduct = req.body;
            const result = await cyclesCollection.insertOne(newProduct);
            console.log("got new user", req.body);
            console.log("added user", result);
            res.json(result)
        })

        app.get('/cycles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cycles = await cyclesCollection.findOne(query);
            res.send(cycles);
        })

        // Delete Product
        app.delete('/cycles/:id', async (req, res) => {

            const id = req.params.id;
            console.log(("delete product with id", id));
            const query = { _id: ObjectId(id) };
            const result = await cyclesCollection.deleteOne(query);
            res.json(result);

        })



        // Order Post 
        app.post('/orders', async (req, res) => {

            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            console.log("got new user", req.body);
            console.log("added user", result);
            res.json(result)

        })

        // User Put Google Signin
        app.put('/users', async (req, res) => {

            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log("got new user", req.body);
            console.log("added user", result);
            res.json(result)

        })

        //Get Admin

        app.get('/users/:email', async (req, res) => {

            const email = req.params.email;
            const query = { email: email }

            const user = await usersCollection.findOne(query);
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })

        })

        // Make Admin
        app.put('/users/admin', async (req, res) => {

            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log("got new user", req.body);
            console.log("added user", result);
            res.json(result)

        })

        //User Post for register
        app.post('/users', async (req, res) => {

            const newUsers = req.body;
            const result = await usersCollection.insertOne(newUsers);
            console.log("got new user", req.body);
            console.log("added user", result);
            res.json(result)

        })

        //UPDATED API

        app.put('/orders/:id', async (req, res) => {

            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            // const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateOrder.status
                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            console.log(req.body);
            res.json(result)

        })

        //Use Query for My Order 
        app.get('/orders/product', async (req, res) => {
            const search = req.query.email;
            console.log(req.query.search);
            const query = { userEmail: search }
            const cursor = await ordersCollection?.find(query);
            const orders = await cursor.toArray();
            res.send(orders)

        });

        //Get Order
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({})
            const orders = await cursor.toArray()
            res.send(orders)
        })

        //Delete Order
        app.delete('/orders/:id', async (req, res) => {

            const id = req.params.id;
            console.log(("delete product with id", id));
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);

        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running worldcycle Server');
});


app.listen(port, () => {
    console.log('Running worldcycle Server on port', port);
});