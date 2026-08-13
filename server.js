const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/api/health") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        status: "ok",
        message: "Emogigs AI server is running."
      })
    );

    return;
  }

  // AI API
  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const message = data.message;

        if (!message) {
          res.writeHead(400, {
            "Content-Type": "application/json"
          });

          res.end(
            JSON.stringify({
              error: "Message is required."
            })
          );

          return;
        }

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(
          JSON.stringify({
            reply:
              "Your AI backend is connected. AI engine configuration is the next step."
          })
        );
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        res.end(
          JSON.stringify({
            error: "Invalid request."
          })
        );
      }
    });

    return;
  }

  // Serve index.html
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    const filePath = path.join(__dirname, "index.html");

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, {
          "Content-Type": "text/plain"
        });

        res.end("Could not load index.html.");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });

      res.end(data);
    });

    return;
  }

  // Not found
  res.writeHead(404, {
    "Content-Type": "application/json"
  });

  res.end(
    JSON.stringify({
      error: "Not found"
    })
  );
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Emogigs AI server running on port ${PORT}`);
});