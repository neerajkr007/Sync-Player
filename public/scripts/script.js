
const socket = io.connect();
var userName ="";
var myRoomId = "";
var mySocketId = socket.id;
var isHost = false;
var sessionType = ""
var myFileSize = 0;
var totalFileSize = 0;
var chunkArray = []
var blobArray = []
var isplaying = false
var doneParsing = false
var test = true
let peers = {}
var voiceOn = true
var micWorking = true
var numberofchunks = 0
var vidLen = 0
doneSending = false
//"stun:bn-turn1.xirsys.com"
const configuration = {
	iceServers: [{   urls: [ "stun:global.stun.twilio.com:3478?transport=udp", "stun:bn-turn1.xirsys.com" ]}, 
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

function sendit(){
	if(document.getElementById("username").value != ""){
		userName = document.getElementById("username").value;
		socket.emit('host', userName);
		hide();
		if(document.getElementById("Radios1").checked)
		{
			sessionType = "load"
		}
		else
		{
			sessionType = "stream"
		} 
	}
}

function init() {
	console.log("init called")

    socket.on('initReceive', socket_id => {
        console.log('INIT RECEIVE ' + socket_id)
		addPeer(socket_id, false, stream)
        socket.emit('initSend', socket_id)
    })

    socket.on('initSend', socket_id => {
        console.log('INIT SEND ' + socket_id)
        addPeer(socket_id, true, stream)
    })

    socket.on('removePeer', socket_id => {
        console.log('removing peer ' + socket_id)
        //removePeer(socket_id)
    })

    socket.on('signal', data => {
        peers[data.socket_id].signal(data.signal)
	})
	//socket.emit("sendinitemit")
}


function addPeer(socket_id, am_initiator, stream) {
	console.log("adding peer")
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

    peers[socket_id].on('connect', () => {
		console.log("connected")
		if(sessionType == "stream"){
			var j = 0
			socket.on("sendnextchunk", ()=>{
				if(j < chunkArray.length){
					console.log("chunk sent")
					peers[socket_id].send(chunkArray[j])
					j++
				}
			})
		}
		var chunksRecieved = 0
		var firsttime = true
		var once = true
		var buff = 0
		var i = 1
		var timenow = 0
		peers[socket_id].on('data', data =>{
			var d = new Date();
			var n = d.getTime();
				console.log('Received');
				if(once){
					once = false
				}
				var myplayer = videojs("my-video");
				blobArray.push(new Blob([new Uint8Array(data)],{'type':'video/mp4'}));
				let blob = new Blob(blobArray,{'type':'video/mp4'});
				chunksRecieved++;
				let currentTime = myplayer.currentTime();
				if(myplayer.paused()) 
					isplaying = false
				else 
					isplaying = true
				buff = Math.ceil(60*numberofchunks/vidLen)
				
				if(chunksRecieved == buff && firsttime && buff != 0)
				{
					myplayer.src({type: 'video/mp4', src: URL.createObjectURL(blob)});
					console.log("all set to load")
					if(totalFileSize != 0)
						//document.getElementById("progress").innerHTML = blob.size%totalFileSize*100 + " %"
					document.querySelector('video').addEventListener('loadeddata', function once (){
						document.querySelector('video').removeEventListener('loadeddata', once)
						myplayer.currentTime(currentTime);
						if(isplaying)
							myplayer.play();
						else 
							myplayer.pause();
						alert("stream loaded, ask the host to start");
					});
					if(firsttime){
						socket.emit("ready2");
						firsttime = false
					}
					timenow = n
				}
				if(30000 <= n - timenow && n - timenow <= 33000)
				{
					timenow = n
					myplayer.src({ type: 'video/mp4', src: URL.createObjectURL(blob) });
					console.log("loaded")
					var c = d.getTime()
					document.querySelector('video').addEventListener('loadeddata', function once() {
						document.querySelector('video').removeEventListener('loadeddata', once)
						var e = d.getTime()
						myplayer.currentTime(currentTime + (e-c)/1000);
						if (isplaying) {
							myplayer.play();
							console.log("playing")
						}
						else {
							myplayer.pause();
							console.log("paused")
						}

					});
				}
				if(chunksRecieved == numberofchunks){
					console.log("done recieving")
					doneSending = true
					myplayer.src({ type: 'video/mp4', src: URL.createObjectURL(blob) });
					console.log("loaded")
					document.querySelector('video').addEventListener('loadeddata', function once() {
						document.querySelector('video').removeEventListener('loadeddata', once)
						myplayer.currentTime(currentTime);
						console.log(isplaying)
						if (isplaying) {
							myplayer.play();
							console.log("playing")
						}
						else {
							myplayer.pause();
							console.log("paused")
						}

					});
				}
				socket.emit("sendnextchunkemit", myRoomId);
		})
		// if(!isHost)
		// {
			
		// 	var i = 0
		// 	var once = true
		// 		setInterval(() => {
		// 			var myplayer = videojs("my-video")
		// 			if(!firsttime && !doneSending){
		// 				if(myplayer.paused()) 
		// 					isplaying = false
		// 				else 
		// 					isplaying = true
		// 				console.log("test1")
		// 				let blob = new Blob(blobArray,{'type':'video/mp4'});
		// 				let currentTime = myplayer.currentTime();
		// 				myplayer.src({type: 'video/mp4', src: URL.createObjectURL(blob)});
		// 				console.log("loaded")
		// 				document.querySelector('video').addEventListener('loadeddata', function once (){
		// 					document.querySelector('video').removeEventListener('loadeddata', once)
		// 					myplayer.currentTime(currentTime);
		// 						console.log(isplaying)
		// 						if(isplaying){
		// 							myplayer.play();
		// 							console.log("playing")
		// 						}
		// 						else {
		// 							myplayer.pause();
		// 							console.log("paused")
		// 						}
							
		// 				});
		// 			}
					
		// 		}, 5000);
		// }
	})
	
	peers[socket_id].on('stream', (stream)=>{
		let newAud = document.createElement('audio');
        newAud.srcObject = stream;
        newAud.id = socket_id;
		document.getElementById("audioPlayer").appendChild(newAud);
	})
}

function loadVideo(e){
	//document.getElementById("1").style.display = "none";
	//document.getElementById("myfile").style.display = "none";

	document.getElementById("chatbox").setAttribute("style", "")
	var i = document.getElementById("my-video").offsetTop - document.getElementById("page-content").offsetTop
	document.getElementById("page-content").setAttribute("style", "padding-top: " + i + "px;")

	const { target: { files } } = e
	const [file] = files
	myFileSize = [file][0].size;
	var blob = new Blob([file], { type: 'video/mp4' })
	var blobURL = URL.createObjectURL(blob)
	var myplayer = videojs("my-video");
	
	// socket io stream stuff
	
	// var filetest = e.target.files[0];
	// var stream = ss.createStream();
	// ss(socket).emit('file', stream);
	// var blobStream = ss.createBlobReadStream(filetest)
	// var size = 0;
	// blobStream.on('data', function(chunk) {
	// size += chunk.length;
	// console.log(Math.floor(size / file.size * 100) + '%');
	// });
	// blobStream.pipe(stream);
	

	myplayer.src({type: 'video/mp4', src: blobURL});
	myplayer.on('loadeddata', (e)=>{
		if(sessionType === "stream")
		{

			vidLen = myplayer.duration();
			socket.emit("ready", myFileSize, true, vidLen);
			//alert("spliting files")
			parseFile([file][0])
			//init()
			if(isHost){
				socket.emit("showplayer2emit");
			}
			
		}
		else
		{
			socket.emit("ready", myFileSize);
		}
		
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
		sessionType = "load"
		socket.emit("showPlayeremit1");
	}
	else
	{
		sessionType = "stream"
		socket.emit("showPlayeremit2");
	} 
}

function callback(e){
	//console.log("pushed");
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
			doneParsing = true
			//numberofchunks = chunkArray.length
			//socket.emit("numberofchunks", numberofchunks, time)
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

function toggleChat(){
	if(!test)
	{
		document.getElementById("chatbox").clientWidth = (document.getElementById("container").clientWidth)*0.30 + "px"
		document.getElementById('chatBody').style.display='none'; 
		document.getElementById('footer').style.display='none'; 
		test=true
	}
	else
	{
		document.getElementById('chatBody').style.display='block'; 
		document.getElementById('footer').style.display='block'; 
		test=false
	}
}

function sendChat(){
	var d = new Date();
	var h = d.getHours()
	var m = d.getMinutes()
	var s = d.getSeconds()
	var width = (document.getElementById("chatBody").clientWidth)*0.8
	document.getElementById("chatBody").innerHTML += '<div class="media media-chat media-chat-reverse"><div class="media-body"><p style="max-width: '+width+'px !important">'+document.getElementById("chatInput").value+'</p><p class="meta" style="color:#aaaaaa !important; font-size: small !important;"><time datetime="2021">'+h+':'+m+':'+s+'</time></p></div></div>'
	socket.emit('chattoothersemit', document.getElementById("chatInput").value, mySocketId)
	//document.getElementById("chatBody").innerHTML += '<div class="row align-middle"> <i class="fas avatar fa-2x fa-user-circle" style="padding-left:30px !important"></i><p class="d-inline-flex" style="color:#aaaaaa; padding-left:30px !important">LOLOL</p></div><div class="row media-chat media-body" style="padding-left:50px !important;"><p style="background-color: #212121; color: #9b9b9b; position: relative;padding: 6px 8px;margin: 4px 0;border-radius: 3px;font-weight: 100; max-width: 80%;">'+document.getElementById("chatInput").value+'</p><p class="ml-1 mt-5 meta" style="color: #aaaaaa; font-size: x-small; margin-top:7% !important"; margin-bottom:0% !important><time datetime="2021">'+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds() +'</p></div>'
	document.getElementById("chatInput").value = ""
	document.getElementById("chatBody").scrollTop = document.getElementById("chatBody").scrollHeight
}

function voice(){
	 navigator.mediaDevices.getUserMedia({
	 	audio: true
	   }).then((_stream)=>{stream = _stream}).catch(e => {alert(`getusermedia error ${e.name}`); micWorking = false})
}

function toggleVoice(){
	var userList = document.getElementById("playerList").getElementsByClassName("list-group-item")
	if(micWorking)
		{if(voiceOn)
		{
			for(var i in userList){
				if(userList[i].innerHTML == userName)
				{
					userList[i].innerHTML += "       " + "<i class='fas fa-volume-up'></i>"
				}
			}
			socket.emit("playAudioEmit", mySocketId, 1, userName)
			voiceOn = false
			document.getElementById("micButton").innerHTML = '<i class="fas fa-2x fa-microphone" ></i>'
		}
		else
		{
			for(var i in userList){
				if(userList[i].innerHTML != undefined && userList[i].innerHTML.includes(userName))
				{
					userList[i].innerHTML = userName
				}
			}
			socket.emit("playAudioEmit", mySocketId, 2, userName)
			voiceOn = true
			document.getElementById("micButton").innerHTML = '<i class="fas fa-2x fa-microphone-slash"></i>'
		}
	}
}

socket.on("mysocketid", (id)=>{
	mySocketId = id;
})

socket.on("hosted", function(data){
	init()
	myRoomId = data;
	isHost = true;
	document.getElementById("playerList").style.display = "inline-flex";
	document.getElementById("go").style.display = "flex";
    document.getElementById("gameId").outerHTML = "<h4 id='gameId' class='display-5 text-center'></h4>";
	document.getElementById("gameId").style.display = "inline-flex";
	document.getElementById("gameId").innerHTML = "room id -  "+ data;
	document.getElementById("waitingMsg").style.display = "inline-flex";
	document.getElementById("waitingMsg").outerHTML = "<h5 id='waitingMsg' class='text-center'> click go to load the player</h5>";
	document.getElementById("chatbox").style.display = "flex";
	document.getElementById("voice").style.display= "block"
	voice()
});

socket.on("joined", function(data){
	init()
	hide();
	document.getElementById("playerList").style.display = "inline-flex";
	myRoomId = data;
	document.getElementById("gameId").outerHTML = "<h4 id='gameId' class='display-5 text-center'></h4>";
	document.getElementById("gameId").style.display = "inline-flex";
	document.getElementById("gameId").innerHTML = " joined room id -  "+ data;
	document.getElementById("waitingMsg").style.display = "inline-flex";
	document.getElementById("waitingMsg").outerHTML = "<h5 id='waitingMsg' class='text-center'> waiting for the host to start...</h5>";
	$('#exampleModal2').modal('toggle')
	document.getElementById("chatbox").style.display = "flex";
	document.getElementById("voice").style.display= "block"
	socket.emit('chattoothersemit2', mySocketId)	
	voice()
});

socket.on("notJoined", function(){
	alert("id incorrect !");
});

socket.on("clearPlayerList", (roomId)=>{
	if(roomId == myRoomId)
	{	
		document.getElementById("playerList").innerHTML="";
		//socket.emit("rePeer")
	}
});

socket.on("updatePlayerList", (name, roomId)=>{
	if(roomId == myRoomId )
	{
			var node = document.createElement("LI");   
			node.innerHTML = "<li class='list-group-item' style='background: #404040; color: #AAAAAA'>" + name +"</li>"                 // Append the text to <li>
			document.getElementById("playerList").appendChild(node);
	}
});


socket.on("showPlayer", (roomId)=>{
	if(roomId == myRoomId)
	{
		document.getElementById("player").style.display = "block";
		document.getElementById("chatbox").setAttribute("class", "col-md-4 mt-2 text-center")
		document.getElementById("chatbox").setAttribute("style", "")
		var i = document.getElementById("my-video").offsetTop - document.getElementById("page-content").offsetTop
		document.getElementById("page-content").setAttribute("style", "padding-top: " + i + "px;")
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
		//init();
		document.getElementById("player").style.display = "block"
		document.getElementById("1").style.display = "none"
		document.getElementById("myfile").style.display = "none"
		document.getElementsByClassName("vjs-big-play-button")[0].style.display = "none"
		document.getElementById("chatbox").setAttribute("class", "col-md-4 mt-2 text-center")
		document.getElementById("chatbox").setAttribute("style", "")
		var i = document.getElementById("my-video").offsetTop - document.getElementById("page-content").offsetTop
		document.getElementById("page-content").setAttribute("style", "padding-top: " + i + "px;")
	}
});

socket.on("chatToOthers", (roomId, chat, id, name)=>{
	if(roomId == myRoomId && roomId != "" && mySocketId !=id)
	{
		if(test)
			toggleChat()
		var d = new Date();
		var h = d.getHours()
		var m = d.getMinutes()
		var s = d.getSeconds()
		document.getElementById("chatBody").innerHTML += '<div class="row"> <i class="fas avatar fa-2x fa-user-circle" style="padding-left:30px !important"></i><p class="d-inline-flex" style="color:#aaaaaa; padding-left:30px !important">'+name+'</p></div><div class="row media-body" style="padding-left:50px !important;"><p style="background-color: #212121; color: #9b9b9b; position: relative;padding: 6px 8px;margin: 4px 0;border-radius: 3px;font-weight: 100; max-width: 80%;">'+chat+'</p><p class="ml-1 mt-5 meta" style="color: #aaaaaa; font-size: x-small; margin-top:7% !important"; margin-bottom:0% !important><time datetime="2021">'+h+':'+m+':'+s+'</p></div>'
		document.getElementById("chatBody").scrollTop = document.getElementById("chatBody").scrollHeight
	}
});

socket.on("playAudio", (roomId, id, speaker)=>{
	if(roomId == myRoomId && id != mySocketId)
	{
		var userList = document.getElementById("playerList").getElementsByClassName("list-group-item")
		for(var i in userList){
			if(userList[i].innerHTML == speaker)
			{
				userList[i].innerHTML += "       " + "<i class='fas fa-volume-up'></i>"
			}
		}
		try{
			document.getElementById(id).play()
		}
		catch(e){
			console.log("cant play audio coz their mic is not working")
		}
	}
});

socket.on("pauseAudio", (roomId, id, speaker)=>{
	if(roomId == myRoomId && id != mySocketId)
	{
		var userList = document.getElementById("playerList").getElementsByClassName("list-group-item")
		for(var i in userList){
			if(userList[i].innerHTML != undefined && userList[i].innerHTML.includes(speaker))
			{
				userList[i].innerHTML = speaker
			}
		}
		try{
			document.getElementById(id).pause()
		}
		catch(e){}
	}
});

socket.on("numberofchunks", (data, time, id)=>{
	if(id == myRoomId)
	{
		numberofchunks = data
		vidLen = time
		if(isHost)
			socket.emit("sendnextchunkemit", myRoomId)
	}
})
// socket.on("test2", data=>{
// 	if(data.id == myRoomId && !isHost)
// 	{
// 		console.log('Received ' + chunksRecieved);
// 		//console.log(data.chunk)
// 		var myplayer = videojs("my-video");
// 		blobArray.push(new Blob([new Uint8Array(data.chunk)],{'type':'video/mp4'}));
// 		let blob = new Blob(blobArray,{'type':'video/mp4'});
// 		//console.log(blob)
// 		chunksRecieved++;
// 		let currentTime = myplayer.currentTime();
// 		if(myplayer.paused()) 
// 			isplaying = false
// 		else 
// 			isplaying = true
// 		if(firsttime && chunksRecieved == 10)
// 		{
// 			var bloburl = URL.createObjectURL(blob)
// 			console.log(bloburl)
// 			//document.getElementById("my-video_html5_api").src=bloburl
// 			myplayer.src({type: 'video/mp4', src: bloburl});
// 			console.log("all set to load")
// 			myplayer.on('loadeddata', (e)=>{
// 				myplayer.currentTime(currentTime);
// 				if(isplaying)
// 					myplayer.play();
// 				else 
// 					myplayer.pause();
// 			});
// 			if(firsttime){
// 				socket.emit("ready2");
// 				firsttime = false
// 			}
			
// 		}
// 		// else if(chunksRecieved%25 == 0 && !firsttime)
// 		// {
// 		// 	if(totalFileSize != 0)
// 		// 		document.getElementById("progress").innerHTML = blob.size/totalFileSize*100 + " %"
// 		// 	myplayer.src({type: 'video/mp4', src: URL.createObjectURL(blob)});
// 		// 	console.log("all set to load")
// 		// 	myplayer.on('loadeddata', (e)=>{
// 		// 		myplayer.currentTime(currentTime);
// 		// 		if(isplaying)
// 		// 			myplayer.play();
// 		// 		else 
// 		// 			myplayer.pause();
// 		// 	});
// 		// 	console.log(blob)
// 		// }
// 	}
// })