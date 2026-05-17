function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    const clientId = socket.handshake.auth?.clientId;

    if(clientId){
      socket.join(clientId);
    }

    socket.emit("connected", { id: socket.id, clientId });
  });
}

module.exports = {
  registerSocketHandlers,
};
