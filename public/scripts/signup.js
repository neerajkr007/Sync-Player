socket  = io.connect()
socket.emit("yolo")





















//          ON LOAD STUFF :

for(let i = 0; i < 4; i++)
{
    document.getElementById("input"+i).onfocus = ()=>{
        document.getElementById("inputBox"+i).style.borderBottom = "2px solid black"
    }
    
    document.getElementById("input"+i).onfocusout = ()=>{
        document.getElementById("inputBox"+i).style.borderBottom = "2px solid #aaaaaa"
    }
    if(i != 0)
        document.getElementById("input"+i).style.width = (document.getElementById("inputBox"+i).offsetWidth-14)+"px"
    else
        document.getElementById("input"+i).style.width = (document.getElementById("inputBox"+i).offsetWidth-16)+"px"
}
document.getElementById("loginButton").style.width =  (document.getElementById("randomDiv001").offsetWidth-30)+"px"