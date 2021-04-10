var myplayer = videojs("my-video");
let chunkArray = []
let connArray = []
let currentFileDuration = 0
let chunkFactor = 0;
let chunkAmount = 0
let oneChunkLength = 0
let oneSecondChunks = 0



function streamFile(e) {
    let { target: { files } } = e
    let [file] = files;
    currentFileSize = [file][0].size;
    let blob = new Blob([file], { type: "video/mp4" });
    let blobURL = URL.createObjectURL(blob);

    /* dispose and recreate (not working for now) */

    // videojs('my-video').dispose();
    // let videoPlayer = document.createElement('video')
    // videoPlayer.id = "my-video"
    // videoPlayer.classList.add('videos-js')
    // videoPlayer.setAttribute('controls', "controls")
    // document.getElementById('player').appendChild(videoPlayer)
    // myplayer = videojs('my-video', {
    //     autoplay: false,
    //     preload: 'auto',
    //     fluid : "true"
    // });
    myplayer.src({ type: "video/mp4", src: blobURL });
    myplayer.on("loadeddata", (e) => {
        currentFileDuration = myplayer.duration()
        socket.emit("streamInfo", currentFileSize, currentFileDuration, mySocketId)
        console.log("file loaded");
    });
    chunkArray = []
    parseFile([file][0])

    var video = document.querySelector("video");
    video.addEventListener("play", function once() {
      video.removeEventListener("play", once);
      var time = myplayer.currentTime();
      socket.emit("playEmit", time);
    });
}


function createDataChannel (peer, conn)
{
    //conn.send('Hello!');
    connArray.push(conn)
}

let blobArray = []
let once2 = true

function recieveDataChannel(peer, conn)
{
    let chunksRecieved = 0
    let lastTime = 0
    let  newTime = 0
    let timeDifference = 0
    conn.on('data', function(data) {
        chunksRecieved++
        let d = new Date()
        if(once2)
        {
            lastTime = d.getTime()
            console.log(lastTime)
            once2 = false
        }
        newTime = d.getTime()
        blobArray.push(new Blob([new Uint8Array(data.chunk)],{'type':'video/mp4'}));
		let blob = new Blob(blobArray,{'type':'video/mp4'});
        if(currentFileDuration >= 60)
        {
            timeDifference = newTime - lastTime
            if(timeDifference >= 60000 && timeDifference < 65000)
            {
                loadChunks(URL.createObjectURL(blob))
                console.log("loaded 60 secs")
                lastTime = newTime
            }
        }
        console.log(chunksRecieved + "   " + chunkAmount)
        if(chunksRecieved == chunkAmount)
        {
            console.log("loaded all")
            loadChunks(URL.createObjectURL(blob))
        }
    });
}

function callback(e){
    console.log("pushed")
	chunkArray.push(e);
}

function parseFile(file) {
    var fileSize   = file.size;
    var chunkSize  = 262144; // bytes 262144
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
            console.log(chunkArray.length)
            if(chunkArray.length < 50)
            {
                setTimeout(() => {
                    startSendingChunks()
                }, 1000);
            }
            else
            {
                startSendingChunks()
            }
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

function startSendingChunks()
{
    console.log("works ?")
    for(let i = 0; i < chunkArray.length; i++)
    {
        for(let j = 0; j < connArray.length; j++)
        {
            console.log(i + " sent to " + j)
            connArray[j].send({chunk:chunkArray[i]})
        }
    }
}

function loadChunks(blob)
{
    myplayer.src({ type: 'video/mp4', src: blob });
    console.log("loaded")
}




//          SOCKET STUFF    



socket.on("pause", (time) => 
{
    //myplayer.currentTime(time);
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

socket.on("streamInfo", (size, length)=>{
    currentFileDuration = Math.ceil(Number(length))
    currentFileSize = Number(size)
    console.log(currentFileSize + "   " + currentFileDuration)
    chunkAmount = Math.ceil(currentFileSize/262144)
    oneChunkLength = currentFileDuration/chunkAmount
    oneSecondChunks = 1/oneChunkLength
})
