var myplayer = videojs("my-video");
let hostLoadedFile = false
let currentFileSize = 0

var buffer
var mediaSource = new MediaSource();
var myplayer2 = videojs("my-video2");
myplayer2.src({ type: 'video/mp4', src: URL.createObjectURL(mediaSource) });
var mp4box = MP4Box.createFile();
mp4box.onError = function (e) {
    console.log("mp4box failed to parse data.");
};
mp4box.onMoovStart = function () {
    console.log("Starting to receive File Information");
};
mediaSource.addEventListener('sourceopen', function () {
    console.log("source open")
})
mp4box.onReady = function (info) {
    console.log(info)
    let test = 0
    mp4box.onSegment = function (id, user, buffer, sampleNumber, last) {
        let sb = user
        sb.is_last = last
        sb.id = id
        sb.pendingAppends.push({buffer: buffer});
    }
    for (var i = 0; i < info.tracks.length; i++) {
        var track = info.tracks[i];
        var codec = track.codec;
	    var mime = 'video/mp4; codecs=\"'+codec+'\"';
        var sb = mediaSource.addSourceBuffer(mime);
        sb.pendingAppends = [];
        mp4box.setSegmentOptions(track.id, sb, {nbSamples: 1000});
    }
    var initSegs = mp4box.initializeSegmentation();
    mp4box.start();
	for (var i = 0; i < initSegs.length; i++) {
		var sb = initSegs[i].user;
        sb.appendBuffer(initSegs[i].buffer);
        sb.addEventListener("updateend", onInitAppended)
    }
    
};

function onInitAppended(e)
{
    let sb = e.target;
    console.log(mediaSource.sourceBuffers)
    console.log("updateended " + mediaSource.readyState + sb.id)
    sb.removeEventListener('updateend', onInitAppended);
    sb.addEventListener('updateend', function(){ onUpdateEnd(sb)});
    onUpdateEnd(sb);
}

function onUpdateEnd(user){
    let sb = user
    if(sb.is_last)
    {

    }
	if (sb.updating === false && sb.pendingAppends.length != 0) {
		var obj = sb.pendingAppends.shift();
		sb.appendBuffer(obj.buffer);
	}
    
}
mediaSource.addEventListener('sourceended', function () {
    console.log('MediaSource readyState: ' + this.readyState);
}, false);


async function loadFile(e) {
    {
        const { target: { files } } = e
        const [file] = files
        currentFileSize = [file][([file].length - 1)].size;
        //console.log(currentFileSize)
        var blob = new Blob([file], { type: 'video/mp4' })
        var blobURL = URL.createObjectURL(blob)
        buffer = await blob.arrayBuffer();
        buffer.fileStart = 0;
        mp4box.appendBuffer(buffer);

        myplayer.src({ type: 'video/mp4', src: blobURL });
        var video = document.querySelector("video");
        myplayer.on('loadeddata', () => {
            // video.addEventListener("loadeddata", function once() {
            //     video.removeEventListener('loadeddata', once);
            console.log("file loaded")

            if (myHostId != mySocketId) {
                socket.emit("getCurrentTime", currentSessionType, myHostId, currentFileSize)
            }
            else {
                hostLoadedFile = true
                socket.emit("hostLoadedFile", myHostId)
            }
        });
    }
    let playButton = document.getElementsByClassName("vjs-big-play-button")[0];
    if (myHostId == mySocketId) {
        var video = document.querySelector('video');
        video.addEventListener('play', function once() {
            video.removeEventListener('play', once)
            var time = myplayer.currentTime();
            socket.emit("playEmit", time);
        });
    }
    else {
        playButton.style.display = "none";
    }

}





//          SOCKET STUFF



socket.on("getCurrentTimeLoad", (id, _currentFileSize) => {
    if (currentFileSize != _currentFileSize) {
        socket.emit("wrongFile", id)
    }
    else {
        myplayer.pause()
        let currentTime = myplayer.currentTime()
        if (currentTime != 0) {
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

socket.on("setCurrentTimeLoad", currentTime => {

    myplayer.pause()
    myplayer.currentTime(currentTime)
})

socket.on("hostLoadedFile", () => {
    hostLoadedFile = true
})

socket.on("wrongFile", () => {
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

socket.on("pause", (time) => {
    myplayer.currentTime(time);
    myplayer.pause();
    if (myHostId == mySocketId) {
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