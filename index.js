const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@aftabcluster.sr9zcvj.mongodb.net/?appName=aftabcluster`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect t client to the server	(optional starting in v4.7)
    await client.connect();

    const userDb = client.db('asstenDb')
    const postCollection = userDb.collection('posts')
    const favCollection = userDb.collection('favorite')


    app.post('/posts', async (req, res) => {
      const newUser = req.body
      const result = await postCollection.insertOne(newUser)
      res.send(result)
    })
    app.get('/posts', async (req, res) => {
      const cursor = postCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/posts/byid/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await postCollection.findOne(query)
      res.send(result)
    })
    app.get('/posts/single', async (req, res) => {
      const email = req.query.email
      const query = { artistemail: email }
      const cursor = postCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/posts/search', async (req, res) => {
      const searchtext = req.query.searchtext
      const result = await postCollection.find({
        $or: [
          { title: { $regex: searchtext, $options: "i" } },
          { artist: { $regex: searchtext, $options: "i" } }
        ]
      }).toArray()
      res.send(result)
    })
    app.get('/posts/recent', async (req, res) => {
      const cursor = postCollection.find({ situation: "Public" }).sort({ time: -1 }).limit(6)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.delete('/posts/:id', async(req,res)=>{
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = postCollection.deleteOne(query)
      res.send(result)
    })

    app.patch('/posts/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newData = req.body
      const update = {
        $set: newData
      }
      const option = {}
      const result = await postCollection.updateOne(query, update, option)
      res.send(result)
    })

    
    //favorite

    app.post('/favorites', async (req, res) => {
      const newData = req.body
      const result = await favCollection.insertOne(newData)
      res.send(result)
    })
    // app.get('/favorites', async (req, res) => {
    //   const cursor = favCollection.find()
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })
    app.get('/favorites/single', async (req, res) => {
      const email = req.query.email
      const query = { useremail: email }
      const cursor = favCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.delete('/favorites/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await favCollection.deleteOne(query)
      res.send(result)
    })

    app.patch('/posts/like/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const update = {
        $inc: { likes: 1 }
      }
      const result = await postCollection.updateOne(query, update)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
