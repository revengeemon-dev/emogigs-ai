const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
console.log("CHAT REQUEST RECEIVED:", req.method, req.url);
  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", async () => {
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

        if (!OPENAI_API_KEY) {
          res.writeHead(500, {
            "Content-Type": "application/json"
          });

          res.end(
            JSON.stringify({
              error: "OPENAI_API_KEY is not configured."
            })
          );

          return;
        }

        const response = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-4.1-mini",
              input: message
            })
          }
        );

        const result = await response.json();

        if (!response.ok) {
          res.writeHead(response.status, {
            "Content-Type": "application/json"
          });

          res.end(
            JSON.stringify({
              error:
                result.error?.message ||
                "OpenAI API request failed."
            })
          );

          return;
        }

        const reply =
          result.output_text ||
          "I couldn't generate a response.";

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(
          JSON.stringify({
            reply
          })
        );
      } catch (error) {
        console.error(error);

        res.writeHead(500, {
          "Content-Type": "application/json"
        });

        res.end(
          JSON.stringify({
            error: "Server error."
          })
        );
      }
    });

    return;
  }

  // Serve index.html
  if (
    req.method === "GET" &&
    (req.url === "/" || req.url === "/index.html")
  ) {
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