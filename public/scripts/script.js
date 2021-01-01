const socket = io.connect();
var userName ="";
var myRoomId = "";
var isHost = false;
var sessionType = ""
var myFileSize = 0;
var totalFileSize = 0;
var peer = new Peer();
var peerIds = []
var myPeerId = ""
var chunkArray = []
var isplaying = false
var doneParsing = false
peer.on("open", ()=>{
	myPeerId = peer.id;
})

function sendit(){
	if(document.getElementById("username").value != ""){
		userName = document.getElementById("username").value;
		socket.emit('host', userName);
		hide();
		
	}
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
		//var video = document.querySelector('video')
		//maybeCreateStream(video);
		//var call = peer.call(String(peerIds[0]), stream)
			//console.log("call send")
			//alert("splitting your video into small chunks");
			// var chunkSize = 1024 * 1024;
			// var chunks = Math.ceil(myFileSize/chunkSize,chunkSize);
			// console.log(chunks)
			// var chunk = 0;
			// while (chunk <= chunks) {
			// 	var offset = chunk*chunkSize;
			// 	//chunkArray[chunk] = [file][0].slice(offset, offset + chunkSize);
			// 	chunk++;
			// }
			//alert("splitting done");
			//tryConnect()
			for(var i in peerIds){
				console.log("connecting to peers")
				var conn = peer.connect(String(peerIds[i]))
				conn.on('open', function() {
					console.log("connected to peer")
					var chunksSent = 0;
					socket.on("sendNextchunk", (id)=>{
						console.log("next chunk sent")
						if(id == myRoomId){
							 if(isHost && chunksSent<chunkArray.length){
								conn.send(chunkArray[chunksSent]);
								chunksSent++;		
								 
							 }
						}
					})
					
					
					
				});
				conn.on('close', ()=>{
					console.log("connection cloased")
				})
			}
			//alert("please wait spliting your file click ok to start spliting");
			parseFile([file][0])
		
		
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

function tryConnect(){
	
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
			setTimeout(()=>{
				console.log("yo")
				socket.emit("sendNextchunkemit");}, 1000)
			socket.emit("test", chunkArray[0])
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
	socket.emit("mypeerid", myPeerId)
	
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

socket.on("heresmypeerid", (id, roomId)=>{
	if(roomId == myRoomId)
	{
		if(isHost)
		{
			peerIds.push(id)
		}
	}
});

//var sourceBuffer = null;
peer.on("connection", (conn)=>{
	console.log("connected to peer")
	document.getElementById("player").style.display = "flex"
	document.getElementById("1").style.display = "none"
	document.getElementById("myfile").style.display = "none"
	document.getElementsByClassName("vjs-big-play-button")[0].style.display = "none"
	conn.on('open', function() {
		console.log("on open works")
		var blobArray = []
		var chunksRecieved = 0
		var firsttime = true
		conn.on('data', function(data) {
			console.log('Received', data);
			var myplayer = videojs("my-video");
			blobArray.push(new Blob([new Uint8Array(data)],{'type':'video/mp4'}));
			let blob = new Blob(blobArray,{'type':'video/mp4'});
			chunksRecieved++;
			let currentTime = myplayer.currentTime();
			if(myplayer.paused()) 
				isplaying = false
			else 
				isplaying = true
			if(chunksRecieved%1 == 0 && firsttime)
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
			else if(chunksRecieved%1 == 0 && !firsttime)
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
			socket.emit("sendNextchunkemit");
		});
	  });
})

// peer.on("call", (call)=>{
// document.getElementById("player").style.display = "flex"
//  	call.answer(stream);
//  	var myplayer = videojs("my-video");
//  	console.log("call answered")
//  	call.on("stream", (stream)=>{
//  		if(!isHost){
// 			console.log(stream)
// 			//var url = URL.createObjectURL(stream)
   
// 			var vid = document.querySelector('video')
// 			  vid.srcObject = stream;
// 			console.log("added sourece obj")
// 		 }
// 	 })
//  })
