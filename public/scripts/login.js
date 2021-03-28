





















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