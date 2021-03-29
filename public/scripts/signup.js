socket  = io.connect()



var listofInputs = new Array(4)
listofInputs = ["", "", "", ""];
var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;



function validateEmail() {
    listofInputs[0] = document.getElementById("input0").value
    if (listofInputs[0].match(mailformat)) {
        document.getElementById("input0").classList.remove("is-invalid");
        document.getElementById("input0").classList.add("is-valid");
        document.getElementById("invalid0").innerHTML = ""
    }
    else {
        document.getElementById("input0").classList.remove("is-valid");
        document.getElementById("input0").classList.add("is-invalid");
        document.getElementById("invalid0").innerHTML = "Please provide a valid email"
    }
}

function validatePassword()
{
    listofInputs[2] = document.getElementById("input2").value
    listofInputs[3] = document.getElementById("input3").value
    if(listofInputs[2] !== listofInputs[3])
    {
        document.getElementById("input2").classList.remove("is-valid");
        document.getElementById("input2").classList.add("is-invalid");
        document.getElementById("input3").classList.remove("is-valid");
        document.getElementById("input3").classList.add("is-invalid");
        document.getElementById("invalid3").innerHTML = "passwords do not match"
    }
    else if(listofInputs[2] != "")
    {
        document.getElementById("input2").classList.remove("is-invalid");
        document.getElementById("input2").classList.add("is-valid");
        document.getElementById("input3").classList.remove("is-invalid");
        document.getElementById("input3").classList.add("is-valid");
    }
}

function validateAll()
{
    let allGood = [false, false, false, false];
    for(var i = 0; i < listofInputs.length; i++)
    {
        listofInputs[i] = document.getElementById("input"+i).value
        if(listofInputs[i] == "")
        {
            document.getElementById("input"+i).classList.remove("is-valid")
            document.getElementById("input"+i).classList.add("is-invalid")
            document.getElementById("invalid"+i).innerHTML = "required"
            allGood[i] = false
        }
        else
        {
            document.getElementById("input"+i).classList.remove("is-invalid")
            document.getElementById("input"+i).classList.add("is-valid")
            document.getElementById("invalid"+i).innerHTML = ""
            allGood[i] = true
        }
        if(i == 0)
        {
            validateEmail();
        }
        if(i == 3)
        {
            validatePassword();
        }
    }
    for(let i in allGood)
    {
        if(!allGood[i])
        {
            return
        }
    }
    document.getElementById("modal-title").innerHTML = "wait";
    let text = "signing up, please wait"
    document.getElementById("modal-body").innerHTML = '<div class="d-flex inline-flex"><div><p class="display-4 mr-4" style="font-size:medium; margin-bottom:0; margin-top:0.1rem">'+text+'</p></div><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>'
    $('#modal').modal('toggle');
    socket.emit("newSignUp", listofInputs);
}








//          SOCKET STUFF




socket.on("signUpSuccess", ()=>{
    document.getElementById("modal-title").innerHTML = "Success";
    document.getElementById("modal-body").innerHTML = "Successfully Signed Up";
    let timeOut = setTimeout(() => {
        $('#modal').modal('toggle');
        location.href = 'login'
    }, 2000);
    $('#modal').on('hidden.bs.modal', function (e) {
        clearInterval(timeOut)
        location.href = 'login'
    })
})

socket.on("userAlreadyExists", (res)=>{
    document.getElementById("modal-title").innerHTML = "Failed";
    document.getElementById("modal-body").innerHTML = "Failed to Sign Up";
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
        document.getElementById("invalid0").innerHTML = "user with this email already exists"
    }
    else
    {
        document.getElementById("input1").classList.remove("is-valid");
        document.getElementById("input1").classList.add("is-invalid");
        document.getElementById("invalid1").innerHTML = "user with this username already exists"
    }
})




















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