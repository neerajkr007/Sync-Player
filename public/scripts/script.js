const socket = io.connect();
var userName ="";
var myRoomId = "";
var isHost = false;
var sessionType = ""
var myFileSize = 0;
var totalFileSize = 0;
let stream
var chunkArray = []
var isplaying = false
var doneParsing = false
let peers = {}
const configuration = {
    "iceServers": [{
            "urls": "stun:stun.l.google.com:19302"
        },
        // public turn server from https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b
        // set your own servers here
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        }
    ]
}
function maybeCreateStream(leftVideo) {
  if (stream) {
    return;
  }
  if (leftVideo.captureStream) {
	stream = leftVideo.captureStream();
    console.log('Captured stream from leftVideo with captureStream',
		stream);
		//init()
  } else if (leftVideo.mozCaptureStream) {
    stream = leftVideo.mozCaptureStream();
    console.log('Captured stream from leftVideo with mozCaptureStream()',
        stream);
  } else {
    console.log('captureStream() not supported');
  }
}

function sendit(){
	if(document.getElementById("username").value != ""){
		userName = document.getElementById("username").value;
		socket.emit('host', userName);
		hide();
		
	}
}

function init() {

    socket.on('initReceive', socket_id => {
        console.log('INIT RECEIVE ' + socket_id)
        addPeer(socket_id, false)
        socket.emit('initSend', socket_id)
    })

    socket.on('initSend', socket_id => {
        console.log('INIT SEND ' + socket_id)
        addPeer(socket_id, true)
    })

    socket.on('removePeer', socket_id => {
        console.log('removing peer ' + socket_id)
        //removePeer(socket_id)
    })

    socket.on('disconnect', () => {
        console.log('GOT DISCONNECTED')
        for (let socket_id in peers) {
            //removePeer(socket_id)
        }
    })

    socket.on('signal', data => {
        peers[data.socket_id].signal(data.signal)
    })
}

function addPeer(socket_id, am_initiator) {
	console.log(stream)
    peers[socket_id] = new SimplePeer({
        initiator: am_initiator,
        stream: stream,
        config: configuration
    })

    peers[socket_id].on('signal', data => {
        socket.emit('signal', {
            signal: data,
            socket_id: socket_id
        })
    })

    peers[socket_id].on('stream', stream => {
		console.log(stream)
		let newVid = document.createElement('video')
        newVid.srcObject = stream
        newVid.id = "yolo"
        newVid.playsinline = false
		newVid.autoplay = true
		newVid.controls = true
		newVid.width = "300px"
		newVid.className = "video-js"
		document.getElementById("test").appendChild(newVid)
		
		var myplayer= videojs("yolo")
		myplayer.fluid(true)
    })
}

function  loadVideo(e){
	console.log("works");
	const { target: { files } } = e
	const [file] = files
	myFileSize = [file][0].size;
	var blob = new Blob([file], { type: 'video/mp4' })
	var blobURL = URL.createObjectURL(blob)
	var myplayer = videojs("my-video");
	myplayer.src({type: 'video/mp4', src: blobURL});
	myplayer.on('loadeddata', (e)=>{
		var video = document.querySelector('video')
		maybeCreateStream(video);
		init()
		if(isHost){
			socket.emit("showplayer2emit");
		}
		socket.emit("ready", myFileSize);
	});
	var playButton = document.getElementsByClassName("vjs-big-play-button")[0];
	if(!isHost){
		playButton.style.display = "none";
		myplayer.controls(false);
	}
	else{
		var video = document.querySelector('video');
		video.addEventListener('play', function once (){
			video.removeEventListener('play', once)
			myplayer.pause();
			socket.emit("playvideo?", myRoomId, myFileSize, sessionType);
		});
	}
}  

function hide(){
    document.getElementById("host").style.display = "none";
	document.getElementById("join").style.display = "none";
	document.getElementById("nameField").style.display = "none";
}

function tryJoin(){
	userName = document.getElementById("username").value;
	roomId = document.getElementById("enteredId").value;
	console.log(roomId);
	socket.emit("tryJoin", roomId, userName);
}  

function showPlayeremit(){
	$('#Modal3').modal('toggle')
	document.getElementById("go").style.display = "none";
	if(document.getElementById("Radios1").checked)
	{
		console.log("1")
		sessionType = "load"
		socket.emit("showPlayeremit1");
	}
	else
	{
		console.log("2")
		sessionType = "stream"
		socket.emit("showPlayeremit2");
	} 
}

function callback(e){
	console.log("pushed");
	chunkArray.push(e);
	
	//var blob = new Blob([e]);
	//console.log(URL.createObjectURL(blob))
}

function parseFile(file) {
    var fileSize   = file.size;
    var chunkSize  = 1024 * 1024; // bytes
    var offset     = 0;
    var self       = this; // we need a reference to the current object
    var chunkReaderBlock = null;

    var readEventHandler = function(evt) {
        if (evt.target.error == null) {
            offset += chunkSize;
            callback(evt.target.result); // callback for handling read chunk
        } else {
            console.log("Read error: " + evt.target.error);
            return;
        }
        if (offset >= fileSize) {
			console.log("Done reading file");
			//alert("spliting complete");
			// conn.on("open",()=>{
			// 	console.log("yo peer connected")
			// 	document.getElementById("waitingMsg").outerHTML = "<h5 id='waitingMsg' class='text-center'>loading stream on other users devices</h5>";
			// 	socket.emit("sendNextchunkemit");
			// })
			doneParsing = true
            return;
        }

		// of to the next chunk
		chunkReaderBlock(offset, chunkSize, file);
		
        
    }

    chunkReaderBlock = function(_offset, length, _file) {
        var r = new FileReader();
        var blob = _file.slice(_offset, length + _offset);
        r.onload = readEventHandler;
        r.readAsArrayBuffer(blob);
    }

    // now let's start the read with the first block
    chunkReaderBlock(offset, chunkSize, file);
}


socket.on("hosted", function(data){
	myRoomId = data;
	isHost = true;
	document.getElementById("playerList").style.display = "inline-flex";
	document.getElementById("go").style.display = "flex";
    document.getElementById("gameId").outerHTML = "<h4 id='gameId' class='display-5 text-center'></h4>";
	document.getElementById("gameId").style.display = "inline-flex";
	document.getElementById("gameId").innerHTML = "room id -  "+ data;
	document.getElementById("waitingMsg").style.display = "inline-flex";
	document.getElementById("waitingMsg").outerHTML = "<h5 id='waitingMsg' class='text-center'> click go to load the player</h5>";
});

socket.on("joined", function(data){
	document.getElementById("playerList").style.display = "inline-flex";
	myRoomId = data;
	document.getElementById("gameId").outerHTML = "<h4 id='gameId' class='display-5 text-center'></h4>";
	document.getElementById("gameId").style.display = "inline-flex";
	document.getElementById("gameId").innerHTML = " joined room id -  "+ data;
	document.getElementById("waitingMsg").style.display = "inline-flex";
	document.getElementById("waitingMsg").outerHTML = "<h5 id='waitingMsg' class='text-center'> waiting for the host to start...</h5>";
	$('#exampleModal2').modal('toggle')
	
});

socket.on("notJoined", function(){
	alert("id incorrect !");
});

socket.on("clearPlayerList", (roomId)=>{
	if(roomId == myRoomId)
	{	
		document.getElementById("playerList").innerHTML="";
	}
});

socket.on("updatePlayerList", (name, roomId)=>{
	if(roomId == myRoomId)
	{
		var node = document.createElement("LI");   
		node.innerHTML = "<li class='list-group-item' style='background: transparent;'>" + name +"</li>"                 // Append the text to <li>
		document.getElementById("playerList").appendChild(node);
	}
});

socket.on("showPlayer", (roomId)=>{
	if(roomId == myRoomId)
	{
		document.getElementById("player").style.display = "flex";
	}
});

socket.on("playVideo", (roomId)=>{
	if(roomId == myRoomId)
	{	
		console.log("works ?")
		var myplayer = videojs("my-video");
		myplayer.play();
		myplayer.controls(true);
		
		if(isHost){
			var video = document.querySelector('video');
			video.addEventListener('pause', function once (){
				video.removeEventListener('pause', once)
				var time = myplayer.currentTime();
				socket.emit("pauseEmit", time);
			});
		}
	}
});

socket.on("fileSize", (size, roomId)=>{
	if(roomId == myRoomId)
	{
		console.log(typeof size)
		totalFileSize  = size;
	}
});

socket.on("pause", (roomId, time)=>{
	if(roomId == myRoomId)
	{
		var myplayer = videojs("my-video");
		myplayer.currentTime(time);
		myplayer.pause();
		if(isHost){
			var video = document.querySelector('video');
			video.addEventListener('play', function once (){
				video.removeEventListener('play', once)
				socket.emit("playEmit");
			});
		}
	}
});

socket.on("play", (roomId)=>{
	if(roomId == myRoomId)
	{
		var myplayer = videojs("my-video");
		myplayer.play();
		if(isHost){
			var video = document.querySelector('video');
			video.addEventListener('pause', function once (){
				video.removeEventListener('pause', once)
				var time = myplayer.currentTime();
				socket.emit("pauseEmit", time);
			});
		}
	}
});

socket.on("showplayer2", (roomId)=>{
	if(roomId == myRoomId && !isHost)
	{
		init();
		socket.emit("ready2");
		document.getElementById("player").style.display = "flex"
		document.getElementById("1").style.display = "none"
		document.getElementById("myfile").style.display = "none"
		document.getElementById("my-video").style.display = "none"
		//document.getElementsByClassName("vjs-big-play-button")[0].style.display = "none"
		//setTimeout(()=>{if(!isHost){listen()}}, 1000)
	}
});