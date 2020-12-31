const socket = io.connect();
var userName ="";
var myRoomId = "";
var isHost = false;
var myFileSize = 0;
let pc1;
const iceServers = {
	iceServers: [
	  { urls: 'stun:stun.l.google.com:19302' },
	  { urls: 'stun:stun1.l.google.com:19302' },
	  { urls: 'stun:stun2.l.google.com:19302' },
	  { urls: 'stun:stun3.l.google.com:19302' },
	  { urls: 'stun:stun4.l.google.com:19302' },
	],
  }


function sendit(){
	if(document.getElementById("username").value != ""){
		userName = document.getElementById("username").value;
		socket.emit('host', userName);
		hide();
	}
}

let stream;
function maybeCreateStream(video) {
	if (stream) {
	  return;
	}
	if (video.captureStream) {
	  stream = video.captureStream();
	  console.log('Captured stream from video with captureStream',
		  stream);
	  call();
	} else if (video.mozCaptureStream) {
	  stream = video.mozCaptureStream();
	  console.log('Captured stream from video with mozCaptureStream()',
		  stream);
	  call();
	} else {
	  console.log('captureStream() not supported');
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
		var video = document.querySelector('video')
		maybeCreateStream(video);
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
			socket.emit("playvideo?", myRoomId, myFileSize);
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
		socket.emit("showPlayeremit1");
	}
	else
	{
		console.log("2")
		socket.emit("showPlayeremit2");
	} 
}
function call(){
	console.log("1")
	if (isHost) {
		pc1 = new RTCPeerConnection(iceServers)
		console.log("2")
		addLocalTracks(pc1)
		console.log("3")
		pc1.onicecandidate = sendIceCandidate
		console.log("4")
		socket.emit("test")
		//await createOffer(rtcPeerConnection)
	  }
	if(!isHost){
		document.getElementById("player").style.display = "flex";
		console.log("1")
		pc1 = new RTCPeerConnection(iceServers)
		console.log("2")
		pc1.ontrack = setRemoteStream
		console.log("3")
		pc1.onicecandidate = sendIceCandidate
		console.log("4")
	}
}

function addLocalTracks(rtcPeerConnection) {
	console.log("5")
	stream.getTracks().forEach((track) => {
	  rtcPeerConnection.addTrack(track, stream)
	})
}

function setRemoteStream(event) {
	console.log(event.streams[0])
	document.querySelector('video').srcObject = event.streams[0]
	stream = event.stream
}

function sendIceCandidate(event) {
	console.log("does this works >?")
	if (event.candidate) {
	  socket.emit('webrtc_ice_candidate', {
		  isHost,
		roomId,
		label: event.candidate.sdpMLineIndex,
		candidate: event.candidate.candidate,
	  })
	}
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

socket.on('webrtc_ice_candidate', (event, roomId, is) => {
	if(roomId == myRoomId){
		if(!is){
			
			console.log('Socket event callback: webrtc_ice_candidate')
	
			// ICE candidate configuration.
			var candidate = new RTCIceCandidate({
			sdpMLineIndex: event.label,
			candidate: event.candidate,
			})
			pc1.addIceCandidate(candidate)
		}
	}
  })

  socket.on("testi", (roomId)=>{
	if(roomId == myRoomId)
	{
		if(!isHost){
			call();
		}
	}
  })