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
	var node = document.createElement("LI");   
	node.innerHTML = "<li class='list-group-item' style='background: transparent;'></li>"              // Create a <li> node
	var textnode = document.createTextNode(data);         // Create a text node
	node.appendChild(textnode);                              // Append the text to <li>
	document.getElementById("playerList").appendChild(node);
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