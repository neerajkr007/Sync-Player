let once66 = true
let link = ""
let once67 = true
var player;
let playerWidth 
let playerHeight



//document.getElementById('player').style.display = "none"

// function createNewPlayer(link)
// {
//     if(myHostId != mySocketId)
//     syncYoutube()
//     let newPlayer = document.createElement('video')
//     newPlayer.id = "yplayer1"
//     newPlayer.controls = true
//     newPlayer.setAttribute("class", "video-js mb-10")
//     newPlayer.setAttribute("fluid", true)
//     newPlayer.preload = "auto"
//     document.getElementById('player').appendChild(newPlayer)
//     let yt = videojs("yplayer1", {"autoplay": false, "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src":link}]})//, 'plugins': "{httpSourceSelector:{default: 'high'}}"})
//     return yt
// }


// function syncYoutube()
// {
//     console.log("yt")
//     myplayer.dispose();
//     if(myHostId == mySocketId)
//     {
//         link = document.getElementById("ytLinkInput").value
//         socket.emit("ytLink", link)
//         myplayer = createNewPlayer(link)
//         socket.emit("ytLink", link)
//         if(mySocketId == myHostId)
//         {
//             myplayer.on('play', ()=>{
//                 myplayer.off('play')
//                 var time = myplayer.currentTime();
//                 socket.emit("playEmit", time);
//             })
//             var previousTime = 0;
//             var currentTime = 0;
//             var playerIsPaused = false
//             myplayer.controlBar.progressControl.on('mousedown', () => {
//                 previousTime = myplayer.currentTime()
//                 playerIsPaused = myplayer.paused()
//             }
//             );
//             myplayer.controlBar.progressControl.seekBar.on('mousedown', () => {
//                 previousTime = myplayer.currentTime()
//                 playerIsPaused = myplayer.paused()
//             }
//             );
//             // myplayer.on('keydown', (e) => {
//             //     if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
//             //         previousTime = myplayer.currentTime();
//             //     }
//             // });

//             myplayer.on('seeked', ()=>{
//                 // console.log(previousTime)
//                 // console.log(myplayer.currentTime())
//                 currentTime = Math.floor(myplayer.currentTime())
//                 // console.log('%c ' + previousTime, 'background: #222; color: #bada55')
//                 // console.log('%c ' + myplayer.currentTime(), 'background: #222; color: #bada55')
//                 if(Math.floor(previousTime) == Math.floor(currentTime) || Math.ceil(previousTime) == Math.ceil(currentTime))
//                 {
//                     return
//                 }
//                 currentTime = Math.floor(myplayer.currentTime())
//                 //console.log('%c seeked', 'background: #222; color: #bada55')
//                 if (playerIsPaused) {
//                     //socket.emit("pauseEmit", currentTime)
//                 }
//                 else {
//                     //socket.emit("playEmit", currentTime)
//                 }
//             })
//         }        
//     }
//     if(once66)
//     {
//         document.getElementById('player').style.display = "block"
//         document.getElementById('1').style.display = "none"
//         document.getElementById('myfile').style.display = "none"
//         document.getElementById("mySubs").previousElementSibling.style.display = "none"
//         document.getElementById("mySubs").style.display = "none"
//         once66 = false
//     }
// }


// // socket stuff

// socket.on("ytLink", link=>{
//     myplayer = createNewPlayer(link)
// })





function syncYoutube() {
    if(once66)
    {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        once66 = false
    }
    let videoId
    if(mySocketId == myHostId)
    {
        videoId = getId(document.getElementById('ytLinkInput').value)
        socket.emit("ytLink", videoId)
        createPlayer(videoId)
    }
}

function createPlayer(videoId) 
{
    document.getElementById('player').style.display = "block"
    playerWidth  = document.getElementById('my-video').offsetWidth
    playerHeight = document.getElementById('my-video').offsetHeight
    player = new YT.Player('player', {
        height: playerHeight,
        width: playerWidth,
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'controls': 1, 
            'modestbranding': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function getId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
        ? match[2]
        : null;
}

function onYouTubeIframeAPIReady() {
    console.log("api ready")
}

function onPlayerReady(event) {
    //event.target.playVideo(); 
    console.log("ready")
}

var done = false;
let previousEventType = -2
function onPlayerStateChange(event) {
    console.log(event.data)
    if (event.data == YT.PlayerState.PLAYING && !done) {
        //setTimeout(stopVideo, 6000);
        done = true;
    }
    if(mySocketId == myHostId)
    {
        if(event.data == 1)// && previousEventType != 3)
        {
            socket.emit("playEmitYT", player.playerInfo.currentTime)
        }
        else if(event.data == 2)
        {
            socket.emit("pauseEmitYT", player.playerInfo.currentTime)
        }


        previousEventType = event.data
    }
}





socket.on("ytLink", videoId=>{
    if(once67)
    {
        syncYoutube()
    }
    createPlayer(videoId)
})

socket.on("pauseYT", (time) => 
{
    player.seekTo(time);
    player.pauseVideo()
});

socket.on("playYT", (time) => {
    //player.seekTo(time);
    player.playVideo()
});