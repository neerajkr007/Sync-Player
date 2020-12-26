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
	const blob = new Blob([file], { type: 'video/mp4' })
	const blobURL = URL.createObjectURL(blob)
	console.log(blobURL)
	var video = document.getElementById("my-video")
	video.addEventListener('loadeddata', function once () {
		video.removeEventListener('loadeddata', once)
		video.play()
	})
	video.src = blobURL
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

socket.on("hosted", function(data){
	roomId = data;
	//var node = document.createElement("LI");   
	//node.innerHTML = "<li class='list-group-item' style='background: transparent;'>" + userName +"</li>"                 // Append the text to <li>
	//document.getElementById("playerList").appendChild(node);
    document.getElementById("gameId").outerHTML = "<h4 id='gameId' class='display-5 text-center'></h4>";
	document.getElementById("gameId").style.display = "inline-flex";
	document.getElementById("gameId").innerHTML = "game id -  "+ data;
	document.getElementById("waitingMsg").style.display = "inline-flex";
	document.getElementById("waitingMsg").outerHTML = "<h5 id='waitingMsg' class='text-center'> waiting for other player to join...</h5>";
});

socket.on("joined", function(){
	$('#exampleModal2').modal('toggle')
	
});

socket.on("notJoined", function(){
	alert("id incorrect !");
});