const socket = io.connect();
var userName ="";
var myRoomId = "";
var isHost = false;
var myFileSize = 0;


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
		socket.emit("ready", myFileSize);
	});
	if(!isHost){
		myplayer.controls(false);
	}
	var playButton = document.getElementsByClassName("vjs-big-play-button")[0];
	if(isHost){
		var video = document.querySelector('video');
		video.addEventListener('play', function once (){
			video.removeEventListener('play', once)
			myplayer.pause();
			socket.emit("playvideo?", myRoomId, myFileSize);
		});
	}
	else{
		playButton.style.display = "none";
		//document.querySelector("video").innerHTML = "controls": false, "techOrder": ["html5", "flash", "other supported tech"]
		//myplayer.data-setup
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
	socket.emit("showPlayeremit");
}

socket.on("hosted", function(data){
	myRoomId = data;
	isHost = true;
	//document.getElementById("playerList").style.display = "inline-flex";
	document.getElementById("go").style.display = "flex";
    document.getElementById("gameId").outerHTML = "<h4 id='gameId' class='display-5 text-center'></h4>";
	document.getElementById("gameId").style.display = "inline-flex";
	document.getElementById("gameId").innerHTML = "game id -  "+ data;
	document.getElementById("waitingMsg").style.display = "inline-flex";
	document.getElementById("waitingMsg").outerHTML = "<h5 id='waitingMsg' class='text-center'> waiting for other player to join...</h5>";
});

socket.on("joined", function(data){
	//document.getElementById("playerList").style.display = "inline-flex";
	myRoomId = data;
	document.getElementById("gameId").outerHTML = "<h4 id='gameId' class='display-5 text-center'></h4>";
	document.getElementById("gameId").style.display = "inline-flex";
	document.getElementById("gameId").innerHTML = " joined game id -  "+ data;
	document.getElementById("waitingMsg").style.display = "inline-flex";
	document.getElementById("waitingMsg").outerHTML = "<h5 id='waitingMsg' class='text-center'> waiting for the host to start...</h5>";
	$('#exampleModal2').modal('toggle')
	
});

socket.on("notJoined", function(){
	alert("id incorrect !");
});

socket.on("updatePlayerList", (name)=>{
	var node = document.createElement("LI");   
	node.innerHTML = "<li class='list-group-item' style='background: transparent;'>" + name +"</li>"                 // Append the text to <li>
	document.getElementById("playerList").appendChild(node);
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
		
		if(isHost){
			var video = document.querySelector('video');
			video.addEventListener('pause', e=>{
				socket.emit("pauseEmit");
			});
		}
	}
});

socket.on("pause", (roomId)=>{
	if(roomId == myRoomId)
	{
		var myplayer = videojs("my-video");
		myplayer.pause();
		if(isHost){
			var video = document.querySelector('video');
			video.addEventListener('play', e=>{
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
			video.addEventListener('pause', e=>{
				socket.emit("pauseEmit");
			});
		}
	}
});