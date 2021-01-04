const socket = io.connect();
var userName ="";
var myRoomId = "";
var isHost = false;
var sessionType = ""
var myFileSize = 0;
var totalFileSize = 0;
let stream
var chunkArray = []
var blobArray = []
var isplaying = false
var doneParsing = false
let peers = {}
//"stun:bn-turn1.xirsys.com"
const configuration = {
	iceServers: [{   urls: [ "stun:global.stun.twilio.com:3478?transport=udp" ]}, 
	{   username: "8KYgw1JiOE8ifuMVMJJhADMVLAx9rrGgZgk0b6UE7SQWG9HDlqdlFfvGbMlz64AcAAAAAF_yDcZzdHJpZGVy",   
		credential: "0eaa9930-4df2-11eb-8e11-0242ac140004",   
		urls: [       
			"turn:bn-turn1.xirsys.com:80?transport=udp",       
			"turn:bn-turn1.xirsys.com:3478?transport=udp",       
			"turn:bn-turn1.xirsys.com:80?transport=tcp",       
			"turn:bn-turn1.xirsys.com:3478?transport=tcp",       
			"turns:bn-turn1.xirsys.com:443?transport=tcp",       
			"turns:bn-turn1.xirsys.com:5349?transport=tcp"   ]}]
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
    peers[socket_id] = new SimplePeer({
        initiator: am_initiator,
        config: configuration
    })

    peers[socket_id].on('signal', data => {
        socket.emit('signal', {
            signal: data,
            socket_id: socket_id
        })
    })

    peers[socket_id].on('connect', () => {
		console.log("connected")
		socket.emit("sendnextchunkemit", myRoomId)
		var i = 0
		socket.on("sendnextchunk", ()=>{
			if(i < chunkArray.length){
				console.log("chunk sent")
				peers[socket_id].send(chunkArray[i])
				i++
			}
		})
		var chunksRecieved = 0
		var firsttime = true
		peers[socket_id].on('data', data =>{
			console.log('Received');
			var myplayer = videojs("my-video");
			blobArray.push(new Blob([new Uint8Array(data)],{'type':'video/mp4'}));
			let blob = new Blob(blobArray,{'type':'video/mp4'});
			chunksRecieved++;
			let currentTime = myplayer.currentTime();
			if(myplayer.paused()) 
				isplaying = false
			else 
				isplaying = true
			if(chunksRecieved%25 == 0 && firsttime)
			{
				myplayer.src({type: 'video/mp4', src: URL.createObjectURL(blob)});
				console.log("all set to load")
				if(totalFileSize != 0)
					document.getElementById("progress").innerHTML = blob.size/totalFileSize*100
				myplayer.on('loadeddata', (e)=>{
					myplayer.currentTime(currentTime);
					if(isplaying)
						myplayer.play();
					else 
						myplayer.pause();
				});
				if(firsttime){
					socket.emit("ready2");
					firsttime = false
				}
				
			}
			else if(chunksRecieved%25 == 0 && !firsttime)
			{
				if(totalFileSize != 0)
					document.getElementById("progress").innerHTML = blob.size/totalFileSize*100 + " %"
				myplayer.src({type: 'video/mp4', src: URL.createObjectURL(blob)});
				console.log("all set to load")
				myplayer.on('loadeddata', (e)=>{
					myplayer.currentTime(currentTime);
					if(isplaying)
						myplayer.play();
					else 
						myplayer.pause();
				});
				console.log(blob)
			}
			socket.emit("sendnextchunkemit", myRoomId);
		})
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
		alert("spliting files")
		parseFile([file][0])
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
    var chunkSize  = 262144; // bytes
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
			alert("spliting complete");
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
		document.getElementById("player").style.display = "flex"
		document.getElementById("1").style.display = "none"
		document.getElementById("myfile").style.display = "none"
		document.getElementsByClassName("vjs-big-play-button")[0].style.display = "none"
	}
});