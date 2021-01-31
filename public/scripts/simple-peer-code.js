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
	
	peers[socket_id].on('error', (err) => {
		console.log(err + " " + socket_id)
		//socket.emit("cantConnect", socket_id)
	})

    peers[socket_id].on('connect', () => {
		console.log("connected to " + socket_id)
		socket.emit("sendplayerlist")
		if(once2){
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
			once2 = false
		}
		
		if(sessionType == "stream"){
			var j = 0
			socket.on("sendnextchunk", ()=>{
				if(j < chunkArray.length){
					console.log("chunk sent to "+socket_id)
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
		var yeet = 1
		if(vidLen<60)
			buff = Math.ceil(15*numberofchunks/vidLen)
		else
			buff = Math.ceil(60*numberofchunks/vidLen)
		peers[socket_id].on('data', data =>{
			var d = new Date();
			var n = d.getTime();
				console.log('Received from '+socket_id);
				if(once)
				{
					//alert("starting to load stream, please wait");
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
				
				if(chunksRecieved == buff && firsttime && buff != 0)
				{
					myplayer.src({type: 'video/mp4', src: URL.createObjectURL(blob)});
					console.log("all set to load")
					if(totalFileSize != 0)
						document.getElementById("progress").innerHTML = Math.round(blob.size%totalFileSize*100) + " %"
					document.querySelector('video').addEventListener('loadeddata', function once (){
						document.querySelector('video').removeEventListener('loadeddata', once)
						myplayer.currentTime(currentTime);
						if(isplaying)
							myplayer.play();
						else 
							myplayer.pause();
					});
					//alert("stream loaded, ask the host to start");
					if(firsttime){
						socket.emit("ready2");
						firsttime = false
					}
					timenow = n
				}
				if(vidLen<60){
					if(5000 <= n - timenow && n - timenow <= 7000)
					{
						timenow = n
						myplayer.src({ type: 'video/mp4', src: URL.createObjectURL(blob) });
						console.log("loaded")
						if(totalFileSize != 0)
							document.getElementById("progress").innerHTML = Math.round(blob.size%totalFileSize*100) + " %"
						document.querySelector('video').addEventListener('loadeddata', function once() {
							document.querySelector('video').removeEventListener('loadeddata', once)
							if(yeet%3 != 0)
							{
								myplayer.currentTime(currentTime);
								yeet++;
							}
							else{
								myplayer.currentTime(currentTime + 1);
								yeet++;
							}
							
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
				}
				else{
					if(30000 <= n - timenow && n - timenow <= 33000)
					{
						timenow = n
						myplayer.src({ type: 'video/mp4', src: URL.createObjectURL(blob) });
						console.log("loaded")
						if(totalFileSize != 0)
							document.getElementById("progress").innerHTML = Math.round(blob.size%totalFileSize*100) + " %"
						document.querySelector('video').addEventListener('loadeddata', function once() {
							document.querySelector('video').removeEventListener('loadeddata', once)
							if(yeet%3 != 0)
							{
								myplayer.currentTime(currentTime);
								yeet++;
							}
							else{
								myplayer.currentTime(currentTime + 1);
								yeet++;
							}
							
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
	})
	
	peers[socket_id].on('stream', (stream)=>{
		let newAud = document.createElement('audio');
        newAud.srcObject = stream;
        newAud.id = socket_id;
		document.getElementById("audioPlayer").appendChild(newAud);
	})