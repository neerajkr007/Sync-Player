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
var Player = function(id){
	var self = {
        id:id,
        roomId: "",
    } 
    return self;
}

io.sockets.on('connection', function(socket){
    console.log('socket connected ');
    socket.id = String(Math.floor(Math.random() * (Math.floor(9999) - Math.ceil(1000) + 1) + Math.ceil(1000)));
    console.log(socket.id);
    SOCKET_LIST[socket.id] = socket;
    var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;
    socket.on("host", function(){
        socket.join(player.id);
        player.roomId = player.id;
        socket.emit("hosted", String(player.id));  
    });


    socket.on("tryJoin", id => {
        for(var i in SOCKET_LIST){
            if(id == SOCKET_LIST[i].id){
                socket.join(id);  
                player.roomId = id;
                socket.emit("joined"); 
                return true;   
            }  
        }
        socket.emit("notJoined"); 
    });

    socket.on('disconnect',function(){
        console.log('socket disconnected ');
        delete SOCKET_LIST[socket.id]; 
		delete PLAYER_LIST[socket.id];
    });
});