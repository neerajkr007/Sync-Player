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
var ROOM_LIST = {};
for (var i = 0, l = 10; i < l; i++){
    ROOM_LIST[i] = {};
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
    } 
    return self;
}
var numberOfHosts = 0;

io.on('connection', function(socket){
    console.log('socket connected ');
    socket.id = String(Math.floor(Math.random() * (Math.floor(9999) - Math.ceil(1000) + 1) + Math.ceil(1000)));
    console.log(socket.id);
    SOCKET_LIST[socket.id] = socket;
    var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;
    socket.on("host", function(name){
        //ROOM_LIST[player.id] = player;
        //player.myRoomNumber = numberOfHosts;
        socket.join(player.id);
        player.roomId = player.id;
        player.name = name;
        player.isHost = true;
        //console.log(player.name); 
        //updatePlayerList();
        socket.adapter.rooms.get(player.id).size;
        //ROOM_LIST[0][0] = player;
        numberOfHosts++;
        //console.log(ROOM_LIST[numberOfHosts][0])
        socket.emit("hosted", String(player.id));
    }); 


    socket.on("tryJoin", (id, name) => {
        for(var i in SOCKET_LIST){  
            if(id == SOCKET_LIST[i].id){
                socket.join(id);  
                player.roomId = id;
                player.name = name;
                //console.log(socket);
                //updatePlayerList();
                socket.emit("joined", player.roomId);
                return true;   
            }  
        }
        socket.emit("notJoined"); 
    });

    function updatePlayerList(){
        for(var i in PLAYER_LIST)
        {
            if(player.roomId == PLAYER_LIST[i].roomId)
            {
                socket.emit("updatePlayerList", PLAYER_LIST[i].name)
            }
        }
        
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
        delete SOCKET_LIST[socket.id];  
		delete PLAYER_LIST[socket.id];
    });
});