let sessionType = null
let currentSessionType = ""
let SubBlob
let subBlobUrl
var myplayer = videojs("my-video")

let connForHost = []

function getStarted() {
    document.getElementById("modal-title").innerHTML = "Session Type";
    let modalBody = document.getElementById("modal-body")
    modalBody.innerHTML =
        '<div class="form-check"><input class="form-check-input" type="radio" name="Radios" id="Radios1" value="load" checked><label id="Radios01" class="form-check-label" for="Radios1">users have their file and will load themselves</label></div>'
        + '<div class="form-check"><input class="form-check-input" type="radio" name="Radios" id="Radios2" value="stream"><label id="Radios02" class="form-check-label" for="Radios2">users will stream from the host</label></div>'
        + '<div class="form-check"><input class="form-check-input" type="radio" name="Radios" id="Radios3" value="youtube"><label id="Radios03" class="form-check-label" for="Radios3">watch a youtube video</label></div>'
    let cancelButton = document.getElementById('modal-cancel')
    cancelButton.innerHTML = "confirm"
    cancelButton.onclick = () => {
        document.getElementById("getStartedButton").remove()
        if (document.getElementById("Radios1").checked) {
            sessionType = "load"
            document.getElementById("sessionType").innerHTML = "Session Type  :  " + document.getElementById("Radios01").innerHTML
            document.getElementById('player').style.display = "block"
        }
        else if (document.getElementById("Radios2").checked) {
            sessionType = "stream"
            document.getElementById("sessionType").innerHTML = "Session Type  :  " + document.getElementById("Radios02").innerHTML
        }
        else {
            sessionType = "youtube"
            document.getElementById("ytLinkInputDiv").style.display = "block"
            //syncYoutube()
            document.getElementById("sessionType").innerHTML = "Session Type  :  " + document.getElementById("Radios03").innerHTML
        }
        currentSessionType = sessionType
        if(guestMode)
        socket.emit("sessionType2", sessionType, roomId)
        document.getElementById("randomElement1").remove()
        if(!guestMode)
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

function toggleVoice() {
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

function inputChanged(e) {
    console.log("input changed")
    if (sessionType == "load") {
        loadFile(e)
    }
    else if (sessionType == "stream") {
        streamFile(e)
    }
    // else if(sessionType == "youtube")
    // {
    //     syncYoutube(e)
    // }
}

function addSubs(e) {
    const { target: { files } } = e
    const [file] = files
    {
        const webvtt = new WebVTTConverter([file][0]);
        webvtt
            .getURL()
            .then(url => {
                var myplayer = videojs("my-video");
                myplayer.addRemoteTextTrack({
                    kind: 'captions',
                    label: 'added',
                    src: url,
                    mode: 'showing'
                }, false);
            })
            .catch(err => {
                console.error(err);
            });
    }
    if (sessionType == "stream" && mySocketId == myHostId) {
        socket.emit("subs", [file][0])
    }
}


//          seeking stuff


    var previousTime = 0;
    var currentTime = 0;
    var playerIsPaused = false
    myplayer.controlBar.progressControl.on('mousedown', () => {
        previousTime = myplayer.currentTime()
        playerIsPaused = myplayer.paused()
    }
    );
    myplayer.controlBar.progressControl.seekBar.on('mousedown', () => {
        previousTime = myplayer.currentTime()
        playerIsPaused = myplayer.paused()
    }
    );
    // myplayer.on('keydown', (e) => {
    //     if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    //         previousTime = myplayer.currentTime();
    //     }
    // });

    myplayer.on('seeked', ()=>{
        // console.log(previousTime)
        // console.log(myplayer.currentTime())
        console.log('%c ' + previousTime, 'background: #222; color: #bada55')
        console.log('%c ' + myplayer.currentTime(), 'background: #222; color: #bada55')
        if(Math.floor(previousTime) == Math.floor(currentTime))
        {
            return
        }
        currentTime = Math.floor(myplayer.currentTime())
        console.log('%c seeked', 'background: #222; color: #bada55')
        if(myHostId == mySocketId)
        {
            if(myplayer.paused())
            {
                socket.emit("pauseEmit", currentTime)
            }
            else
            {
                socket.emit("playEmit", currentTime)
            }
        }
    })




//          SOCKET STUFF

let once = true

socket.on("initReceive", (socket_id, hostid) => {
    myHostId = hostid
    try {
        console.log("tries")
        peers[socket_id] = new Peer({
            //host: 'peerjs-server.herokuapp.com', secure: true, port: 443, 
            config: {
                'iceServers': [{ urls: ["stun:bn-turn1.xirsys.com", "stun:numb.viagenie.ca", "stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302", "stun:stun4.l.google.com:19302", "stun:global.stun.twilio.com:3478?transport=udp", "stun:stun.stunprotocol.prg", "stun:stun.counterpath.com", "stun:stun.stunprotocol.org"] },
                {
                    username: "997wytH9ZFhdVNSdxdJpgJ3AAJcA98dMKAVZTF4aPhTHykqtJ5rJb-zClEvM-03ZAAAAAGB2nMNzdHJpZGVy",
                    credential: "e2af97c0-9cf4-11eb-80c6-0242ac140004",
                    urls: [
                        "turn:bn-turn1.xirsys.com:80?transport=udp",
                        "turn:bn-turn1.xirsys.com:3478?transport=udp",
                        "turn:bn-turn1.xirsys.com:80?transport=tcp",
                        "turn:bn-turn1.xirsys.com:3478?transport=tcp",
                        "turns:bn-turn1.xirsys.com:443?transport=tcp",
                        "turns:bn-turn1.xirsys.com:5349?transport=tcp"]
                },
                {
                    username: "vashisthneeraj06@gmail.com",
                    credential: "12345@54321",
                    urls: ["turn:numb.viagenie.ca"]
                },

                {
                    username: 'webrtc',
                    credential: 'webrtc',
                    urls: ['turn:relay.backups.cz', "turn:relay.backups.cz?transport=tcp"],

                }
                ]
            }
        });
    }
    catch (e) {
        console.log(e)
        console.log("catches")
        peers[socket_id] = new Peer({
            //host: 'peerjs-server.herokuapp.com', secure: true, port: 443, 
            config: {
                'iceServers': [{ urls: ["stun:bn-turn1.xirsys.com", "stun:numb.viagenie.ca", "stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302", "stun:stun4.l.google.com:19302", "stun:global.stun.twilio.com:3478?transport=udp", "stun:stun.stunprotocol.prg", "stun:stun.counterpath.com", "stun:stun.stunprotocol.org"] },
                {
                    username: "997wytH9ZFhdVNSdxdJpgJ3AAJcA98dMKAVZTF4aPhTHykqtJ5rJb-zClEvM-03ZAAAAAGB2nMNzdHJpZGVy",
                    credential: "e2af97c0-9cf4-11eb-80c6-0242ac140004",
                    urls: [
                        "turn:bn-turn1.xirsys.com:80?transport=udp",
                        "turn:bn-turn1.xirsys.com:3478?transport=udp",
                        "turn:bn-turn1.xirsys.com:80?transport=tcp",
                        "turn:bn-turn1.xirsys.com:3478?transport=tcp",
                        "turns:bn-turn1.xirsys.com:443?transport=tcp",
                        "turns:bn-turn1.xirsys.com:5349?transport=tcp"]
                },
                {
                    username: "vashisthneeraj06@gmail.com",
                    credential: "12345@54321",
                    urls: ["turn:numb.viagenie.ca"]
                },

                {
                    username: 'webrtc',
                    credential: 'webrtc',
                    urls: ['turn:relay.backups.cz', "turn:relay.backups.cz?transport=tcp"],

                }
                ]
            }
        });
    }


    peers[socket_id].on('open', function (id) {
        socket.emit('initSend', socket_id, id)
    });

    peers[socket_id].on('connection', function (conn) {
        conn.on('open', () => {
            console.log("connected")
            if (once && !guestMode && sessionType != "youtube") {
                if (myHostId == mySocketId) {
                    document.getElementById('player').style.display = "block"
                    document.getElementById('1').style.display = "block"
                    document.getElementById('myfile').style.display = "block"
                }
                
                once = false
            }
            else if(once && sessionType == "youtube")
            {
                if (myHostId == mySocketId) {
                    document.getElementById('player').style.display = "none"
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
            }).catch(e => { alert(`getusermedia error ${e.name}`); })



            if (myHostId == mySocketId) {
                //peersForHost.push(peers[socket_id])
                currentSessionType = sessionType
                socket.emit("sessionType", sessionType)
                connForHost.push(conn)
                if (sessionType == "stream")
                    createDataChannel(conn)
            }
        })
    })
})

socket.on('initSend', (socket_id, ida) => {
    try {
        peers[socket_id] = new Peer({
            //host: 'peerjs-server.herokuapp.com', secure: true, port: 443, 
            config: {
                'iceServers': [{ urls: ["stun:bn-turn1.xirsys.com", "stun:numb.viagenie.ca", "stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302", "stun:stun4.l.google.com:19302", "stun:global.stun.twilio.com:3478?transport=udp", "stun:stun.stunprotocol.prg", "stun:stun.counterpath.com", "stun:stun.stunprotocol.org"] },
                {
                    username: "997wytH9ZFhdVNSdxdJpgJ3AAJcA98dMKAVZTF4aPhTHykqtJ5rJb-zClEvM-03ZAAAAAGB2nMNzdHJpZGVy",
                    credential: "e2af97c0-9cf4-11eb-80c6-0242ac140004",
                    urls: [
                        "turn:bn-turn1.xirsys.com:80?transport=udp",
                        "turn:bn-turn1.xirsys.com:3478?transport=udp",
                        "turn:bn-turn1.xirsys.com:80?transport=tcp",
                        "turn:bn-turn1.xirsys.com:3478?transport=tcp",
                        "turns:bn-turn1.xirsys.com:443?transport=tcp",
                        "turns:bn-turn1.xirsys.com:5349?transport=tcp"]
                },
                {
                    username: "vashisthneeraj06@gmail.com",
                    credential: "12345@54321",
                    urls: ["turn:numb.viagenie.ca"]
                },

                {
                    username: 'webrtc',
                    credential: 'webrtc',
                    urls: ['turn:relay.backups.cz', "turn:relay.backups.cz?transport=tcp"],

                }
                ]
            }
        });
    }
    catch
    {
        peers[socket_id] = new Peer({
            //host: 'peerjs-server.herokuapp.com', secure: true, port: 443, 
            config: {
                'iceServers': [{ urls: ["stun:bn-turn1.xirsys.com", "stun:numb.viagenie.ca", "stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302", "stun:stun4.l.google.com:19302", "stun:global.stun.twilio.com:3478?transport=udp", "stun:stun.stunprotocol.prg", "stun:stun.counterpath.com", "stun:stun.stunprotocol.org"] },
                {
                    username: "997wytH9ZFhdVNSdxdJpgJ3AAJcA98dMKAVZTF4aPhTHykqtJ5rJb-zClEvM-03ZAAAAAGB2nMNzdHJpZGVy",
                    credential: "e2af97c0-9cf4-11eb-80c6-0242ac140004",
                    urls: [
                        "turn:bn-turn1.xirsys.com:80?transport=udp",
                        "turn:bn-turn1.xirsys.com:3478?transport=udp",
                        "turn:bn-turn1.xirsys.com:80?transport=tcp",
                        "turn:bn-turn1.xirsys.com:3478?transport=tcp",
                        "turns:bn-turn1.xirsys.com:443?transport=tcp",
                        "turns:bn-turn1.xirsys.com:5349?transport=tcp"]
                },
                {
                    username: "vashisthneeraj06@gmail.com",
                    credential: "12345@54321",
                    urls: ["turn:numb.viagenie.ca"]
                },

                {
                    username: 'webrtc',
                    credential: 'webrtc',
                    urls: ['turn:relay.backups.cz', "turn:relay.backups.cz?transport=tcp"],

                }
                ]
            }
        });
    }
    peers[socket_id].on('open', function (id) {
        //console.log("peer open " + id)
        var conn = peers[socket_id].connect(ida)
        conn.on('open', function () {
            console.log("connected")
            if (once && !guestMode) {
                document.getElementById('player').style.display = "block"
                document.getElementById('1').style.display = "none"
                document.getElementById('myfile').style.display = "none"
                document.getElementsByClassName("vjs-big-play-button")[0].style.display = "none"
                document.getElementById("mySubs").previousElementSibling.style.display = "none"
                document.getElementById("mySubs").style.display = "none"
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
            }).catch(e => { alert(`getusermedia error ${e.name}`); })

            setTimeout(() => {
                if (myHostId == socket_id && sessionType == "stream") {
                    recieveDataChannel(conn)
                }
            }, 1000);
            conn.on('data', data=>{
                if(data === "dew_it")
                {
                    conn.off('data')
                    recieveDataChannel(conn)
                }
            })
        })
    })


})

socket.on("playAudio", (id) => {
    try {
        document.getElementById(id).play()
    }
    catch (e) {
        console.log(e)
        console.log("cant play audio coz their mic is not working")
    }
});

socket.on("pauseAudio", (id) => {
    try {
        document.getElementById(id).pause()
    }
    catch (e) {
        console.log(e)
    }
});

socket.on("sessionType", (_currentSessionType) => {
    currentSessionType = _currentSessionType
    sessionType = _currentSessionType
    if (currentSessionType == "load") {
        document.getElementById('player').style.display = "block"
        document.getElementById('1').style.display = "block"
        document.getElementById('myfile').style.display = "block"
        document.getElementById("mySubs").previousElementSibling.remove()
        document.getElementById("mySubs").remove()
    }
    else if(currentSessionType == "stream")
    {
        if(mySocketId != myHostId)
        {
            document.getElementById('1').style.display = "none"
            document.getElementById('myfile').style.display = "none"
            document.getElementById('player').style.display = "block"
            if(guestMode)
            {
                document.getElementsByClassName("vjs-big-play-button")[0].style.display = "none"
                document.getElementById("mySubs").previousElementSibling.style.display = "none"
                document.getElementById("mySubs").style.display = "none"
            }
        }
        else
        {
            document.getElementById('player').style.display = "block"
            for(item of connForHost)
            {
                createDataChannel(item)
            }
        }
        
    }
    else if(currentSessionType == "youtube")
    {
        if(mySocketId != myHostId)
        {
            document.getElementById('1').style.display = "none"
            document.getElementById('myfile').style.display = "none"
            document.getElementById('player').style.display = "block"
            document.getElementsByClassName("vjs-big-play-button")[0].style.display = "none"
            document.getElementById("mySubs").previousElementSibling.style.display = "none"
            document.getElementById("mySubs").style.display = "none"
        }
        
    }
})

socket.on("subs", data => {
    SubBlob = new Blob([data], { type: 'text/plain' });
    subBlobUrl = URL.createObjectURL(SubBlob);
    var myplayer = videojs("my-video");
    if (subBlobUrl != null) {
        myplayer.addRemoteTextTrack({
            kind: 'captions',
            label: 'en',
            src: subBlobUrl,
            mode: 'showing'
        }, false);
    }
})




//          ONLOAD STUFF
document.addEventListener('click', function () {
    if (document.getElementById("modal").style.display == "none" && document.getElementsByClassName('modal-backdrop')[0] != undefined) {
        document.getElementsByClassName('modal-backdrop')[0].remove()
    }
})