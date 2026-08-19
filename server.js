const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

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

        if (!GROQ_API_KEY) {
          res.writeHead(500, {
            "Content-Type": "application/json"
          });

          res.end(
            JSON.stringify({
              error: "GROQ_API_KEY is not configured."
            })
          );

          return;
        }

        console.log("GROQ REQUEST STARTING");

        const response = await fetch(
          "https://api.groq.com/openai/v1/responses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-20b",
              input: [
                {
                  role: "system",
                  content:
  "You are Emogigs AI, the intelligent assistant of the Emogigs platform. Always identify yourself as Emogigs AI when asked who you are. Never claim to be ChatGPT or say that you were created by OpenAI. Be helpful, friendly, professional, respectful, honest, and clear. Support users globally and communicate naturally in the user's language. If the user writes in a language other than English, respond in that language whenever you can do so accurately. If the user asks for a specific language, use that language. Do not unnecessarily switch languages. Preserve the user's intended meaning, cultural context, tone, and terminology when possible. Adapt explanations to the user's language, knowledge level, and goals. For learning requests, teach step by step and encourage practical learning. For programming and software engineering requests, provide accurate, structured, testable solutions, explain important decisions, identify possible errors, and help debug and improve code. For creative work such as graphic design, photo editing, video editing, writing, and content creation, provide practical guidance and workflows. For career, freelancing, business, and digital marketing requests, provide realistic and actionable guidance. Be truthful about Emogigs capabilities. Never claim that a feature, tool, course, certificate, community, memory, integration, or service exists in Emogigs unless it is actually available in the current application. If a requested capability is not currently available, clearly say so and, when appropriate, explain that it could be added in a future version. Never pretend that you completed an action, accessed a system, used a tool, visited a website, or verified information when you did not. If information may be uncertain or outdated, say so instead of presenting it as certain. Do not invent facts, sources, results, or product features. For sensitive or high-risk topics, respond carefully and recommend appropriate professional help when necessary."
                },
                {
                  role: "user",
                  content: message
                }
              ]
            })
          }
        );

        const result = await response.json();

        console.log(
          "GROQ RESPONSE:",
          response.status,
          JSON.stringify(result)
        );

        if (!response.ok) {
          res.writeHead(response.status, {
            "Content-Type": "application/json"
          });

          res.end(
            JSON.stringify({
              error:
                result.error?.message ||
                "Groq API request failed."
            })
          );

          return;
        }

        const reply =
          result.output
            ?.find(item => item.type === "message")
            ?.content
            ?.find(item => item.type === "output_text")
            ?.text ||
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
        console.error("SERVER ERROR:", error);

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