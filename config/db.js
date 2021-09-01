const mongoose = require('mongoose');
const config = require('config');
const dbURI = config.get('mongoURI');


const ConnectDB = () =>{

    mongoose.connect(dbURI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('db connected');
    });

}

module.exports = ConnectDB;