const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

/* ✅ سيرفر HTTP بسيط (مهم لـ Render) */
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket.IO server running");
});

/* ✅ إعداد Socket.IO مع CORS */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["polling"] // مهم جدًا لـ Render
});

const queue = [];
const pairs = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* 🔍 البحث عن شريك */
  socket.on("search", () => {
    if (pairs.has(socket.id) || queue.includes(socket.id)) return;

    if (queue.length > 0) {
      const partnerId = queue.shift();
      const partnerSocket = io.sockets.sockets.get(partnerId);

      if (!partnerSocket) {
        queue.push(socket.id);
        return;
      }

      pairs.set(socket.id, partnerId);
      pairs.set(partnerId, socket.id);

      socket.emit("matched");
      partnerSocket.emit("matched");
    } else {
      queue.push(socket.id);
    }
  });

  /* 📩 إرسال رسالة */
  socket.on("message", (msg) => {
    const partnerId = pairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("message", msg);
    }
  });

  /* ❌ قطع الاتصال */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    const partnerId = pairs.get(socket.id);

    if (partnerId) {
      io.to(partnerId).emit("disconnect_chat");
      pairs.delete(partnerId);
    }

    pairs.delete(socket.id);

    const index = queue.indexOf(socket.id);
    if (index !== -1) queue.splice(index, 1);
  });
});

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
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

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
