const socket = io()

const $messageForm = document.getElementById("message-form")
const $inputForm = $messageForm.querySelector("input")
const $inputFormButton = $messageForm.querySelector("button")
const $shareLocationButton = document.getElementById("send-location")
const $messages = document.getElementById("messages")

const messageTemp = document.getElementById("message-template").innerHTML
const locationTemp = document.getElementById("location-message-template").innerHTML
const sidebarTemp = document.getElementById("sidebar-template").innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})



socket.on("roomData", ({room, users})=>{
    const html = Mustache.render(sidebarTemp, {
        room,
        users
    })

    document.getElementById("sidebar").innerHTML = html
})

socket.on("locationMessage", (message)=>{

    const html = Mustache.render(locationTemp,{
        "username": message.username,
        "locationURL": message.url,
        "createdAt": moment(message.createdAt).format("h:mm a")
    })

    $messages.insertAdjacentHTML("beforeend", html)
})

socket.on("message", (message)=>{
    console.log("messgae is",message.text)

    const html = Mustache.render(messageTemp,{
        "username": message.username,
        "message": message.text,
        "createdAt": moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
})


$messageForm.addEventListener("submit", (e)=>{
    $inputFormButton.setAttribute("disabled", "disabled")
    e.preventDefault()
    const message = e.target.elements.message.value

    socket.emit("sendMessage", message, (error)=>{
        $inputFormButton.removeAttribute("disabled")
        $inputForm.value = ""
        $inputForm.focus()
        if(error){
            return console.log(error)
        }
        console.log("message delivered")
    })
})

$shareLocationButton.addEventListener("click", ()=>{
    
    $shareLocationButton.setAttribute("disabled", "disabled")

    if(!navigator.geolocation){
        return alert("location not shared!")
    }

    navigator.geolocation.getCurrentPosition((pos)=>{
        socket.emit("send-location",{ "latitude": pos.coords.latitude, "longitude": pos.coords.longitude},()=>{
            
            $shareLocationButton.removeAttribute("disabled")
            console.log("location shared")
        })
    })
})

socket.emit("join", {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = "/"
    }
})