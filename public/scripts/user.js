const socket = io.connect()

if(window.location.href.match("localhost"))
{
    socket.emit("changeSocketId", window.location.href.slice(22))
}
else if(window.location.href.match("sync"))
{

}


//socket.emit("changeSocketId", )

function addFriend()
{
    document.getElementById("modal-title").innerHTML = "Add Friend";
    let modalBody =  document.getElementById("modal-body") //.innerHTML = '<div class="d-flex inline-flex"><div><p class="display-4 mr-4" style="font-size:medium; margin-bottom:0; margin-top:0.1rem">'+text+'</p></div><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>'
    modalBody.innerHTML = ""
    let label = document.createElement('label')
    label.for = "searchInput"
    label.innerHTML = "enter your friend's username or email"
    let input = document.createElement('input')
    input.id = "searchInput"
    input.type = "text"
    modalBody.appendChild(label)
    modalBody.appendChild(input)
    document.getElementById("searchButton").onclick = ()=>{
        let name = document.getElementById("searchInput").value
        modalBody.innerHTML += '<div id="searchingSpinner" class="d-flex inline-flex mt-4"><div><p class="display-4 mr-4" style="font-size:medium; margin-bottom:0; margin-top:0.1rem">'+'searching'+'</p></div><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>'
        socket.emit("searchFriend", name)
    }
    document.getElementById("searchButton").style.display = "block"
    socket.on("searchResult", user=>{
        document.getElementById("searchingSpinner").remove()
        try{
            document.getElementById("searchResult").remove()
        }
        catch{}
        let p = document.createElement('p')
        p.id = "searchResult"
        if(user != null)
        {
            p.setAttribute("class", "hoverPointer mt-4")
            p.innerHTML = user.userName
            p.onclick = ()=>{
                p.innerHTML += "  request sent !"
                socket.emit("sendRequest", user._id)
            }
        }
        else
        {
            p.setAttribute("class", "mt-4")
            p.innerHTML = "no user found with given email or username "
        }
        modalBody.appendChild(p)
    })
    $('#modal').modal('toggle');
}

function requestResponse(users)
{
    document.getElementById("modal-title").innerHTML = "Friend Requests :";
    let modalBody =  document.getElementById("modal-body") //.innerHTML = '<div class="d-flex inline-flex"><div><p class="display-4 mr-4" style="font-size:medium; margin-bottom:0; margin-top:0.1rem">'+text+'</p></div><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>'
    modalBody.innerHTML = ""
    for(let i = 0; i < users.length; i++)
    {
        let p =document.createElement('p')
        p.setAttribute("class", "mt-4 mb-0")
        p.setAttribute("style", "font-size: x-large")
        p.innerHTML = users[i].userName
        let button1 = document.createElement("button")
        button1.setAttribute("class", "btn btn-success text-white")
        button1.innerHTML = '<span><i class="fas fa-check"></i></span> Accept'
        button1.onclick = ()=>{
            socket.emit("acceptFriendRequest", users[i])
        }
        let button2 = document.createElement("button")
        button2.setAttribute("class", "btn btn-danger text-white ml-3")
        button2.innerHTML = '<span><i class="fas fa-times"></i></span> Decline'
        modalBody.appendChild(p)
        modalBody.appendChild(button1)
        modalBody.appendChild(button2)
    }
    $('#modal').modal('toggle');
}





//          SOCKET STUFF



socket.on("notification", (user, users)=>{
    let n = user.requests.length
    document.getElementById("bellCounter").innerHTML = n
    document.getElementById("bellCounter").style.display = "block"
    document.getElementById("requests").style.display = "block"
    document.getElementById("noRequests").style.display = "none"
    document.getElementById("requests").innerHTML = 'Friend Requests : ' + n
    document.getElementById("requests").onclick = ()=>{
        requestResponse(users)
    }
})

socket.on("acceptedMe", ()=>{

})

socket.on("acceptedFriend", (name)=>{
    
})