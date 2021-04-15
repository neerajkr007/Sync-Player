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
    var video = document.querySelector("video");
    video.addEventListener("loadeddata", function once() {
        video.removeEventListener('loadeddata', once);
        currentFileDuration = myplayer.duration()
        socket.emit("streamInfo", currentFileSize, currentFileDuration, mySocketId)
        chunkArray = []
        parseFile([file][0])
        console.log("file loaded");
      });
    // myplayer.on("loadeddata", (e) => {
    //     currentFileDuration = myplayer.duration()
    //     console.log("file loaded");
    // });

    var video = document.querySelector("video");
    video.addEventListener("play", function once() {
      video.removeEventListener("play", once);
      var time = myplayer.currentTime();
      socket.emit("playEmit", time);
    });
}


function createDataChannel (conn)
{
    //conn.send('Hello!');
    connArray.push(conn)
    if(myplayer.currentTime() > 10)
    {
        myplayer.pause()
        socket.emit("streamInfoToNew", currentFileSize, currentFileDuration, mySocketId)
        startSendingChunksInBetween(conn)
    }
}

let blobArray = []
let once2 = true
let once33 = true

function recieveDataChannel(conn)
{
    console.log("conn Recieved")
    let chunksRecieved = 0
    let lastTime = 0
    let  newTime = 0
    let timeDifference = 0
    let buffer = 0
    conn.on('data', function(data) {
        console.log("recieved next chunk")
        //console.log("recieved next chunk " + data.firstCall)
        
        if(data.firstCall)
        {
            chunksRecieved = 0
            blobArray = []
            once2 = true
            //conn.send("fileLoaded")
        }
        chunksRecieved++
        if(data.loadMeta)
        {
            chunksRecieved = data.forNewNextIs
            buffer = (chunksRecieved + Math.round(oneSecondChunks*70))
            //let blob = new Blob(blobArray,{'type':'video/mp4'});
            //loadChunks(URL.createObjectURL(blob), data.isPaused, data.currentTime)
            //console.log("loaded first time for new guys")
        }
        
        let d = new Date()
        if(once2)
        {
            lastTime = d.getTime()
            once2 = false
        }
        newTime = d.getTime()
        blobArray.push(new Blob([new Uint8Array(data.chunk)],{'type':'video/mp4'}));
		let blob = new Blob(blobArray,{'type':'video/mp4'});
        if(currentFileDuration >= 60)
        {
            timeDifference = newTime - lastTime
            if(chunksRecieved == Math.round(oneSecondChunks*70))
            {
                loadChunks(URL.createObjectURL(blob), data.isPaused, data.currentTime)
                console.log("loaded worth 70 secs")
                console.log(chunksRecieved)
            }
            if(chunksRecieved == buffer)
            {
                loadChunks(URL.createObjectURL(blob), data.isPaused, data.currentTime)
                console.log("loaded worth 70 secs for new ones")
                console.log(chunksRecieved)
            }
            
            if(timeDifference >= 60000 && timeDifference < 65000)
            {
                loadChunks(URL.createObjectURL(blob), data.isPaused, data.currentTime)
                console.log("loaded after 60 secs")
                lastTime = newTime
            }
        }
        //console.log(chunksRecieved + "   " + chunkAmount)
        if(chunksRecieved == chunkAmount)
        {
            console.log("loaded all")
            loadChunks(URL.createObjectURL(blob), data.isPaused, data.currentTime)
            conn.send("fileLoaded")
        }
        else
        {
            //console.log("conn sent")
            //console.log("conn sent for " + chunksRecieved)
            conn.send({nextChunk:chunksRecieved, isNextFile:data.firstCall})
                
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
    for(let i = 0; i < connArray.length; i++)
    {
        connArray[i].off('data')
    }
    let _isPaused, _currentTime;
    for(let i = 0; i < connArray.length; i++)
    {
        _isPaused = myplayer.paused()
        _currentTime = myplayer.currentTime()
        connArray[i].send({chunk:chunkArray[0], firstCall:true, isPaused:_isPaused, currentTime:_currentTime})
    }
    for(let i = 0; i < connArray.length; i++)
    {
        connArray[i].on('data', function once(data){
            if(data != "fileLoaded")
            {
                console.log("sending next chunk for " + i)
                //console.log("sending next chunk for " + data.nextChunk)
                _isPaused = myplayer.paused()
                _currentTime = myplayer.currentTime()
                connArray[i].send({chunk:chunkArray[data.nextChunk], firstCall:false, isPaused:_isPaused, currentTime:_currentTime})
            }
            else
            {
                connArray[i].off('data')
                //connArray[i].removeEventListener("data", once);
            }
        })
    }
}

let once4 = true

function startSendingChunksInBetween(conn)
{
    
    let _currentTime = myplayer.currentTime()
    let _isPaused = myplayer.paused()
    let next = Math.round(myplayer.currentTime()*oneSecondChunks)
    conn.send({chunk:chunkArray[0], firstCall:true, isPaused:_isPaused, currentTime:_currentTime})
    conn.on('data', function once(data){
        if(data != "fileLoaded")
        {
            console.log("sending next chunk for")
            //console.log("sending next chunk for " + data.nextChunk)
            _isPaused = myplayer.paused()
            _currentTime = myplayer.currentTime()
            if(data.nextChunk <= Math.round(oneSecondChunks*5))
            conn.send({chunk:chunkArray[data.nextChunk], firstCall:false, isPaused:_isPaused, currentTime:_currentTime})
            else if(once4)
            {
                conn.send({chunk:chunkArray[data.nextChunk], firstCall:false, isPaused:_isPaused, currentTime:_currentTime, forNewNextIs:next, loadMeta:true})
                once4 = false
            }
            else
            {
                conn.send({chunk:chunkArray[data.nextChunk], firstCall:false, isPaused:_isPaused, currentTime:_currentTime})
            }
            
        }
        else
        {
            conn.off('data')
            //connArray[i].removeEventListener("data", once);
        }
    })
}

function loadChunks(blob, isPaused, currentTime)
{
    myplayer.src({ type: 'video/mp4', src: blob });
    myplayer.on("loadeddata", (e) => {
        
    });
    myplayer.currentTime(currentTime)
    if (isPaused) {
        myplayer.pause()
    }
    else {
        myplayer.play()
    }
    myplayer.addRemoteTextTrack({
        kind: 'captions', 
        label:'added',
        src: subBlobUrl,
        mode: 'showing'}, false);
}




//          SOCKET STUFF    



// socket.on("pause", (time) => 
// {
//     //myplayer.currentTime(time);
//     myplayer.pause();
//     if (myHostId == mySocketId) 
//     {
//         var video = document.querySelector('video');
//         video.addEventListener('play', function once() {
//             var time = myplayer.currentTime();
//             video.removeEventListener('play', once)
//             socket.emit("playEmit", time);
//         });
//     }
// });

// socket.on("play", (time) => {
//     myplayer.currentTime(time);
//     myplayer.play();
//     if (myHostId == mySocketId) {
//         var video = document.querySelector('video');
//         video.addEventListener('pause', function once() {
//             var time = myplayer.currentTime();
//             video.removeEventListener('pause', once)
//             socket.emit("pauseEmit", time);
//         });
//     }
// });

socket.on("streamInfo", (size, length)=>{
    currentFileDuration = Math.ceil(Number(length))
    currentFileSize = Number(size)
    chunkAmount = Math.ceil(currentFileSize/262144)
    console.log(currentFileSize + "   " + currentFileDuration + "   " + chunkAmount)
    oneChunkLength = currentFileDuration/chunkAmount
    oneSecondChunks = 1/oneChunkLength
})

socket.on("ohman", ()=>{
    consolelog("wokrs ?")
})
