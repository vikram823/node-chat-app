const path = require("path")
const express = require("express")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")

const {genrateMessage, genrateLocation} = require("./utils/messages")
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000 
const publicDirPath = path.join(__dirname, "../public")

app.use(express.static(publicDirPath))

io.on("connection", (socket)=>{

    socket.on("join", ({username, room}, callback)=>{
        
        const {error, user} = addUser({id: socket.id, username, room})
        
        if(error){
            callback(error)
        }

        socket.join(room)

        socket.emit("message", genrateMessage(user.username, "welcome!"))
        socket.broadcast.to(user.room).emit("message", genrateMessage(user.username, `${username} has joined!`))

        io.to(user.room).emit("roomData",{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on("sendMessage", (message, callback)=>{

            const user = getUser(socket.id)

            const filter = new Filter()

            if(filter.isProfane(message)){
                return callback("Profanity found")
            }

            io.to(user.room).emit("message", genrateMessage(user.username, message))
            callback()
    })
    
    socket.on("send-location", ({latitude, longitude}, callback)=>{

        const user = getUser(socket.id)

        io.to(user.room).emit("locationMessage", genrateLocation(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on("disconnect", ()=>{

        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit("message", genrateMessage(user.username, `${user.username} has left`))
            io.to(user.room).emit("roomData",{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
        
    })

})

server.listen(port, ()=>{
    console.log(`app running on port ${port}`)
})