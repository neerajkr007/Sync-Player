const socket = io.connect();
var userName ="";
var myRoomId = "";
var isHost = false;
var myFileSize = 0;
var client = new WebTorrent()

client.on('error', function (err) {
	console.error('ERROR: ' + err.message)
})
var torrentId = 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4';
//after recieving torrentid
function onTorrent (torrent) {
	console.log("torrent loaded");
	// Print out progress every 5 seconds
	var interval = setInterval(function () {
	  console.log('Progress: ' + (torrent.progress * 100).toFixed(1) + '%')
	}, 5000)

	torrent.on('done', function () {
	  console.log('Progress: 100%')
	  clearInterval(interval)
	})
	const file = torrent.files.find(function(file) {
			return file.name.endsWith('.mp4')
		});
	file.renderTo("video#my-video_html5_api", {}, () => {
		console.log("Ready to play!");
	  });
	
	//document.querySelector('video').controls = false
	var myplayer = videojs("my-video")
	myplayer.controls(false)
	// var myplayer = videojs("my-video", {preload: "auto",controls: true,fluid: true,autoplay: false});
	// var blobUrl=document.getElementById("my-video").getAttribute("src");
	// setTimeout(function(){myplayer.src= { type: "video/mp4", "src": blobUrl };},100);

	
	//document.querySelector('video').controls = false
}


function sendit(){
	if(document.getElementById("username").value != ""){
		userName = document.getElementById("username").value;
		socket.emit('host', userName);
		hide();
	}
}

function  loadVideo(e){
	console.log("works");
	if(isHost)
	{	var myplayer = videojs("my-video")
		myplayer.controls(true)
		const { target: { files } } = e
		const [file] = files
		myFileSize = [file][0].size;
		var blob = new Blob([file], { type: 'video/mp4' })
		var blobURL = URL.createObjectURL(blob)
		myplayer.src({type: 'video/mp4', src: blobURL});
		myplayer.on('loadeddata', (e)=>{
			socket.emit("ready", myFileSize);
			client.seed([file][0], function (torrent) {
				console.log('Client is seeding ' + torrent.magnetURI)
				socket.emit("torrenturlemit", torrent.magnetURI)
			})
		});
		
	}
	else
	{
		socket.emit("ready", myFileSize);
		client.add(torrentId, onTorrent)
		console.log("loading torrent")
	}
	if(!isHost){
		//myplayer.controls(true);
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
	$('#Modal3').modal('toggle')
	document.getElementById("go").style.display = "none";
	socket.emit("showPlayeremit");
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
		var video = document.querySelector('video')
		video.play();
		myplayer.play();
		//myplayer.controls(true);
		
		if(isHost){
			var video = document.querySelector('video');
			video.addEventListener('pause', function once (){
				video.removeEventListener('pause', once)
				socket.emit("pauseEmit");
			});
		}
	}
});

socket.on("pause", (roomId, time)=>{
	if(roomId == myRoomId)
	{
		var myplayer = videojs("my-video");
		myplayer.currentTime(time);
		var video = document.querySelector('video')
		video.pause();
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
		var video = document.querySelector('video')
		video.play();
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

socket.on("torrenturl", (roomId, url)=>{
	if(roomId == myRoomId)
	{
		console.log(url);
		torrentId = url;
	}
});