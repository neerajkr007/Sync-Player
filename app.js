const express = require('express');
const app = express();
const serv = require('http').createServer(app);
const Users = require('./schemas/user')

const mongoose = require('mongoose');
const { copyFileSync } = require('fs');

const URI = "mongodb+srv://neerajkr007:MGpemPWPXnG7PEki@cluster0.eq19x.mongodb.net/DB0?retryWrites=true&w=majority"
const connection = async ()=>{
    await mongoose.connect(
    URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true },
    function(err){
        if (err){
            console.log(err)
            return
        }
        mongoose.set('useFindAndModify', false);
        console.log("db connected")
        // let obj = {}
        // obj.userName = "Neeraj"
        // obj.email = "yolo"
        // obj.password = "yoloyolo"
        // let userModel = new Users(obj);
        // await userModel.save();
    });
}
connection();



app.get('/', (req, res) =>
{
    res.sendFile(__dirname + '/index.html');
});

app.get('/index', (req, res) =>
{
    res.sendFile(__dirname + '/index.html');
}); 

app.get('/rooms', (req, res) =>
{
    res.sendFile(__dirname + '/rooms.html');
    
}); 

app.get('/login', (req, res) =>
{
    res.sendFile(__dirname + '/login.html');
});

app.get('/signup', (req, res) =>
{
    res.sendFile(__dirname + '/signup.html');
});

app.get('/sw.js', (req, res) =>
{
    res.sendFile(__dirname + '/sw.js');
});

app.get('/guest', (req, res) =>
{
    res.sendFile(__dirname + '/user.html');
});

// app.get('/606169cd630a0d6978ddcb1e', (req, res) =>
// {
//     res.sendFile(__dirname + '/user.html');
// });

app.get('/6064c38c51fb84001718d5f3', (req, res) =>
{
    res.sendFile(__dirname + '/user.html');
});

app.use(express.static(__dirname + '/public'));

serv.listen(process.env.PORT || 3000); 

var io = require('socket.io')(serv,{});

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var ROOM_LIST = []; 
for(var i =0; i<10; i++){
    ROOM_LIST[i] = [];
}

var Player = function(id){
	var self = {
        id:id,
        roomId: "",
        name:"",
        myRoomNumber:-1,
        isHost:false,
        isReady:false,
        fileSize:0,
        hostNumber:-1,
    } 
    return self;
}
var numberOfHosts = 0;
peers = {}
var eventify = function(arr, callback) {
    arr.push = function(e) {
        Array.prototype.push.call(arr, e);
        callback(arr);
    };
};

var isPLayerShown = false;



io.on('connection', function(socket){
    console.log('socket connected ');
    socket.id = String(Math.floor(Math.random() * (Math.floor(9999) - Math.ceil(1000) + 1) + Math.ceil(1000)));
    console.log(socket.id);
    SOCKET_LIST[socket.id] = socket;
    
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
    socket.emit("mysocketid", socket.id);

    function callEventify(id){
        eventify(ROOM_LIST[id], function(updatedArr) {
            
            socket.on("sendplayerlist", ()=>{
                if(updatedArr.length>1){
                    io.sockets.emit("clearPlayerList", updatedArr[0].roomId);
                    io.sockets.emit("updatePlayerList", "connected users -", updatedArr[0].roomId)
                    for(var i = 0; i<updatedArr.length; i++){
                        io.sockets.emit("updatePlayerList", updatedArr[i].name, updatedArr[i].roomId)
                    }
                }
                });
            if(updatedArr.length == 1){
                io.sockets.emit("clearPlayerListHost", updatedArr[0].roomId);
                io.sockets.emit("updatePlayerListHost", "connected users -", updatedArr[0].roomId)
                for(var i = 0; i<updatedArr.length; i++){
                    io.sockets.emit("updatePlayerListHost", updatedArr[i].name, updatedArr[i].roomId)
                }
            }
            //io.sockets.emit("updatePlayerList", updatedArr[updatedArr.length - 1].name, updatedArr[updatedArr.length - 1].roomId)
          });
    }



    socket.on("changeSocketId", async (newId)=>{
        delete SOCKET_LIST[socket.id]
        socket.id = newId
        SOCKET_LIST[socket.id] = socket;
        //console.log(socket.id)
        let me = await Users.findOne({"_id":newId})
        socket.emit("welcomeUser", me.userName)
        
        let user2 = []
        if (me.requests.length != 0) {
            for (let i = 0; i < me.requests.length; i++) {
                let user3 = await Users.findOne({ "_id": me.requests[i] })
                let obj = {}
                obj.userName = user3.userName
                obj._id = user3._id
                user2.push(obj)
            }

        }
        socket.emit("showFriends", me.friends)
        socket.emit("notification", me, user2)
        for (let i = 0; i < me.friends.length; i++)
        {
            let friend = await Users.findOne({"userName":me.friends[i]})
            if(SOCKET_LIST[friend._id] != undefined)
            {
                SOCKET_LIST[friend._id].emit("cameOnline", me.userName, me._id, friend.userName)
            }
        } 
        
})




//          LOGIN AND SIGNUP STUFF




    socket.on("newSignUp", async (d)=>{
        let list = ["email", "userName", "password"]
        let user = await Users.findOne({$or:[ {'email':d[0]}, {'userName':d[1]}]})
        if(user == null)
        {
            let obj = {}
            for(let i = 0; i < 3; i++)
            {
                obj[list[i]] = d[i]
            }
            obj.alreadyLoggedIn = false
            let userModal = Users(obj)
            await userModal.save()
            socket.emit("signUpSuccess")
        }
        else
        {
            if(user.email == d[0])
            {
                socket.emit("userAlreadyExists", "email")
            }
            else
                socket.emit("userAlreadyExists", "userName")
        }
    })

    socket.on("tryLogin", async (e, p)=>{
        let user = await Users.findOne({$or:[ {'email':e}, {'userName':e}]})
        if(user == null)
        {
            socket.emit("loginFailed", "email")
        }
        else
        {
            if(user.password == p)
            {
                user.alreadyLoggedIn = true
                await user.save()
                let id = user._id
                app.get('/'+id, (req, res) =>
                {
                    res.sendFile(__dirname + '/user.html');
                });
                socket.emit("loginSuccess", id)
            }
            else
            {
                socket.emit("loginFailed", "password")
            }
        }
    })






//          ADD FRIEND





    socket.on("searchFriend", async (name)=>{
        let user = await Users.findOne({$or:[ {'email':name}, {'userName':name}]})
        socket.emit("searchResult", user)
    })

    socket.on("sendRequest", async (id)=>{
        //console.log(id)
        let user = await Users.findOne({"_id":id})
        let me = await Users.findOne({"_id":socket.id})
        // console.log(id)  FRIEND
        // console.log(socket.id)  MY
        if(!user.requests.includes(socket.id) && !user.friends.includes(me.userName))
        {
            user.requests.push(socket.id)
            user.markModified('requests')
            await user.save()
            socket.emit("requestSent")
            let user2 = []
            for(let i = 0; i < user.requests.length; i++)
            {
                let user3 = await Users.findOne({"_id":user.requests[i]})
                let obj = {}
                obj.userName = user3.userName
                obj._id = user3._id
                user2.push(obj)
            }
            try
            {
                SOCKET_LIST[id].emit("notification", user, user2)
            }
            catch
            {
                
            }
        }

        else if(user.friends.includes(me.userName))
        {
            socket.emit("requestNotSent", 0)
        }

        else
        {
            socket.emit("requestNotSent", 1)
        }
    })

    socket.on("acceptFriendRequest", async (user)=>{
        let me = await Users.findOne({"_id":socket.id})
        me.friends.push(user.userName)
        me.requests.splice(me.requests.indexOf(user._id), 1)
        let friend = await Users.findOne({"_id":user._id})
        if(me.notifications.length < 5)
        {
            me.notifications.push("you are now friends with " + friend.userName)
        }
        else
        {
            me.notifications.shift()
            me.notifications.push("you are now friends with " + friend.userName)
        }
        me.markModified('notifications')
        me.markModified('friends')
        me.markModified('requests')
        me.save()
        friend.friends.push(me.userName)
        if(friend.notifications.length < 5)
        {
            friend.notifications.push(me.userName + " Accepted your friend request !")
        }
        else
        {
            friend.notifications.shift()
            friend.notifications.push(me.userName + " Accepted your friend request !")
        }
        friend.markModified('notifications')
        friend.markModified('friends')
        friend.save()
        socket.emit("acceptedMe", friend.userName)
        let user2 = []
        if (me.requests.length != 0) {
            for (let i = 0; i < me.requests.length; i++) {
                let user3 = await Users.findOne({ "_id": me.requests[i] })
                let obj = {}
                obj.userName = user3.userName
                obj._id = user3._id
                user2.push(obj)
            }
        }
        socket.emit("notification", me, user2)
        try
        {
            SOCKET_LIST[friend._id].emit("acceptedFriend", me.userName)
            let user2 = []
            if(friend.requests.length != 0)
            {
                for(let i = 0; i < friend.requests.length; i++)
                {
                    let user3 = await Users.findOne({"_id":friend.requests[i]})
                    let obj = {}
                    obj.userName = user3.userName
                    obj._id = user3._id
                    user2.push(obj)
                }
            }
            SOCKET_LIST[friend._id].emit("notification", friend, user2)
        }
        catch(e)
        {
        }
    })

    socket.on("rejectFriendRequest", async (user)=>{
        let me = await Users.findOne({"_id":socket.id})
        me.requests.splice(me.requests.indexOf(user._id), 1)
        me.markModified('requests')
        me.save()
        let friendNot = await Users.findOne({"_id":user._id})
        if(friendNot.notifications.length < 5)
        {
            friendNot.notifications.push(me.userName + " Rejected your friend request !")
        }
        else
        {
            friendNot.notifications.shift()
            friendNot.notifications.push(me.userName + " Rejected your friend request !")
        }
        friendNot.markModified('notifications')
        friendNot.save()
        socket.emit("rejectedMe")
        let user2 = []
        if (me.requests.length != 0) {
            for (let i = 0; i < me.requests.length; i++) {
                let user3 = await Users.findOne({ "_id": me.requests[i] })
                let obj = {}
                obj.userName = user3.userName
                obj._id = user3._id
                user2.push(obj)
            }
        }
        socket.emit("notification", me, user2)
        try
        {
            SOCKET_LIST[friendNot._id].emit("rejectedFriend", me.userName)
            let user2 = []
            if(friendNot.requests.length != 0)
            {
                
                for(let i = 0; i < friendNot.requests.length; i++)
                {
                    let user3 = await Users.findOne({"_id":friendNot.requests[i]})
                    let obj = {}
                    obj.userName = user3.userName
                    obj._id = user3._id
                    user2.push(obj)
                }
            }
            SOCKET_LIST[friendNot._id].emit("notification", friendNot, user2)
        }
        catch(e)
        {

        }
    })





//          FRIENDS STUFF



    socket.on("heyo", ()=>{
        console.log("please works")
    })

    socket.on("cameOnlineReply", (id, name)=>{
        try
        {
            SOCKET_LIST[id].emit("cameOnlineReply", name)
        }
        catch(e)
        {

        }
    })






//          ROOMS STUFF




    socket.on("host", function(name){
        //ROOM_LIST[player.id] = player;
        //player.myRoomNumber = numberOfHosts;
        socket.join(player.id);
        player.roomId = player.id;
        player.name = name;
        player.isHost = true;
        player.hostNumber = numberOfHosts;
        //console.log(player.name);
        socket.adapter.rooms.get(player.id).size;
        peers[socket.id] = socket
        //ROOM_LIST[0][0] = player;
        
        //console.log(ROOM_LIST[numberOfHosts][0])
        callEventify(player.hostNumber);
        socket.emit("hosted", String(player.id));
        updatePlayerList();
        numberOfHosts++;
    }); 

    socket.on("tryJoin", (id, name) => {
        for(var i in PLAYER_LIST){  
            if(id == PLAYER_LIST[i].id){
                socket.join(id);  
                player.roomId = id;
                player.name = name;
                player.hostNumber = PLAYER_LIST[i].hostNumber;
                //console.log(socket);
                callEventify(player.hostNumber);
                peers[socket.id] = socket
                socket.emit("joined", {id:player.roomId, isplayershown:isPLayerShown});
                setTimeout(()=>{updatePlayerList();}, 1000)
                return true;   
            }  
        }
        socket.emit("notJoined"); 
    });

    function updatePlayerList(){
        ROOM_LIST[player.hostNumber].push(player);
        for(let _id = 0;_id < ROOM_LIST[player.hostNumber].length; _id++) {
            if(ROOM_LIST[player.hostNumber][_id].id == socket.id) continue
            console.log('sending init receive to ' + socket.id)
            peers[ROOM_LIST[player.hostNumber][_id].id].emit('initReceive', socket.id)
        }
    }

    socket.on("playershownemit", ()=>{
        isPLayerShown = true;
    });
    socket.on("showPlayeremit1", ()=>{
        io.sockets.emit("showPlayer", player.roomId);
    });

    socket.on("showPlayeremit2", ()=>{
        socket.emit("showPlayer", player.roomId);
    });

    socket.on("ready", (size, _isHost, time)=>{
        player.isReady = true;
        player.fileSize = size;
        if(_isHost){
            var data = Math.ceil(size/262144)
            io.sockets.emit("numberofchunks", data, time, player.roomId)
        }
        console.log("ready");
    });

    socket.on("ready2", ()=>{
        player.isReady = true;
        console.log("ready");
    });

    socket.on("playvideo?", (roomID, size, type)=>{
        for(var i in PLAYER_LIST)
        {
            if(roomID == PLAYER_LIST[i].roomId) 
            {
                if(type === "load"){
                    if(!PLAYER_LIST[i].isReady || PLAYER_LIST[i].fileSize != size){
                        alert("not ready or wrong size");
                        return false;
                    }
                }
                else{
                    if(!PLAYER_LIST[i].isReady){
                        //alert("not ready or wrong size");
                        //return false;
                    }
                }
                
            }
        }
        io.sockets.emit("fileSize", size, player.roomId);
        io.sockets.emit("playVideo", player.roomId);
    });

    socket.on("pauseEmit", ()=>{
        io.sockets.emit("pause", player.roomId);
    });

    socket.on("playEmit", (time)=>{
        io.sockets.emit("play", player.roomId, time);
    });

    socket.on("sendNextchunkemit", ()=>{
        //console.log("recieved")
        io.sockets.emit("sendNextchunk", player.roomId);
    });

    socket.on("showplayer2emit", ()=>{
        //console.log("recieved")
        io.sockets.emit("showplayer2", player.roomId);
    });

    socket.on('initSend', (init_socket_id, id) => {
        console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id)
        peers[init_socket_id].emit('initSend', socket.id, id)
    })

    socket.on('sendnextchunkemit', init_socket_id => {
        peers[init_socket_id].emit('sendnextchunk')
    })

    socket.on('sendnextchunkemit2', (init_socket_id, chunk) => {
        peers[init_socket_id].emit('sendnextchunk2', chunk)
    })

    var test
    socket.on("chattoothersemit", (chat, id)=>{
        test = id
        io.sockets.emit("chatToOthers", player.roomId, chat, id, player.name);
    });

    socket.on("chattoothersemit2", (id)=>{
        test = id
        io.sockets.emit("chatToOthers", player.roomId, player.name + " has joined the room", id, "");
    });

    socket.on("sendinitemit", ()=>{
        console.log(player.name)
        for(let id in peers) {
            if(id === socket.id) continue
            console.log('sending init receive to ' + socket.id)
            peers[id].emit('initReceive', socket.id)
        }
    })

    socket.on("playAudioEmit", (id, n, speaker)=>{
        if(n == 1)
            io.sockets.emit("playAudio", player.roomId, id, speaker);
        else if(n == 2)
            io.sockets.emit("pauseAudio", player.roomId, id, speaker);
    });

    socket.on("test", data=>{
        io.sockets.emit("test2", {id:player.roomId, chunk:data.chunk});
    })

    socket.on("cantConnect", data=>{
        peers[data].emit("cantConnect");
    })

    socket.on("seeked", (time)=>{
            io.sockets.emit('seeked', time, player.roomId)
    })

    socket.on('disconnect', async function(){
        console.log('socket disconnected ');
        if(socket.id.length > 4)
        {
            let me = await Users.findOne({"_id":socket.id})
            for (let i = 0; i < me.friends.length; i++)
            {
                let friend = await Users.findOne({"userName":me.friends[i]})
                if(SOCKET_LIST[friend._id] != undefined)
                {
                    SOCKET_LIST[friend._id].emit("wentOffline", me.userName)
                }
            } 
        }
        io.sockets.emit("chatToOthers", player.roomId, player.name+" left the room", test, " ");
        io.sockets.emit('removePeer', socket.id, player.roomId)
        delete peers[socket.id]
        socket.leave(player.roomId);
        delete SOCKET_LIST[socket.id];  
        delete PLAYER_LIST[socket.id];
        for(var i in ROOM_LIST[player.hostNumber]){
            if(player == ROOM_LIST[player.hostNumber][i])
            {
                ROOM_LIST[player.hostNumber].splice(i, 1);
                if(ROOM_LIST[player.hostNumber].length != 0)
                {
                    io.sockets.emit("clearPlayerList", ROOM_LIST[player.hostNumber][0].roomId);
                    io.sockets.emit("updatePlayerList", "connected users -", ROOM_LIST[player.hostNumber][0].roomId)
                }
                for(var i = 0; i<ROOM_LIST[player.hostNumber].length; i++){
                    io.sockets.emit("updatePlayerList", ROOM_LIST[player.hostNumber][i].name, ROOM_LIST[player.hostNumber][i].roomId)
                }
            }
        }
        if(player.isHost)
            delete ROOM_LIST[player.hostNumber]
    });
});