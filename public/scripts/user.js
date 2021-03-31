const socket = io.connect()

if(window.location.href.match("localhost"))
{
    socket.emit("changeSocketId", window.location.href.slice(22))
}
else if(window.location.href.match("sync"))
{
    socket.emit("changeSocketId", window.location.href.slice(40))
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
                socket.emit("sendRequest", user._id)
            }
            socket.on("requestSent", ()=>{
                p.innerHTML += "  request sent !"
            })
            socket.on("requestNotSent", (n)=>{
                if(n == 1)
                    p.innerHTML += "        request already sent, pending response !"
                else
                    p.innerHTML += "        already friends with this user !"
            })
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
            $('#modal').modal('toggle');
            socket.emit("acceptFriendRequest", users[i])
        }
        let button2 = document.createElement("button")
        button2.setAttribute("class", "btn btn-danger text-white ml-3")
        button2.innerHTML = '<span><i class="fas fa-times"></i></span> Decline'
        button2.onclick = ()=>{
            $('#modal').modal('toggle');
            socket.emit("rejectFriendRequest", users[i])
        }
        modalBody.appendChild(p)
        modalBody.appendChild(button1)
        modalBody.appendChild(button2)
    }
    $('#modal').modal('toggle');
}

function showFriends(friends)
{
    let friendList = document.getElementById("friendsList")
    for(let i = 0; i < friends.length; i++)
    {
        let a = document.createElement("a")
        a.setAttribute("class", "dropdown-item hoverPointer p-0 ml-3")
        a.setAttribute("style", "background-color: transparent !important; width: fit-content;")
        a.innerHTML = friends[i]
        friendList.appendChild(a)
    }
}





//          SOCKET STUFF



socket.on("notification", (user, users)=>{
    let n = user.requests.length
    //console.log(user)
    if(n != 0)
    {
        document.getElementById("bellCounter").innerHTML = n
        document.getElementById("bellCounter").style.display = "block"
        document.getElementById("requests").style.display = "block"
        document.getElementById("noRequests").style.display = "none"
        document.getElementById("requests").innerHTML = 'Friend Requests : ' + n
        document.getElementById("requests").onclick = ()=>{
            requestResponse(users)
        }
    }
    else
    {
        document.getElementById("bellCounter").innerHTML = n
        document.getElementById("bellCounter").style.display = "none"
        document.getElementById("requests").style.display = "none"
        document.getElementById("noRequests").style.display = "block"
    }
    if(user.notifications.length != 0)
    {
        document.getElementById("bellCounter").innerHTML = user.notifications.length
        document.getElementById("bellCounter").style.display = "block"
        document.getElementById("noRequests").style.display = "none"
        let notificationDropdown = document.getElementById("notificationDropdown")
        for(let i = 0; i < user.notifications.length; i++)
        {
            if(i != 0)
            {
                let div = document.createElement('div')
                div.setAttribute("class", "dropdown-divider")
                notificationDropdown.appendChild(div)
            }
            let p = document.createElement('p')
            // p.style.fontSize = "10px"
            p.classList.add("ml-3")
            p.innerHTML = user.notifications[i]
            let mar = document.createElement('label')
            mar.for = user.notifications[i]
            mar.innerHTML = "mark as read ?"
            let check = document.createElement('input')
            check.id = user.notifications[i]
            check.type = "checkbox"
            check.classList.add("ml-4")
            notificationDropdown.appendChild(p)
            //notificationDropdown.appendChild(mar)
            //notificationDropdown.appendChild(check)
        }
        
    }
})

socket.on("acceptedMe", (name)=>{


    // add/update friend to friends list
    let friendList = document.getElementById("friendsList")
    let a = document.createElement("a")
    a.setAttribute("class", "dropdown-item hoverPointer p-0 ml-3")
    a.setAttribute("style", "background-color: transparent !important; width: fit-content;")
    a.innerHTML = name
    friendList.appendChild(a)
})

socket.on("acceptedFriend", (name)=>{
    document.getElementById("searchButton").style.display = "none"
    document.getElementById("modal-title").innerHTML = "Done";
    document.getElementById("modal-body").innerHTML = name + " Accepted your friend request";
    let timeOut = setTimeout(() => {
        $('#modal').modal('toggle');
    }, 1000);
    $('#modal').on('hidden.bs.modal', function (e) {
        clearInterval(timeOut)
    })


    // add/update friend to friends list
    let friendList = document.getElementById("friendsList")
    let a = document.createElement("a")
    a.setAttribute("class", "dropdown-item hoverPointer p-0 ml-3")
    a.setAttribute("style", "background-color: transparent !important; width: fit-content;")
    a.innerHTML = name
    friendList.appendChild(a)
})

socket.on("rejectedMe", ()=>{
    document.getElementById("modal-title").innerHTML = "Done";
    document.getElementById("modal-body").innerHTML = "Rejected friend request";
    let timeOut = setTimeout(() => {
        $('#modal').modal('toggle');
    }, 1000);
    $('#modal').on('hidden.bs.modal', function (e) {
        clearInterval(timeOut)
    })
})

socket.on("rejectedFriend", (name)=>{
    document.getElementById("searchButton").style.display = "none"
    document.getElementById("modal-title").innerHTML = "Done";
    document.getElementById("modal-body").innerHTML = name + " Rejected your friend request";
    let timeOut = setTimeout(() => {
        $('#modal').modal('toggle');
    }, 1000);
    $('#modal').on('hidden.bs.modal', function (e) {
        clearInterval(timeOut)
    })
})

socket.on("showFriends", friends=>{
    showFriends(friends)
})




//          ON LOADED STUFF


$('#friendsListCol').on('hide.bs.dropdown', function (e) {
    if (e.clickEvent) {
      e.preventDefault();
    }
})
