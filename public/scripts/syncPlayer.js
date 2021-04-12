
let sessionType = null
let currentSessionType = ""
let hostSocket

function getStarted() {
    document.getElementById("modal-title").innerHTML = "Session Type";
    let modalBody = document.getElementById("modal-body")
    modalBody.innerHTML =
        '<div class="form-check"><input class="form-check-input" type="radio" name="Radios" id="Radios1" value="load" checked><label id="Radios01" class="form-check-label" for="Radios1">users have their file and will load themselves</label></div>'
        + '<div class="form-check"><input class="form-check-input" type="radio" name="Radios" id="Radios2" value="stream"><label id="Radios02" class="form-check-label" for="Radios2">users will stream from the host</label></div>'
    let cancelButton = document.getElementById('modal-cancel')
    cancelButton.innerHTML = "confirm"
    cancelButton.onclick = () => {
        document.getElementById("getStartedButton").remove()
        if (document.getElementById("Radios1").checked) {
            sessionType = "load"
            document.getElementById("sessionType").innerHTML = "Session Type  :  " + document.getElementById("Radios01").innerHTML
            document.getElementById('player').style.display = "block"
        }
        else {
            sessionType = "stream"
            document.getElementById("sessionType").innerHTML = "Session Type  :  " + document.getElementById("Radios02").innerHTML
        }
        document.getElementById("randomElement1").remove()
        document.getElementById('welcomeUser').innerHTML = myName + "'s room"

    }
    $('#modal').modal('toggle');
    $('#modal').on('hidden.bs.modal', function (e) {
        cancelButton.onclick = null
        cancelButton.innerHTML = "close"
    })
}


let peers = {}
let voiceOn = true
let peersForHost = []

function toggleVoice() 
{
    if (voiceOn) {
        socket.emit("playAudioEmit", 1, myHostId)
        voiceOn = false
        document.getElementById("micButton").innerHTML = '<i class="fas fa-2x fa-microphone" ></i>'
    }
    else {
        socket.emit("playAudioEmit", 2, myHostId)
        voiceOn = true
        document.getElementById("micButton").innerHTML = '<i class="fas fa-2x fa-microphone-slash"></i>'
    }
}

function inputChanged(e)
{
    if(sessionType == "load")
    {
        loadFile(e)
    }
    else if(sessionType == "stream")
    {
        streamFile(e)
    }
}




//          SOCKET STUFF

let once = true

socket.on("initReceive", (socket_id, hostid) => {
    myHostId = hostid
    peers[socket_id] = new Peer({
        //host: 'peerjs-server.herokuapp.com', secure: true, port: 443,
        config: {
            'iceServers': [{ urls: ["stun:global.stun.twilio.com:3478?transport=udp", "stun:bn-turn1.xirsys.com"] },
            {
                username: "8KYgw1JiOE8ifuMVMJJhADMVLAx9rrGgZgk0b6UE7SQWG9HDlqdlFfvGbMlz64AcAAAAAF_yDcZzdHJpZGVy",
                credential: "0eaa9930-4df2-11eb-8e11-0242ac140004",
                urls: [
                    "turn:bn-turn1.xirsys.com:80?transport=udp",
                    "turn:bn-turn1.xirsys.com:3478?transport=udp",
                    "turn:bn-turn1.xirsys.com:80?transport=tcp",
                    "turn:bn-turn1.xirsys.com:3478?transport=tcp",
                    "turns:bn-turn1.xirsys.com:443?transport=tcp",
                    "turns:bn-turn1.xirsys.com:5349?transport=tcp"]
            }]
        }
    });

    peers[socket_id].on('open', function (id) {
        socket.emit('initSend', socket_id, id)
        //console.log("peer open " + id)
    });

    peers[socket_id].on('connection', function (conn) {
        conn.on('open', () => {
            console.log("connected")
            if(once)
            {
                document.getElementById('player').style.display = "block"
                if(myHostId == mySocketId)
                {
                    document.getElementById('1').style.display = "block"
                    document.getElementById('myfile').style.display = "block"
                }
                once = false
            }
            document.getElementById('playerlist').style.display = "block"
            navigator.mediaDevices.getUserMedia({
                audio: true
            }).then((stream) => {
                peers[socket_id].on('call', function (call) {
                    call.answer(stream);
                    call.on('stream', function (audstream) {
                        document.getElementById("micButton").style.display = "block"
                        //console.log("stream connected to " + socket_id)
                        let newAud = document.createElement('audio');
                        newAud.srcObject = audstream;
                        newAud.id = socket_id;
                        document.getElementById("audioPlayer").appendChild(newAud);
                    });
                });
            }).catch(e => { alert(`getusermedia error ${e.name}`);})
            if(myHostId == mySocketId)
            {
                peersForHost.push(peers[socket_id])
                currentSessionType = sessionType
                socket.emit("sessionType", sessionType)
                createDataChannel(conn)
            }
        })
    })
})

socket.on('initSend', (socket_id, ida) => {
    //console.log(myHostId)
    //console.log('INIT SEND ' + socket_id + ida)
    peers[socket_id] = new Peer({
        //host: 'peerjs-server.herokuapp.com', secure: true, port: 443, 
        config: {
            'iceServers': [{ urls: ["stun:global.stun.twilio.com:3478?transport=udp", "stun:bn-turn1.xirsys.com"] },
            {
                username: "8KYgw1JiOE8ifuMVMJJhADMVLAx9rrGgZgk0b6UE7SQWG9HDlqdlFfvGbMlz64AcAAAAAF_yDcZzdHJpZGVy",
                credential: "0eaa9930-4df2-11eb-8e11-0242ac140004",
                urls: [
                    "turn:bn-turn1.xirsys.com:80?transport=udp",
                    "turn:bn-turn1.xirsys.com:3478?transport=udp",
                    "turn:bn-turn1.xirsys.com:80?transport=tcp",
                    "turn:bn-turn1.xirsys.com:3478?transport=tcp",
                    "turns:bn-turn1.xirsys.com:443?transport=tcp",
                    "turns:bn-turn1.xirsys.com:5349?transport=tcp"]
            }]
        }
    });
    peers[socket_id].on('open', function (id) {
        //console.log("peer open " + id)
        var conn = peers[socket_id].connect(ida)
        conn.on('open', function () {
            console.log("connected")
            if(once)
            {
                document.getElementById('player').style.display = "block"
                document.getElementById('1').style.display = "none"
                document.getElementById('myfile').style.display = "none"
                document.getElementsByClassName("vjs-big-play-button")[0].remove()
                once = false
            }
            document.getElementById('playerlist').style.display = "block"
            document.getElementById('modal-title').innerHTML = "Success"
            document.getElementById("modal-body").innerHTML = "connected"
            socket.emit('connectedToRoom')
            let timeOut = setTimeout(() => {
                $('#modal').modal('toggle');
            }, 1000);
            $('#modal').on('hidden.bs.modal', function (e) {
                clearInterval(timeOut)
            })
            navigator.mediaDevices.getUserMedia({
                audio: true
            }).then((stream) => {
                var call = peers[socket_id].call(ida, stream)
                call.on('stream', function (audstream) {
                    document.getElementById("micButton").style.display = "block"
                    //console.log("call connected to " + socket_id)
                    let newAud = document.createElement('audio');
                    newAud.srcObject = audstream;
                    newAud.id = socket_id;
                    document.getElementById("audioPlayer").appendChild(newAud);
                });
            }).catch(e => { alert(`getusermedia error ${e.name}`);})
            //console.log(peers)
            console.log(socket_id)
            if(myHostId == socket_id)
            {
                recieveDataChannel(conn)
            }
        })
    })


})

socket.on("playAudio", (roomId, id)=>{
	if(roomId == myHostId && id != mySocketId)
	{
		try{
			document.getElementById(id).play()
		}
		catch(e){
			console.log("cant play audio coz their mic is not working")
		}
	}
});

socket.on("pauseAudio", (roomId, id )=>{
	if(roomId == myHostId && id != mySocketId)
	{
		try{
			document.getElementById(id).pause()
		}
		catch(e){}
	}
});

socket.on("sessionType", (_currentSessionType)=>{
    currentSessionType = _currentSessionType
    
    if(currentSessionType == "load")
    {
        document.getElementById('player').style.display = "block"
        document.getElementById('1').style.display = "block"
        document.getElementById('myfile').style.display = "block"
    }
    // else if(currentSessionType == "stream")
    // {
    //     document.getElementById('1').style.display = "none"
    //     document.getElementById('myfile').style.display = "none"
    // }
})

