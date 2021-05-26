const express = require('express');
const app = express();
const serv = require('http').createServer(app);
const Users = require('./schemas/user')
const fs = require('fs')
var path = require('path');


const mongoose = require('mongoose');
const { Router } = require('express');

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
    //res.sendFile(__dirname + '/rooms.html');
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
    //res.sendFile(__dirname + '/sw.js');
});

app.get('/guest', (req, res) =>
{
    res.sendFile(__dirname + '/guest.html');
});

app.get('/606169cd630a0d6978ddcb1e', (req, res) =>
{
    res.sendFile(__dirname + '/user.html');
});

app.get('/6064c38c51fb84001718d5f3', (req, res) =>
{
    res.sendFile(__dirname + '/user.html');
});

app.get('/606f5bec26e2936274a3361f', (req, res) =>
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
        roomType:"",
        isHost:false,
        isReady:false,
        fileSize:0,
        sessionType:"",
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

function makeid(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
}
return result.join('');
}


io.on('connection', function(socket){
    console.log('socket connected ');

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

    var player

    socket.on("changeSocketId", async (newId)=>{
        socket.id = newId
        SOCKET_LIST[socket.id] = socket;
        player = Player(socket.id);
        PLAYER_LIST[socket.id] = player;
        player.roomType = "login"
        //console.log(socket.id)
        let me = await Users.findOne({"_id":newId})
        socket.emit("welcomeUser", me.userName)
        player.name = me.userName
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




//          GUEST STUFF


    socket.on("createGuestRoom", id =>{
        app.get('/' + id, (req, res)=>{
            res.sendFile(__dirname + '/guest.html');
        })
        socket.emit("createGuestRoom")
    })

    socket.on("createGuestRoom2", (id, guestName) =>{
        if(SOCKET_LIST[id] == undefined)
        {
            socket.id = id
            socket.join(socket.id)
            SOCKET_LIST[socket.id] = socket;
            player = Player(socket.id);
            player.name = guestName
            PLAYER_LIST[socket.id] = player;
            PLAYER_LIST[socket.id].roomId = id
            player.roomType = "guest"
            //socket.emit("createGuestRoom2")
        }
        socket.emit("createGuestRoom2", socket.id, PLAYER_LIST[id].name)
    })

    socket.on("checkForHost", (roomId, guestName)=>{
        if(socket.id != roomId)
        {
            socket.id = makeid(30)
            socket.emit("checkForHost")
            socket.join(roomId)
            SOCKET_LIST[socket.id] = socket;
            player = Player(socket.id);
            player.name = guestName
            PLAYER_LIST[socket.id] = player;
            PLAYER_LIST[socket.id].roomId = roomId
            player.roomType = "guest"
            try 
            {
                let roomMemberArray = []
                for(let item of socket.adapter.rooms.get(roomId))
                {
                    roomMemberArray.push(PLAYER_LIST[item].name)   
                }
                for (let item of socket.adapter.rooms.get(roomId)) 
                {
                    SOCKET_LIST[item].emit('joinedRoom', roomMemberArray)
                    if (item == socket.id)
                    {
                        continue
                    }
                    console.log('sending init receive to ' + item)
                    SOCKET_LIST[item].emit('initReceive', socket.id, roomId)
                }
            }
            catch(e)
            {

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

    socket.on("tryLogin", async (e, p, b)=>{
        let user = await Users.findOne({$or:[ {'email':e}, {'userName':e}]})
        if(user == null)
        {
            socket.emit("loginFailed", "email")
        }
        else
        {
            if(!b)
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
                    socket.emit("loginSuccess", id, user.email, b)
                }
                else
                {
                    socket.emit("loginFailed", "password")
                }
            }
            else
            {
                user.alreadyLoggedIn = true
                await user.save()
                let id = user._id
                app.get('/'+id, (req, res) =>
                {
                    res.sendFile(__dirname + '/user.html');
                });
                socket.emit("loginSuccess", id, user.email, b)
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





//          FRIENDS STATUS STUFF



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





//          CHAT STUFF





    socket.on("message", async (message, friendsName, myName)=>{
        let friend = await Users.findOne({"userName":friendsName})
        try
        {
            SOCKET_LIST[friend._id].emit("message", 1, message, myName)
        }
        catch
        {
            socket.emit("friendOffline", friendsName)
        }
    })





//          NEW ROOMS STUFF



    socket.on("createRoom", ()=>{
        socket.join(socket.id)
        SOCKET_LIST[socket.id].emit('joinedRoom', PLAYER_LIST[socket.id].name)
        //console.log(socket.adapter.rooms.get(socket.id).size)
        //console.log(socket.adapter.rooms.get(socket.id))
    })

    socket.on("inviteToRoom", async (friendsName, myName)=>{
        let friend = await Users.findOne({"userName":friendsName})
        try
        {
            SOCKET_LIST[friend._id].emit("invitationToRoom", socket.id, myName)
            socket.emit("invitedToRoom")
        }
        catch
        {
            socket.emit("inviteToRoomFailed")
        }
    })

    socket.on("acceptInvitationToRoom", (id, myName, friendsName) => {
        socket.join(id)
            try 
            {
                let roomMemberArray = []
                for(let item of socket.adapter.rooms.get(id))
                {
                    roomMemberArray.push(PLAYER_LIST[item].name)    
                }
                for (let item of socket.adapter.rooms.get(id)) 
                {
                    SOCKET_LIST[item].emit('joinedRoom', roomMemberArray)
                    if (item == socket.id)
                    {
                        continue
                    }
                    console.log('sending init receive to ' + item)
                    SOCKET_LIST[item].emit('initReceive', socket.id, id)
                }
                SOCKET_LIST[id].emit("acceptingInviteToRoom", myName)
                socket.on("connectedToRoom", ()=>{
                    SOCKET_LIST[id].emit("acceptedInviteToRoom", myName)
                })
                socket.emit("acceptedInvitationToRoom", id, friendsName)
                PLAYER_LIST[socket.id].roomId = id
            }
            catch (e) 
            {
                console.log(e)
                if (e == "TypeError: Cannot read property 'emit' of undefined") 
                {
                    SOCKET_LIST[socket.id].emit("accepteInvitationToRoomFailed")
                }
            }
        // console.log(socket.adapter.rooms.get(id).size)
        // console.log(socket.adapter.rooms.get(id))
    })

    socket.on("rejectInvitationToRoom", (id, friendsName)=>{
        setTimeout(() => 
        {
            try 
            {
                SOCKET_LIST[id].emit("rejectInvitationToRoom", friendsName)
            }
            catch (e) 
            {
                if (e == "TypeError: Cannot read property 'emit' of undefined") 
                {
                    SOCKET_LIST[socket.id].emit("accepteInvitationToRoomFailed")
                }
            }

        }, 1000);
    })

    socket.on('initSend', (init_socket_id, id) => {
        console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id)
        SOCKET_LIST[init_socket_id].emit('initSend', socket.id, id)
    })

    socket.on("sessionType", (currentSessionType)=>{
        //PLAYER_LIST[roomId].sessionType
        let lastestJoinedUser;
        for(lastestJoinedUser of socket.adapter.rooms.get(PLAYER_LIST[socket.id].roomId));
        SOCKET_LIST[lastestJoinedUser].emit("sessionType", currentSessionType)
    })

    



//          VOICE CHAT STUFF





    socket.on("playAudioEmit", (n, id) => {
        for (let item of socket.adapter.rooms.get(id)) 
        {
            if (item == socket.id) continue
            if (n == 1)
                SOCKET_LIST[item].emit("playAudio", socket.id)
            else if (n == 2)
                SOCKET_LIST[item].emit("pauseAudio", socket.id)
        }
    });








//          SUBS

    socket.on("subs", (_file)=>{
        var filePath = path.resolve('./public/uploads');
        var filename = socket.id + '.vtt';
        var file = filePath + '/' + filename;
        fs.writeFile(file, _file,'utf8', function (err) {
            if (err) {
              return console.log(err);
            }
            else
            {
                fs.readFile('./public/uploads/' + socket.id + '.vtt', 'utf8' , (err, data) => {
                    if (err) {
                      console.error(err)
                      return
                    }
                    let vtt = srt2webvtt(data)

                    function srt2webvtt(data) {
                        // remove dos newlines
                        var srt = data.replace(/\r+/g, '');
                        // trim white space start and end
                        srt = srt.replace(/^\s+|\s+$/g, '');
                        // get cues
                        var cuelist = srt.split('\n\n');
                        var result = "";
                        if (cuelist.length > 0) {
                          result += "WEBVTT\n\n";
                          for (var i = 0; i < cuelist.length; i=i+1) {
                            result += convertSrtCue(cuelist[i]);
                          }
                        }
                        return result;
                    }
                    function convertSrtCue(caption) {
                        //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');
                        var cue = "";
                        var s = caption.split(/\n/);
                        while (s.length > 3) {
                            for (var i = 3; i < s.length; i++) {
                                s[2] += "\n" + s[i]
                            }
                            s.splice(3, s.length - 3);
                        }
                        var line = 0;
                        // detect identifier
                        try {
                            if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
                                cue += s[0].match(/\w+/) + "\n";
                                line += 1;
                              }
                        } catch (error) {
                            console.log(error)
                        }
                        
                        // get time strings
                        if (s[line].match(/\d+:\d+:\d+/)) {
                          // convert time string
                          var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
                          if (m) {
                            cue += m[1]+":"+m[2]+":"+m[3]+"."+m[4]+" --> "
                                  +m[5]+":"+m[6]+":"+m[7]+"."+m[8]+"\n";
                            line += 1;
                          } else {
                            // Unrecognized timestring
                            return "";
                          }
                        } else {
                          // file format error or comment lines
                          return "";
                        }
                        // get cue text
                        if (s[line]) {
                          cue += s[line] + "\n\n";
                        }
                        return cue;
                    }
                    for (let item of socket.adapter.rooms.get(socket.id)) {
                        if (item == socket.id) continue
                        try {
                            SOCKET_LIST[item].emit("subs", vtt)
                        } catch (error) {
                            console.log(error)
                        }
                    }
                })
                
            }
        });
    })

    // socket.on("subs", url=>{
    //     for (let item of socket.adapter.rooms.get(socket.id)) {
    //         if (item == socket.id) continue
    //         SOCKET_LIST[item].emit("subs", url)
    //     }
    // })





//          "LOAD FILE SESSION" TYPE STUFF




    socket.on("hostLoadedFile", (hostId)=>{
        for (let item of socket.adapter.rooms.get(hostId)) {
            if (item == socket.id) continue
            SOCKET_LIST[item].emit('hostLoadedFile')
        }
    })

    socket.on("getCurrentTime",(currentSessionType, hostId, currentFileSize)=>{
        if(currentSessionType == "load")
        {
            SOCKET_LIST[hostId].emit("getCurrentTimeLoad", socket.id, currentFileSize)
        }
    })

    socket.on("setCurrentTime", (id, currentTime, currentSessionType)=>{
        console.log(currentTime)
        if(currentSessionType == "load")
        {
            SOCKET_LIST[id].emit("setCurrentTimeLoad", currentTime)
        }
    })

    socket.on("wrongFile", id=>{
        SOCKET_LIST[id].emit("wrongFile")
    })





//          "STREAM SESSION" TYPE STUFF





    socket.on("streamInfo", (size, length, hostId)=>{
        for (let item of socket.adapter.rooms.get(hostId)) {
            SOCKET_LIST[item].emit('streamInfo', size, length)
        }
    })

    socket.on("streamInfoToNew", (size, length, hostId)=>{
        let final
        for (let item of socket.adapter.rooms.get(hostId)) {
            final = item
        }
        SOCKET_LIST[final].emit('streamInfo', size, length)
    })

    socket.on("readyToStream", (hostId)=>{
        SOCKET_LIST[hostId].emit("readyToStream")
    })






//          COMMON SYNC STUFF




    socket.on("pauseEmit", (time)=>{
        for (let item of socket.adapter.rooms.get(socket.id)) {
            try {
                SOCKET_LIST[item].emit('pause', time)
            } catch (error) {
                console.log(error)
            }
        }
    });

    socket.on("playEmit", (time)=>{
        for (let item of socket.adapter.rooms.get(socket.id)) {
            try {
                SOCKET_LIST[item].emit('play', time)
            } catch (error) {
                console.log(error)
            }
        }
    });



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

    

    socket.on("sendNextchunkemit", ()=>{
        //console.log("recieved")
        io.sockets.emit("sendNextchunk", player.roomId);
    });

    socket.on("showplayer2emit", ()=>{
        //console.log("recieved")
        io.sockets.emit("showplayer2", player.roomId);
    });

    

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
        if(socket.id.length > 20)
        {
            let me
            if(PLAYER_LIST[socket.id].roomType == "login")
            {
                me = await Users.findOne({"_id":socket.id})
                if(me != null)
                {
                    me.alreadyLoggedIn = false
                    me.save()
                    for (let i = 0; i < me.friends.length; i++)
                    {
                        let friend = await Users.findOne({"userName":me.friends[i]})
                        if(SOCKET_LIST[friend._id] != undefined)
                        {
                            SOCKET_LIST[friend._id].emit("wentOffline", me.userName)
                        }
                    } 
                }
            }
            
            let roomMemberArray = []
            try
            {
                for(let item of socket.adapter.rooms.get(PLAYER_LIST[socket.id].roomId))
                {
                    if (item == socket.id) continue
                    roomMemberArray.push(PLAYER_LIST[item].name)    
                }
                for (let item of socket.adapter.rooms.get(PLAYER_LIST[socket.id].roomId))
                {
                    SOCKET_LIST[item].emit('leftRoom', roomMemberArray)
                }
            }
            catch(e)
            {
                console.log(e)
            }
            
            
        }
        //io.sockets.emit("chatToOthers", player.roomId, player.name+" left the room", test, " ");
        //io.sockets.emit('removePeer', socket.id, player.roomId)
        delete peers[socket.id]
        //socket.leave(player.roomId);
        delete SOCKET_LIST[socket.id];  
        delete PLAYER_LIST[socket.id];
        // for(var i in ROOM_LIST[player.hostNumber]){
        //     if(player == ROOM_LIST[player.hostNumber][i])
        //     {
        //         ROOM_LIST[player.hostNumber].splice(i, 1);
        //         if(ROOM_LIST[player.hostNumber].length != 0)
        //         {
        //             io.sockets.emit("clearPlayerList", ROOM_LIST[player.hostNumber][0].roomId);
        //             io.sockets.emit("updatePlayerList", "connected users -", ROOM_LIST[player.hostNumber][0].roomId)
        //         }
        //         for(var i = 0; i<ROOM_LIST[player.hostNumber].length; i++){
        //             io.sockets.emit("updatePlayerList", ROOM_LIST[player.hostNumber][i].name, ROOM_LIST[player.hostNumber][i].roomId)
        //         }
        //     }
        // }
        // if(player.isHost)
        //     delete ROOM_LIST[player.hostNumber]
    });
});