const express = require('express');
const app = express();
const serv = require('http').createServer(app);
 

app.get('/', (req, res) =>
{
    res.sendFile(__dirname + '/index.html');
});

app.get('/index.html', (req, res) =>
{
    res.sendFile(__dirname + '/index.html');
}); 

app.get('/rooms.html', (req, res) =>
{
    res.sendFile(__dirname + '/rooms.html');
}); 

app.get('/main.html', (req, res) =>
{
    res.sendFile(__dirname + '/main.html');
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

var eventify = function(arr, callback) {
    arr.push = function(e) {
        Array.prototype.push.call(arr, e);
        callback(arr);
    };
};

io.on('connection', function(socket){
    console.log('socket connected ');
    socket.id = String(Math.floor(Math.random() * (Math.floor(9999) - Math.ceil(1000) + 1) + Math.ceil(1000)));
    console.log(socket.id);
    SOCKET_LIST[socket.id] = socket;
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
    

    function callEventify(id){
        eventify(ROOM_LIST[id], function(updatedArr) {
            //if(updatedArr.length>1){
                io.sockets.emit("clearPlayerList", updatedArr[0].roomId);
                io.sockets.emit("updatePlayerList", "connected users -", updatedArr[0].roomId)
                for(var i = 0; i<updatedArr.length; i++){
                    io.sockets.emit("updatePlayerList", updatedArr[i].name, updatedArr[i].roomId)
                }
            //}
            //io.sockets.emit("updatePlayerList", updatedArr[updatedArr.length - 1].name, updatedArr[updatedArr.length - 1].roomId)
          });
    }


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
                socket.emit("joined", player.roomId);
                updatePlayerList();
                return true;   
            }  
        }
        socket.emit("notJoined"); 
    });

    function updatePlayerList(){
        ROOM_LIST[player.hostNumber].push(player);
    }

    socket.on("showPlayeremit", ()=>{
        io.sockets.emit("showPlayer", player.roomId);
        //console.log(io.in(String(player.roomId)).emit("showPlayer"))
        //for(var i in PLAYER_LIST)
        //{
            //if(player.roomId == PLAYER_LIST[i].roomId)
            //{
                //io.to(PLAYER_LIST[i].id).emit("showPlayer")
            //}
        //}
        //io.sockets.emit("showPlayer");
    });

    socket.on("ready", (size)=>{
        player.isReady = true;
        player.fileSize = size;
        console.log("ready");
    });

    socket.on("playvideo?", (roomID, size)=>{
        for(var i in PLAYER_LIST)
        {
            if(roomID == PLAYER_LIST[i].roomId) 
            {
                if(!PLAYER_LIST[i].isReady || PLAYER_LIST[i].fileSize != size){
                    alert("not ready or wrong size");
                    return false;
                }
            }
        }
        io.sockets.emit("playVideo", player.roomId);
    });

    socket.on("pauseEmit", (time )=>{
        io.sockets.emit("pause", player.roomId, time);
    });

    socket.on("playEmit", ()=>{
        io.sockets.emit("play", player.roomId);
    });

    socket.on('disconnect',function(){
        console.log('socket disconnected ');
        socket.leave(player.roomId);
        delete SOCKET_LIST[socket.id];  
        delete PLAYER_LIST[socket.id];
        if(player.isHost)
            delete ROOM_LIST[player.hostNumber]
    });
});