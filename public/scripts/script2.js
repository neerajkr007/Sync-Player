<script>
        const input = document.getElementById('myfile');
        let file = null
        const mediaSource = new MediaSource()
        input.addEventListener('change', pickFile)
        function pickFile(e) {
          console.log("works");
          file = e.currentTarget.files[0]
          var path = file.path;
          console.log(path);
          console.log(file);
          mediaSource.addEventListener('sourceopen', feedMediaSource)
          var video = document.getElementById("test");
          video.src = URL.createObjectURL(mediaSource);
          var myPlayer = videojs('my-video');
          myPlayer.load();
          myPlayer.play();
          //console.log(file.name);
                    //console.log(URL.createObjectURL(file));
          //document.body.insertBefore(video, input)
        }
        function feedMediaSource() {
          console.log("works 2");
          const sourceBuffer = mediaSource.addSourceBuffer(file.type)
          console.log("file.name");
          fetchAB(file.name, function (buf)
          {
            sourceBuffer.appendBuffer(buf);
          });
        }

        function fetchAB (url, cb)
        {
          var xhr = new XMLHttpRequest;
          xhr.open('get', url);
          xhr.responseType = 'arraybuffer';
          xhr.onload = function ()
          {
            cb(xhr.response);
          };
          xhr.send();
        }
        
        
      </script>