let once66 = true
let link = ""
let once67 = true

function syncYoutube()
{
    console.log("yt")
    myplayer.dispose();
    if(myHostId == mySocketId)
    {
        link = document.getElementById("ytLinkInput").value
        myplayer = createNewPlayer(link)
        socket.emit("ytLink", link)
        myplayer.on('play', ()=>{
            myplayer.off('play')
            var time = myplayer.currentTime();
            socket.emit("playEmit", time);
        })
    }
    if(once66)
    {
        document.getElementById('player').style.display = "block"
        document.getElementById('1').style.display = "none"
        document.getElementById('myfile').style.display = "none"
        document.getElementById("mySubs").previousElementSibling.style.display = "none"
        document.getElementById("mySubs").style.display = "none"
        once66 = false
    }
    
    //myplayer.datasetup('{"autoplay": false, "techOrder": ["youtube"]}')
    //myplayer2 = videojs('my-video', {"autoplay": false, "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src":"https://www.youtube.com/watch?v=OIJARuw55L0"}]});
    // videojs('my-video').ready(function() {
    //     var myPlayer = this;
    //     //myPlayer.src({ type: 'video/youtube', src: 'https://www.youtube.com/watch?v=fe2s-7IYg-0' });
    //     myplayer.play()
    //   });
}

function createNewPlayer(link)
{
    if(myHostId != mySocketId)
    syncYoutube()
    let newPlayer = document.createElement('video')
    newPlayer.id = "yplayer1"
    newPlayer.controls = true
    newPlayer.setAttribute("class", "video-js mb-10")
    newPlayer.setAttribute("fluid", true)
    newPlayer.preload = "auto"
    document.getElementById('player').appendChild(newPlayer)
    let yt = videojs("yplayer1", {"autoplay": false, "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src":link}]})//, 'plugins': "{httpSourceSelector:{default: 'high'}}"})
    return yt
}

// socket stuff

socket.on("ytLink", link=>{
    myplayer = createNewPlayer(link)
    console.log(link)
})