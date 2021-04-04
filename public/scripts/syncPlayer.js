
function getStarted()
{
    document.getElementById("modal-title").innerHTML = "Session Type";
    let modalBody =  document.getElementById("modal-body") 
    modalBody.innerHTML = 
    '<div class="form-check"><input class="form-check-input" type="radio" name="Radios" id="Radios1" value="load" checked><label id="Radios01" class="form-check-label" for="Radios1">users have their file and will load themselves</label></div>'
    +'<div class="form-check"><input class="form-check-input" type="radio" name="Radios" id="Radios2" value="stream"><label id="Radios02" class="form-check-label" for="Radios2">users will stream from the host</label></div>'
    let cancelButton = document.getElementById('modal-cancel')
    cancelButton.innerHTML = "confirm"
    cancelButton.onclick = ()=>{
        document.getElementById("chatBox").style.display = "block"
        document.getElementById("getStartedButton").innerHTML = "Session Type"
        if (document.getElementById("Radios1").checked) {
            document.getElementById("sessionType").innerHTML = " : " + document.getElementById("Radios01").innerHTML
        }
        else {
            document.getElementById("sessionType").innerHTML = " : " + document.getElementById("Radios02").innerHTML
        }
    }
    $('#modal').modal('toggle');
}


