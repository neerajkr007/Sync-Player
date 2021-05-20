var myplayer = videojs("my-video");
let chunkArray = []
let connArray = []
let currentFileDuration = 0
let chunkFactor = 0;
let chunkAmount = 0
let oneChunkLength = 0
let oneSecondChunks = 0
let newChunkNumber = 0
let chunksSent = []


function streamFile(e) {
    let { target: { files } } = e
    let [file] = files;
    currentFileSize = [file][0].size;
    let blob = new Blob([file], { type: "video/mp4" });
    let blobURL = URL.createObjectURL(blob);
    myplayer.src({ type: "video/mp4", src: blobURL });
    var video = document.querySelector("video");
    video.addEventListener("loadeddata", function once() {
        video.removeEventListener('loadeddata', once);
        currentFileDuration = myplayer.duration()
        socket.emit("streamInfo", currentFileSize, currentFileDuration, mySocketId)
        chunkArray = []
        document.getElementById("modal-title").innerHTML = "wait";
        let modalBody = document.getElementById("modal-body")
        modalBody.innerHTML = "please wait while we get a few things ready, you will get an alert when we are ready"
        $('#modal').modal('toggle');
        parseFile([file][0])
        console.log("file loaded");
        document.getElementById("modal-title").innerHTML = "wait";
        modalBody.innerHTML = "other users are loading files please dont start the video till next alert"
        $('#modal').modal('toggle');
    });
    video.addEventListener("play", function once() {
      video.removeEventListener("play", once);
      var time = myplayer.currentTime();
      socket.emit("playEmit", time);
    });



    //          SEEKING STUFF


    var previousTime = 0;
    var currentTime = 0;
    myplayer.controlBar.progressControl.on('mousedown', () => 
        previousTime = myplayer.currentTime()
    );
    myplayer.controlBar.progressControl.seekBar.on('mousedown', () => 
        previousTime = myplayer.currentTime()
    );
    myplayer.on('keydown', (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            previousTime = myplayer.currentTime();
        }
    });

    console.log(previousTime);
    myplayer.on('seeked', function once(){
        if(Math.floor(previousTime) == Math.floor(currentTime))
        {
            return
        }
        currentTime = Math.floor(myplayer.currentTime())
        // console.log(previousTime)
        // console.log(currentTime)
        // console.log("seeked")
        newChunkNumber = oneSecondChunks*currentTime
        // let newTime = newChunkNumber*oneChunkLength
        // let oldTime = []
        for(let i = 0; i < chunksSent.length; i++)
        {
            oldTime[i] = chunksSent[i]*oneChunkLength
            if(newTime - oldTime[i] >= 60)
            {
                //console.log("yolo")
            }
            if(oldTime[i] - currentTime >= 60)
            {
                //          LOAD VIDEO TILL NOW
            }
            else 
            {

            }
        }
    })
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
let chunksRecieved = 0

function recieveDataChannel(conn)
{
    console.log("conn Recieved")
    
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
        if(currentFileDuration >= 60)
        {
            timeDifference = newTime - lastTime
            if(chunksRecieved == Math.round(oneSecondChunks*70))
            {
                let blob = new Blob(blobArray,{'type':'video/mp4'});
                loadChunks(URL.createObjectURL(blob), data.isPaused, data.currentTime)
                console.log("loaded worth 70 secs")
                console.log(chunksRecieved)
                socket.emit("readyToStream", myHostId)
            }
            if(chunksRecieved == buffer)
            {
                let blob = new Blob(blobArray,{'type':'video/mp4'});
                loadChunks(URL.createObjectURL(blob), data.isPaused, data.currentTime)
                console.log("loaded worth 70 secs for new ones")
                console.log(chunksRecieved)
                socket.emit("readyToStream", myHostId)
            }
            
            if(timeDifference >= 60000 && timeDifference < 65000)
            {
                let blob = new Blob(blobArray,{'type':'video/mp4'});
                loadChunks(URL.createObjectURL(blob), data.isPaused, data.currentTime)
                console.log("loaded after 60 secs")
                lastTime = newTime
            }
        }
        //console.log(chunksRecieved + "   " + chunkAmount)
        if(chunksRecieved == chunkAmount)
        {
            console.log("loaded all")
            let blob = new Blob(blobArray,{'type':'video/mp4'});
            loadChunks(URL.createObjectURL(blob), data.isPaused, data.currentTime)
            conn.send("fileLoaded")
            chunksRecieved = 0
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
            // if(chunkArray.length < 50)
            // {
            //     setTimeout(() => {
            //         startSendingChunks()
            //     }, 1000);
            // }
            // else
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
                chunksSent[i] = (data.nextChunk - 1)
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
    let myIndex = 0
    let _currentTime = myplayer.currentTime()
    let _isPaused = myplayer.paused()
    let next = Math.round(myplayer.currentTime()*oneSecondChunks)
    myIndex = chunksSent.length
    chunksSent[myIndex] = 0
    conn.send({chunk:chunkArray[0], firstCall:true, isPaused:_isPaused, currentTime:_currentTime})
    conn.on('data', function once(data){
        if(data != "fileLoaded")
        {
            console.log("sending next chunk for")
            //console.log("sending next chunk for " + data.nextChunk)
            _isPaused = myplayer.paused()
            _currentTime = myplayer.currentTime()
            if(data.nextChunk <= Math.round(oneSecondChunks*10))
            conn.send({chunk:chunkArray[data.nextChunk], firstCall:false, isPaused:_isPaused, currentTime:_currentTime})
            else if(once4)
            {
                conn.send({chunk:chunkArray[data.nextChunk], firstCall:false, isPaused:_isPaused, currentTime:_currentTime, forNewNextIs:next, loadMeta:true})
                once4 = false
            }
            else
            {
                chunksSent[myIndex] = (data.nextChunk - 1)
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
    if(subBlobUrl != null)
    {
        myplayer.addRemoteTextTrack({
            kind: 'captions', 
            label:'en',
            src: subBlobUrl,
            mode: 'showing'}, false);
    }
}

function loadSubs(subBlobUrl)
{
    
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

socket.on("seeked", ()=>{
    
})

let readyUsers = 0

socket.on("readyToStream", ()=>{
    console.log("works ?")
    readyUsers++
    if(readyUsers == (currentUserCount - 1))
    {
        document.getElementById("modal-title").innerHTML = "done";
        let modalBody = document.getElementById("modal-body")
        modalBody.innerHTML = "all users are ready to watch, you can start the video"
        $('#modal').modal('toggle');
    }
})
