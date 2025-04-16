const express =require('express') 
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use (cors());
app.use (express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cn4mz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("BistroDb").collection("users");
    const menuCollection = client.db("BistroDb").collection("menu");
    const reviewCollection = client.db("BistroDb").collection("reviews");
    const cartCollection = client.db("BistroDb").collection("carts");

//jwt related api
app.post('/jwt', async(req, res) => {
  const user = req.body;
  const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
     expiresIn: '1h'
  })
  res.send({token})
})

//middleware process
const verifyToken = (req,res, next)=>{
  console.log( 'inside verify token',req.headers);
  if(!req.headers.authorization){
    return res.status(401).send({message:'forbidden access'})
  }
  const token = req.headers.authorization.split(' ')[1];
  // next();
}





// Middleware হলো এমন একটা ফাংশন বা প্রক্রিয়া, যেটা একটি অনুরোধ (request)
//  সার্ভারে যাওয়ার আগে বা সার্ভার থেকে উত্তর (response) ফেরত দেওয়ার আগে কাজ করে।

    //for load ta to using tanstack query to the allUser component
    //user related api
    app.get('/Users',verifyToken, async(req, res) => {
     
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    //for admin pannel
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter= {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)
    });
    




//delete data from admin pannel
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
    

    
    
    
    //menu related apis
    app.get('/menu', async(req, res) => {
        const result = await menuCollection.find().toArray();
        res.send(result)
      })
        
      
    
    
      app.get('/reviews', async(req, res) => {
        const result = await  reviewCollection.find().toArray();
        res.send(result)
      })



     
     
     
      //for save the user onfo to the database  
    app.post('/users', async(req, res) => {

      const user = req.body;
      //insert email if the user do not exists
      //do this in many ways like(1. email unique 2.upsert 3.simple checking)
      const query = {email:user.email} 
      const existingUser = await userCollection.findOne(query);
    if(existingUser){
      return res.send({message:"user is already exists",insertedId:null})
    }

        const result = await userCollection.insertOne(user);
        res.send(result)
      })



//cart collection




// for showing the added cart to the navbar badge
app.get('/carts', async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const result = await cartCollection.find(query).toArray();
  res.send(result);
});





//delete operation
app.delete('/carts/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await cartCollection.deleteOne(query);
  res.send(result);
});




// after that-->now create the api data to the server

//-->now this data we upload using axios the client sigh
//we load data through client sight using a component

// TanStack Query হলো একধরনের data-fetching library, যা React, Vue, Svelte
//  ইত্যাদি ফ্রেমওয়ার্কের সাথে কাজ করে। এটি API থেকে ডেটা আনা, ক্যাশে করা,
// রিফ্রেশ করা এবং সেসব ডেটার উপর কাজ করা অনেক সহজ করে তোলে।


//cart insertion
    app.post('/carts', async(req, res) => {
      const cartItem = req.body;
        const result = await  cartCollection.insertOne( cartItem);
        res.send(result)
      })
      
   
































    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('boss is sitting')
})

app.listen(port, () => {
  console.log(`bistro boss is sitting on the port:  ${port}`)
})