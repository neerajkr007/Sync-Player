var myplayer = videojs("my-video");
var myplayer2 = videojs("my-video2");
let hostLoadedFile = false
let currentFileSize = 0

var mp4box2 = MP4Box.createFile();
            mp4box2.onError = function(e) {
                console.log("mp4box failed to parse data.");
              };
              mp4box2.onMoovStart = function () {
                console.log("Starting to receive File Information 2");
              };
              mp4box2.onReady = function(info) {
                console.log("2 rady ")
                console.log(info)
            };

var mp4box = MP4Box.createFile();
            mp4box.onError = function(e) {
                console.log("mp4box failed to parse data.");
              };
              mp4box.onMoovStart = function () {
                console.log("Starting to receive File Information");
              };
              mp4box.onReady = function(info) {
                console.log(info)
                let bufferArray = []
                let once=true
                let lol = 0
                mp4box.onSegment = function (id, user, buffer, sampleNumber, last) {
                    console.log(buffer)
                    bufferArray.push(buffer)
                    //if(once)
                    {
                        console.log(once)
                        buffer.fileStart = lol;
                        lol++
                        once = false
                    }
                    mp4box2.appendBuffer(buffer)
                    if(last)
                    {
                        mp4box.flush()
                    }
                }
                for (var i = 0; i < 1; i++) {
                    var track = info.tracks[i];
                    mp4box.setSegmentOptions(track.id, null);
                }
                mp4box.initializeSegmentation();  
                mp4box.start();
            };

            
              

async function loadFile(e){
    //console.log(hostLoadedFile)
    //if(hostLoadedFile || myHostId == mySocketId)
    {
        const { target: { files } } = e
        const [file] = files
        currentFileSize = [file][([file].length - 1)].size;
        //console.log(currentFileSize)
        var blob = new Blob([file], { type: 'video/mp4' })
        var blobURL = URL.createObjectURL(blob)
        var buffer = await blob.arrayBuffer();
        buffer.fileStart = 0;
        console.log(buffer)
        console.log(blob)
        mp4box.appendBuffer(buffer);
        
        myplayer.src({ type: 'video/mp4', src: blobURL });
        var video = document.querySelector("video");
        myplayer.on('loadeddata', ()=>{
        // video.addEventListener("loadeddata", function once() {
        //     video.removeEventListener('loadeddata', once);
            console.log("file loaded")
            
            if(myHostId != mySocketId)
            {
                socket.emit("getCurrentTime", currentSessionType,  myHostId, currentFileSize)
            }
            else
            {
                hostLoadedFile = true
                socket.emit("hostLoadedFile", myHostId)
            }
        });
    }
    // else
    // {
    //     document.getElementById("modal-title").innerHTML = "Failed";
    //     let modalBody = document.getElementById("modal-body")
    //     modalBody.innerHTML = "ask the host to load the file first !"
    //     $('#modal').modal('toggle');
    //     let timeOut = setTimeout(() => {
    //         $('#modal').modal('toggle');
    //     }, 2000);
    //     $('#modal').on('hidden.bs.modal', function (e) {
    //         clearInterval(timeOut)
    //     })
    // }
    
    // if(isHost)
    // {
    //     myplayer.on("seeked", ()=>{
    //         console.log("paused at "+myplayer.currentTime())
    //         socket.emit("seeked", myplayer.currentTime())
    //     })
    // }
    let playButton = document.getElementsByClassName("vjs-big-play-button")[0];
    if(myHostId == mySocketId)
    {
        var video = document.querySelector('video');
        video.addEventListener('play', function once (){
            video.removeEventListener('play', once)
            var time = myplayer.currentTime();
			socket.emit("playEmit", time);
        });
    }
    else
    {
        playButton.style.display = "none";
    }
    
} 





//          SOCKET STUFF



socket.on("getCurrentTimeLoad", (id, _currentFileSize)=>{
    if(currentFileSize != _currentFileSize)
    {
        socket.emit("wrongFile", id)
    }
    else
    {
        myplayer.pause()
        let currentTime = myplayer.currentTime()
        if(currentTime != 0)
        {
            document.getElementById("modal-title").innerHTML = "wait";
            let modalBody = document.getElementById("modal-body")
            modalBody.innerHTML = "some users just loaded file please wait"
            $('#modal').modal('toggle');
            let timeOut = setTimeout(() => {
                $('#modal').modal('toggle');
            }, 2000);
            $('#modal').on('hidden.bs.modal', function (e) {
                clearInterval(timeOut)
            })
        }
        socket.emit("setCurrentTime", id, currentTime, currentSessionType)
    }
    
})

socket.on("setCurrentTimeLoad", currentTime=>{
    
    myplayer.pause()
    myplayer.currentTime(currentTime)
})

socket.on("hostLoadedFile", ()=>{
    hostLoadedFile = true
})

socket.on("wrongFile", ()=>{
    document.getElementById("modal-title").innerHTML = "Failed";
    let modalBody = document.getElementById("modal-body")
    modalBody.innerHTML = "you and host have different files loaded, Fix it !"
    $('#modal').modal('toggle');
    let timeOut = setTimeout(() => {
        $('#modal').modal('toggle');
    }, 2000);
    $('#modal').on('hidden.bs.modal', function (e) {
        clearInterval(timeOut)
    })
})

socket.on("pause", (time) => 
{
    myplayer.currentTime(time);
    myplayer.pause();
    if (myHostId == mySocketId) 
    {
        var video = document.querySelector('video');
        video.addEventListener('play', function once() {
            var time = myplayer.currentTime();
            video.removeEventListener('play', once)
            socket.emit("playEmit", time);
        });
    }
});

socket.on("play", (time) => {
    myplayer.currentTime(time);
    myplayer.play();
    if (myHostId == mySocketId) {
        var video = document.querySelector('video');
        video.addEventListener('pause', function once() {
            var time = myplayer.currentTime();
            video.removeEventListener('pause', once)
            socket.emit("pauseEmit", time);
        });
    }
});