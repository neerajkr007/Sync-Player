var myplayer = videojs("my-video");
let hostLoadedFile = false
let currentFileSize = 0


function loadFile(e){
    //console.log(hostLoadedFile)
    if(hostLoadedFile || myHostId == mySocketId)
    {
        const { target: { files } } = e
        const [file] = files
        currentFileSize = [file][([file].length - 1)].size;
        //console.log(currentFileSize)
        var blob = new Blob([file], { type: 'video/mp4' })
        var blobURL = URL.createObjectURL(blob)
        myplayer.src({ type: 'video/mp4', src: blobURL });
        myplayer.on('loadeddata', (e) => {
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
    else
    {
        document.getElementById("modal-title").innerHTML = "Failed";
        let modalBody = document.getElementById("modal-body")
        modalBody.innerHTML = "ask the host to load the file first !"
        $('#modal').modal('toggle');
        let timeOut = setTimeout(() => {
            $('#modal').modal('toggle');
        }, 2000);
        $('#modal').on('hidden.bs.modal', function (e) {
            clearInterval(timeOut)
        })
    }
    
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