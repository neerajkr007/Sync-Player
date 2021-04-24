



function tryLogin(e, p, b)
{
    let allgood = [false, false]
    if(!b)
    {
        if(e == "")
        {
            document.getElementById("input0").classList.remove("is-valid");
            document.getElementById("input0").classList.add("is-invalid");
            document.getElementById("invalid0").innerHTML = "Required"
        }
        if(p == "")
        {
            document.getElementById("input1").classList.remove("is-valid");
            document.getElementById("input1").classList.add("is-invalid");
            document.getElementById("invalid1").innerHTML = "Required"
        }
        if(allgood[0] || allgood[1])
        {
            return
        }
        else
        {
            document.getElementById("modal-title").innerHTML = "wait";
            let text = "Logging in, please wait"
            document.getElementById("modal-body").innerHTML = '<div class="d-flex inline-flex"><div><p class="display-4 mr-4" style="font-size:medium; margin-bottom:0; margin-top:0.1rem">'+text+'</p></div><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>'
            $('#modal').modal('toggle');
            socket.emit("tryLogin", e, p, b)
        }
    }
    else
    {
            document.getElementById("modal-title").innerHTML = "wait";
            let text = "Logging in, please wait"
            document.getElementById("modal-body").innerHTML = '<div class="d-flex inline-flex"><div><p class="display-4 mr-4" style="font-size:medium; margin-bottom:0; margin-top:0.1rem">'+text+'</p></div><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>'
            $('#modal').modal('toggle');
            socket.emit("tryLogin", e, p, b)
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

var signinrememberme = getCookie("signinrememberme")
if(signinrememberme)
{
    let e = getCookie('signinemail')
    window.onload = function() {
        document.getElementById("loginForm").style.display = "none"
        tryLogin(e, "", true)
    }
}




//          SOCKET STUFF



socket.on("loginSuccess", (link, email, b)=>{
    if(document.getElementById("rememberMe").checked == true && !b)
    {
        let d = new Date();
        d.setTime(d.getTime() + (2 * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = "signinrememberme="+true+";" + expires
        document.cookie = "signinemail="+ email +";" + expires
        document.cookie = "signinhref="+ link +";" + expires
    }
    document.getElementById("modal-title").innerHTML = "Success";
    document.getElementById("modal-body").innerHTML = "Successfully Logged In";
    let timeOut = setTimeout(() => {
        $('#modal').modal('toggle');
        location.href = link
    }, 2000);
    $('#modal').on('hidden.bs.modal', function (e) {
        clearInterval(timeOut)
        location.href = link
    })
})

socket.on("loginFailed", (res)=>{
    document.getElementById("modal-title").innerHTML = "Failed";
    document.getElementById("modal-body").innerHTML = "Failed to login in";
    let timeOut = setTimeout(() => {
        $('#modal').modal('toggle');
    }, 2000);
    $('#modal').on('hidden.bs.modal', function (e) {
        clearInterval(timeOut)
    })
    if(res == "email")
    {
        document.getElementById("input0").classList.remove("is-valid");
        document.getElementById("input0").classList.add("is-invalid");
        document.getElementById("invalid0").innerHTML = "incorrect username or email"
    }
    else
    {
        document.getElementById("input1").classList.remove("is-valid");
        document.getElementById("input1").classList.add("is-invalid");
        document.getElementById("invalid1").innerHTML = "incorrect password"
    }
})








window.onunload = ()=>{
    socket.emit('yolo')
};









//          ON LOAD STUFF :




    
    

document.getElementById("input0").onfocus = ()=>{
    document.getElementById("usernameInput").style.borderBottom = "2px solid black"
}

document.getElementById("input0").onfocusout = ()=>{
    document.getElementById("usernameInput").style.borderBottom = "2px solid #aaaaaa"
}

document.getElementById("input1").onfocus = ()=>{
    document.getElementById("passwordInput").style.borderBottom = "2px solid black"
}

document.getElementById("input1").onfocusout = ()=>{
    document.getElementById("passwordInput").style.borderBottom = "2px solid #aaaaaa"
}

document.getElementById("input0").style.width = (document.getElementById("usernameInput").offsetWidth-14)+"px"
document.getElementById("input1").style.width = (document.getElementById("passwordInput").offsetWidth-14)+"px"
document.getElementById("loginButton").style.width =  (document.getElementById("randomDiv001").offsetWidth-30)+"px"