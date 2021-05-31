const genrateMessage = (username, text)=>{
    return {
        username,
        text,
        "createdAt": new Date().getTime()
    }
}

const genrateLocation = (username, url)=>{
    
    return{
        username,
        url,
        "createAt": new Date().getTime()
    }
}

module.exports = {
    genrateMessage,
    genrateLocation
}