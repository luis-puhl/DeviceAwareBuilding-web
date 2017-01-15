const net = require("net");

// Create a socket (client) that connects to the server
var socket = new net.Socket();
socket.connect(8000, "200.145.148.226", function () {
    console.log("Client: Connected to server");
});

// Let's handle the data we get from the server
socket.on("data", function (data) {
    data = JSON.parse(data);
    console.log("Response from server: %s", data.response);
    // Respond back
    socket.write(JSON.stringify({ response: "Hey there server!" }));
    // Close the connection
    // socket.end();
});
