const socket = io.connect();
var userName ="";


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
	var blob = new Blob([file], { type: 'video/mp4' })
	var blobURL = URL.createObjectURL(blob)
	var myplayer = videojs("my-video")
	var video = document.querySelector("video");
	myplayer.src({type: 'video/mp4', src: blobURL});
	video.addEventListener('loadeddata', (e)=>{
		socket.emit("ready");
	});
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
	roomId = data;
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

socket.on("showPlayer", ()=>{
	document.getElementById("player").style.display = "flex";
});