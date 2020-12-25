const socket = io.connect();

function hide(){
    document.getElementById("host").style.display = "none";
    document.getElementById("join").style.display = "none";
}

function tryJoin(){
	roomId = document.getElementById("enteredId").value;
	console.log(roomId);
	socket.emit("tryJoin", roomId);
}

socket.on("hosted", function(data){
    roomId = data;
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