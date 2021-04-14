const socket = io.connect()
let friendsName = ""
let myName = ""
let mySocketId = ""
let myHostId = ""


if(window.location.href.match("localhost"))
{
    
    try
    {
        mySocketId = window.location.href.slice(22)
        socket.emit("changeSocketId", mySocketId)
    }
    catch{}
}
else if(window.location.href.match("sync"))
{
    try
    {
        mySocketId = window.location.href.slice(40)
        socket.emit("changeSocketId", mySocketId)
    }
    catch{}
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
        let li = document.createElement('li')
        li.classList.add("dropdown-submenu")
        let a = document.createElement("a")
        a.setAttribute("class", "hoverPointer p-0 ml-3 dropdown-item " + friends[i])
        a.setAttribute("style", "background-color: transparent !important; width: calc(100% - 50px); font-size: 21px;")
        a.innerHTML = friends[i] + '<span id = "status' + friends[i] + '" class="float-right" style="color: gray"><i class="fas fa-circle"></i></span>'
        let div  = document.createElement('div')
        div.setAttribute("class", "dropdown-menu-right dropdown-menu")



        let a1 = document.createElement('a')
        a1.setAttribute("class", "dropdown-item hoverPointer p-0 ml-3")
        a1.setAttribute("style", "width: fit-content;")
        let span1 = document.createElement('span')
        span1.innerHTML = '<i class="fas fa-arrow-circle-left mr-2"></i>Invite to room'
        a1.onclick = ()=>{
            a1.parentElement.classList.remove('show')
            if(sessionType != null)
            {
                socket.emit('createRoom')
                socket.emit('inviteToRoom', friends[i], myName)
            }
            else
            {
                document.getElementById("modal-title").innerHTML = "failed";
                let modalBody =  document.getElementById("modal-body")
                modalBody.innerHTML = "please create a room first"
                $('#modal').modal('toggle');
            }
        }



        let a2 = document.createElement('button')
        a2.setAttribute("class", "dropdown-item hoverPointer noBorder p-0 ml-3")
        a2.setAttribute("style", "width: fit-content;")
        a2.id = "sendMessageButton"+friends[i]
        let span2 = document.createElement('span')
        span2.innerHTML = '<i class="far fa-comment-alt mr-2"></i>Send Message'
        a2.onclick = ()=>{
            a2.parentElement.classList.remove('show')
            
            friendsName = friends[i]
            let main = document.getElementById('main')


            let div0 = document.createElement('div')
            div0.setAttribute('class', "fixed-bottom mb-5 mt-10")
            div0.setAttribute('style', 'left: calc(95% - 300px); display: none;')
            div0.id = "chatBox"+friends[i]


            let section0 = document.createElement('section')
            section0.setAttribute('class', 'chatbox')

            
            let div1 = document.createElement('div')
            div1.setAttribute('style', 'min-height: 50px; padding-top: 16px; background-color: #2F323B; border-bottom: 1px solid #2671ff')


            let span0 = document.createElement('span')
            span0.setAttribute('class', 'text-white')


            let p = document.createElement('p')
            p.id = "friendNameChat"+friends[i]
            p.setAttribute('class', 'd-inline-flex ml-3 mb-0')

            span0.appendChild(p)


            let itag = document.createElement('i')
            itag.setAttribute('class', 'fas fa-times fa-1x float-right mr-3 d-inline-flex')
            itag.setAttribute('onclick', "hideChat(-1, '"+friends[i]+"')")

            span0.appendChild(itag)
            div1.appendChild(span0)
            section0.appendChild(div1)


            let section1 = document.createElement('section')
            section1.id = "chatWindow"+friends[i]
            section1.setAttribute('class', "chat-window")


            section0.appendChild(section1)


            let form = document.createElement('form')
            form.setAttribute('class', 'chat-input')
            form.setAttribute('onsubmit', 'return false;')
            form.innerHTML = '<input id="message' + friends[i] + '" class="messageInput" type="text" autocomplete="off" placeholder="enter a message" />'
            let btn = document.createElement('button')
            btn.setAttribute('class', 'noBorder mt-2')
            btn.innerHTML = '<img src="https://img.icons8.com/fluent/48/000000/filled-sent.png"/>'
            btn.setAttribute('onclick', "sendMessage('" + friends[i] + "')")
            form.appendChild(btn)


            section0.appendChild(form)
            div0.appendChild(section0)
            main.appendChild(div0)



            document.getElementById("chatBox"+friends[i]).style.display = "block"
            document.getElementById('message'+friends[i]).focus()
            document.getElementById("friendNameChat"+friends[i]).innerHTML = friends[i]
        }



        let a3 = document.createElement('a')
        a3.setAttribute("class", "dropdown-item hoverPointer p-0 ml-3")
        a3.setAttribute("style", "width: fit-content;")
        let span3 = document.createElement('span')
        span3.innerHTML = '<i class="fas fa-user-slash mr-2"></i>Remove Friend'
        a3.onclick = ()=>{
            a3.parentElement.classList.remove('show')
        }



        let div2 = document.createElement('div')
        div2.setAttribute("class", "dropdown-divider")
        let div3 = document.createElement('div')
        div3.setAttribute("class", "dropdown-divider")


        a1.appendChild(span1)
        a2.appendChild(span2)
        a3.appendChild(span3)


        div.appendChild(a1)
        div.appendChild(div2)
        div.appendChild(a2)
        div.appendChild(div3)
        div.appendChild(a3)

        li.appendChild(a)
        li.appendChild(div)
        friendList.appendChild(li)
        $('.dropdown-menu a.'+friends[i]).on('click', function(e) {
            if (!$(this).next().hasClass('show')) {
              $(this).parents('.dropdown-menu').first().find('.show').removeClass('show');
            }
            var $subMenu = $(this).next('.dropdown-menu');
            $subMenu.toggleClass('show');
          
          
            $(this).parents('#friendsListCol').on('hidden.bs.dropdown', function(e) {
              $('.dropdown-submenu .show').removeClass('show');
            });
          
          
            return false;
        });
    }
    document.getElementById('friendsButton2').click()
    document.getElementById('friendsButton').setAttribute('style', "min-height: " + (document.getElementById('friendsList').offsetHeight + 200) + "px !important;")
    document.getElementById('friendsButton2').click()
}

function hideChat(n, friend)
{
    if(n == -1)
    {
        document.getElementById("chatBox"+friend).style.display = "none"
        document.getElementById("chatBoxButton").style.display = "block"
    }
    else
    {
        document.getElementById("chatBox"+friend).style.display = "block"
        document.getElementById("chatBoxButton").style.display = "none"
    }
}

function displayMessage(n, message, name)
{
    if(n == 1)
    {
        document.getElementById("friendNameChat"+name).innerHTML = name
    }
    document.getElementById("chatBox"+name).style.display = "block"
    document.getElementById("chatBoxButton").style.display = "none"
    let friends = document.querySelectorAll('[id^="chatBox"]')
    let numberOfFriends = friends.length;
    for(let i = 1; i < numberOfFriends.length; i++)
    {
        if(friends[i].id != "chatBox"+name)
        {
            friends[i].style.display = "none"
        }
    }
    let messageType = {0:"msg-self", 1:"msg-remote"}
    let userImg = {0:"//gravatar.com/avatar/56234674574535734573000000000001?d=retro", 1:"//gravatar.com/avatar/56234674574535734573000000000001?d=retro"}
    let chatWindow = document.getElementById("chatWindow"+name)



    let article = document.createElement('article')
    article.setAttribute("class", "msg-container")
    article.classList.add(messageType[n])


    let div0 = document.createElement('div')
    div0.setAttribute("class", "msg-box")


    let img = document.createElement('img')
    img.setAttribute("class", "user-img")
    img.src = userImg[n]



    let div1 = document.createElement('div')
    div1.classList.add("flr")


    let div2 = document.createElement('div')
    div2.classList.add("messages")



    let p = document.createElement('p')
    p.classList.add('msg')
    p.innerHTML = message



    let span = document.createElement('span')
    span.classList.add('timestamp')
    var d = new Date(),
            h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
            m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    var time = h + ':' + m;
    span.innerHTML = '<span class="username">' + name + '</span>&bull;<span class="posttime">' + time + '</span>'
    
    div2.appendChild(p)
    div1.appendChild(div2)
    div1.appendChild(span)
    if(n == 0)
    {
        div0.appendChild(div1)
        div0.appendChild(img)
    }
    else
    {
        div0.appendChild(img)
        div0.appendChild(div1)
    }
    article.appendChild(div0)
    chatWindow.appendChild(article)
    document.getElementById("chatWindow"+name).scrollTop = document.getElementById("chatWindow"+name).scrollHeight
}

function sendMessage(friend)
{
    let message = document.getElementById('message'+friend).value
    document.getElementById('message'+friend).value = ""
    let a = document.getElementById("friendNameChat"+friend).innerHTML


    // 0 for me and 1 for friend
    if(message != "")
    {
        socket.emit("message", message, a, myName)
        displayMessage(0, message, friend)
    }
}

function chatMenu()
{
    let friends = document.querySelectorAll('[id^="chatWindow"]')
    let chatMenu = document.getElementById('chatWindow')
    chatMenu.innerHTML = ""
    let numberOfFriends = friends.length;
    for(let i = 1; i < numberOfFriends; i++)
    {
        if(friends[i].innerHTML != "")
        {
            let a = document.createElement('a')
            a.innerHTML = friends[i].id.slice(10)
            a.setAttribute('class', 'w-100 btn pt-3 pb-3 text-left')
            a.setAttribute('style', 'border-top: 1px solid #2671ff; border-bottom: 1px solid #2671ff; color: white; background-color: #5a5e6c;')
            a.onclick = ()=>{
                document.getElementById("chatBox").style.display = "none"
                document.getElementById("chatBox"+friends[i].id.slice(10)).style.display = "block"
            }
            chatMenu.appendChild(a)
        }
    }
}

function updateRoomMemberList(roomMemberArray)
{
    document.getElementById('playerList').innerHTML = ""
    for(let i = 0; i < roomMemberArray.length; i++)
    {
        document.getElementById('playerList').innerHTML += '<li id="roomMemberList' + roomMemberArray[i] + '" class="list-group-item" style="background: #404040 !important;">' + roomMemberArray[i] + '</li>'
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
    showFriends([name])
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
    showFriends([name])
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

socket.on("welcomeUser", (name)=>{
    document.getElementById("welcomeUser").innerHTML = "welcome, " + name
    myName = name
})

socket.on("cameOnline", (name, id, myName)=>{
    document.getElementById("status"+name).style.color = "green"
    socket.emit("cameOnlineReply", id, myName)
})

socket.on("cameOnlineReply", (friendName)=>{
    document.getElementById("status"+friendName).style.color = "green"
})

socket.on("wentOffline", (friendName)=>{
    document.getElementById("status"+friendName).style.color = "gray"
})

socket.on("friendOffline", friendsName=>{

})

socket.on("message", (n, message, name)=>{
    document.getElementById("sendMessageButton"+name).click()
    displayMessage(n, message, name)
})

socket.on("invitedToRoom", ()=>{
    // document.getElementById('modal-title').innerHTML = "done"
    // document.getElementById('modal-body').innerHTML = "invitation sent"
    // $('#modal').modal('toggle');
    // let timeOut = setTimeout(() => {
    //     $('#modal').modal('toggle');
    // }, 3000);
    // $('#modal').on('hidden.bs.modal', function (e) {
    //     clearInterval(timeOut)
    // })
})

socket.on("inviteToRoomFailed", ()=>{
    document.getElementById('modal-title').innerHTML = "failed"
    document.getElementById('modal-body').innerHTML = "user is offline"
    $('#modal').modal('toggle');
    let timeOut = setTimeout(() => {
        $('#modal').modal('toggle');
    }, 3000);
    $('#modal').on('hidden.bs.modal', function (e) {
        clearInterval(timeOut)
    })
})

socket.on("invitationToRoom", (id, friendsName)=>{
    document.getElementById('modal-title').innerHTML = "cool"
    let modalBody = document.getElementById('modal-body')
    modalBody.innerHTML = friendsName +  " invited you to join his room !"
    let div = document.createElement('div')
    let button1 = document.createElement("button")
    button1.setAttribute("class", "btn btn-success text-white")
    button1.innerHTML = '<span><i class="fas fa-check"></i></span> Accept'
    button1.onclick = () => {
        $('#modal').modal('toggle');
        setTimeout(() => {
            socket.emit("acceptInvitationToRoom", id, myName, friendsName)
        }, 1000);
        document.getElementById('modal-cancel').style.display = "block"
    }
    let button2 = document.createElement("button")
    button2.setAttribute("class", "btn btn-danger text-white ml-3")
    button2.innerHTML = '<span><i class="fas fa-times"></i></span> Decline'
    button2.onclick = () => {
        $('#modal').modal('toggle');
        setTimeout(() => {
            socket.emit("rejectInvitationToRoom", id, myName)
        }, 1000);
        document.getElementById('modal-cancel').style.display = "block"
    }
    document.getElementById('modal-cancel').style.display = "none"
    div.appendChild(button1)
    div.appendChild(button2)
    modalBody.appendChild(div)
    $('#modal').modal('toggle');
    //button1.click()
})

socket.on("accepteInvitationToRoomFailed", ()=>{
    document.getElementById('modal-title').innerHTML = "lol"
    let modalBody = document.getElementById('modal-body')
    modalBody.innerHTML = "lol the noob couldnt remain in his own room xd (went offline)"
    $('#modal').modal('toggle');
    // let timeOut = setTimeout(() => {
    //     $('#modal').modal('toggle');
    // }, 3000);
    // $('#modal').on('hidden.bs.modal', function (e) {
    //     clearInterval(timeOut)
    // })
})

socket.on("acceptingInviteToRoom", (friendsName)=>{
    document.getElementById('modal-title').innerHTML = "wait"
    let text = "establishing a connection with " + friendsName
    document.getElementById("modal-body").innerHTML = '<div class="d-flex inline-flex"><div><p class="display-4 mr-4" style="font-size:medium; margin-bottom:0; margin-top:0.1rem">'+text+'</p></div><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>'
    $('#modal').modal('toggle');
})

socket.on("acceptedInviteToRoom", (friendsName)=>{
    $('#modal').modal('toggle');
    setTimeout(() => {
        document.getElementById('modal-title').innerHTML = "cool"
        document.getElementById('modal-body').innerHTML = friendsName + " joined your room !"
        $('#modal').modal('toggle');
        let timeOut = setTimeout(() => {
            $('#modal').modal('toggle');
        }, 2000);
        $('#modal').on('hidden.bs.modal', function (e) {
            clearInterval(timeOut)
        })
    }, 1000);
})

socket.on("acceptedInvitationToRoom", (_myHostId, hostName)=>{
    myHostId = _myHostId
    document.getElementById('welcomeUser').innerHTML = hostName + "'s room"
    document.getElementById('hostUI').style.display = "none"
        document.getElementById('modal-title').innerHTML = "connecting..." 
        let text = "connecting to "+ hostName + "'s room, please wait"
        document.getElementById("modal-body").innerHTML = '<div class="d-flex inline-flex"><div><p class="display-4 mr-4" style="font-size:medium; margin-bottom:0; margin-top:0.1rem">'+text+'</p></div><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>'
        $('#modal').modal('toggle');
})

socket.on("rejectInvitationToRoom", (friendsName)=>{
    document.getElementById('modal-title').innerHTML = "damn"
    document.getElementById('modal-body').innerHTML = friendsName + " rejected your room invitation :{ !"
    $('#modal').modal('toggle');
    let timeOut = setTimeout(() => {
        $('#modal').modal('toggle');
    }, 3000);
    $('#modal').on('hidden.bs.modal', function (e) {
        clearInterval(timeOut)
    })
})

socket.on("joinedRoom", (roomMemberArray)=>{
    updateRoomMemberList(roomMemberArray)
    //console.log(name + " joined the room")
})

socket.on("leftRoom", (roomMemberArray)=>{
    updateRoomMemberList(roomMemberArray)
    //console.log(name + " left the room")
})




//          ON LOADED STUFF


$('#friendsListCol').on('hide.bs.dropdown', function (e) {
    if (e.clickEvent) {
      e.preventDefault();
    }
})

let input = document.getElementsByClassName("messageInput")
for(let i = 0; i < input.length; i++)
{
    let friend = input[i].parentElement.parentElement.id.slice(6)
    input[i].addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            sendMessage(friend)
        }
      });
}




