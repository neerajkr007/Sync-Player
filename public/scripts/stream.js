var myplayer = videojs("my-video");

function streamFile(e) {
    const [file] = files;
    currentFileSize = [file][[file].length - 1].size;
    var blob = new Blob([file], { type: "video/mp4" });
    var blobURL = URL.createObjectURL(blob);
    myplayer.src({ type: "video/mp4", src: blobURL });
    myplayer.on("loadeddata", (e) => {
        console.log("file loaded");
        if (myHostId != mySocketId) 
        {
            socket.emit(
                "getCurrentTime",
                currentSessionType,
                myHostId,
                currentFileSize
            );
        }
        else 
        {
            hostLoadedFile = true;
            socket.emit("hostLoadedFile", myHostId);
        }
    });

    // if(isHost)
    // {
    //     myplayer.on("seeked", ()=>{
    //         console.log("paused at "+myplayer.currentTime())
    //         socket.emit("seeked", myplayer.currentTime())
    //     })
    // }
    let playButton = document.getElementsByClassName("vjs-big-play-button")[0];
    if (myHostId == mySocketId) {
        var video = document.querySelector("video");
        video.addEventListener("play", function once() {
            video.removeEventListener("play", once);
            var time = myplayer.currentTime();
            socket.emit("playEmit", time);
        });
    } else {
        playButton.style.display = "none";
    }
}