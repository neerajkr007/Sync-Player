const mongoose = require('mongoose')

const user = new mongoose.Schema({
    userName:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    alreadyLoggedIn:{
        type:Boolean
    },
    friends:[{
        type:String
    }],
    requests:[{
        type:String
    }],
    notifications:[{
        type:String
    }]
});

module.exports = User = mongoose.model('user', user, 'users');