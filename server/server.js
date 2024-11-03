const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const cors = require("cors");

// app.use(cors({
//     origin: "https://f0k6j112-5173.inc1.devtunnels.ms" // Replace with your frontend origin
// }));

const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:5173",
		// origin: "https://f0k6j112-5173.inc1.devtunnels.ms/",
		methods: [ "GET", "POST" ],
		credentials: true
	}
})


io.on("connection", (socket) => {
	socket.emit("me", socket.id)

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		console.log("call user: " + data)
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})
	
	socket.on("answerCall", (data) => {
		console.log("answer call user: " + data)
		io.to(data.to).emit("callAccepted", data.signal)
	})
})

server.listen(5000, () => console.log("server is running on port 5000"))
