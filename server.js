const PORT = process.env.PORT || 3000;

const io = require("socket.io")(PORT, {
  cors: { origin: "*" }
});

const queue = [];
const pairs = new Map();

io.on("connection", socket => {

  socket.on("search", () => {
    if (pairs.has(socket.id) || queue.includes(socket.id)) return;

    if (queue.length > 0) {
      const partnerId = queue.shift();

      if (!io.sockets.sockets.get(partnerId)) {
        socket.emit("search");
        return;
      }

      pairs.set(socket.id, partnerId);
      pairs.set(partnerId, socket.id);

      socket.emit("matched");
      io.to(partnerId).emit("matched");
    } else {
      queue.push(socket.id);
    }
  });

  socket.on("message", msg => {
    const partnerId = pairs.get(socket.id);
    if (partnerId) io.to(partnerId).emit("message", msg);
  });

  socket.on("disconnect", () => {
    const partnerId = pairs.get(socket.id);

    if (partnerId) {
      io.to(partnerId).emit("disconnect_chat");
      pairs.delete(partnerId);
    }

    pairs.delete(socket.id);

    const i = queue.indexOf(socket.id);
    if (i !== -1) queue.splice(i, 1);
  });

});
