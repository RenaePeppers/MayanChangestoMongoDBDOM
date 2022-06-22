//Require dependencies

const express = require('express')
const { ReadableStreamBYOBRequest } = require('stream/web')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8005
require('dotenv').config()


//declare database variables
let db, 
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'StarTrekAPI'

//connect to mongodb
MongoClient.connect(dbConnectionStr)  //this connects us to cluster
    .then(client=>{
            console.log(`connected to ${dbName} database`)
            db = client.db(dbName)
    })

//set middleware
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

//configure server to listen for crud requests. must come after middleware
app.get('/', (request, response) => {
    db.collection('alienInfo').find().toArray()
    .then(data => {
        let nameList = data.map(item => item.speciesName)
        console.log(nameList)
        response.render('index.ejs', {info:nameList})
    })
    .catch(error => console.log(error))
})

app.post('/api', (request, response) => {
    console.log('Post heard')
    db.collection('alienInfo').insertOne(
        request.body
    )
    .then(result => {
        console.log(result)
        response.redirect('/')
    })
})

app.put('/updateEntry', (request, response) => {
    console.log(request.body)
    Object.keys(request.body).forEach(key => {
        if(request.body[key]=== null || request.body[key]===undefined || request.body[key]===""){
            delete request.body[key]
        }  ///this section keeps it from over writing empty fields
    })
    console.log(request.body)
    db.collection('alienInfo').findOneAndUpdate(      //this section updates the database
        {name: request.body.name}, 
        {
            $set: request.body  //$ means this is a mongodb operator
        }
    )
    .then(result => {     //this is needed to stop errors in the console to complete the put
        console.log(result)
        response.json('Success')
    })
    .catch(error => console.error(error))
})


app.delete('/deleteEntry', (request, response) => {
    db.collection('alienInfo').deleteOne(
        {name: request.body.name}
    )
    .then(result => {
        console.log('Entry Deleted')
        response.json('Entry Deleted')
    })
    .catch(error => console.error(error))
})




//set up local host on port
app.listen(process.env.PORT || PORT, () => {
    console.log(`the server is running on port ${PORT}`)
})