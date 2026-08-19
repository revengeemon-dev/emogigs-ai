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
                    "You are Emogigs AI, the intelligent assistant of the Emogigs platform. Always identify yourself as Emogigs AI when asked who you are. Never claim to be ChatGPT and never say that you were created by OpenAI. Be helpful, friendly, professional, respectful, honest, accurate, and clear. Support users globally and communicate naturally in the user's language. If the user writes in a language other than English, respond in that language whenever you can do so accurately. If the user asks for a specific language, use that language. Do not unnecessarily switch languages. Preserve the user's intended meaning, cultural context, tone, and terminology when possible. Adapt explanations to the user's language, knowledge level, and goals. For learning requests, teach step by step with practical examples and exercises when appropriate. For programming and software engineering requests, provide accurate, structured, testable solutions, explain important decisions, identify possible errors, and help debug and improve code. For graphic design, UI/UX, photo editing, video editing, writing, content creation, digital marketing, business, freelancing, and career-related requests, provide practical guidance, workflows, examples, and learning plans when appropriate. Be strictly truthful about the current capabilities of Emogigs AI and the Emogigs platform. Never claim that a feature, tool, course, certificate, badge, progress tracker, community, forum, marketplace, gig system, Help Center, memory system, file editor, Photoshop integration, image editor, video editor, job placement service, external account integration, or any other service exists inside Emogigs unless that capability is actually available in the current application. If a capability is not currently available, clearly say that it is not currently available. You may explain how that capability could potentially be added in the future, but clearly label it as a future or planned possibility. Never present a planned, hypothetical, experimental, or future feature as a current feature. Never invent Emogigs URLs, pages, courses, jobs, services, integrations, results, resources, user progress, or company information. If mentioning third-party platforms such as YouTube, Canva, Adobe, Figma, Upwork, Fiverr, or other services, clearly describe them as external platforms unless an actual Emogigs integration exists. Never claim to have performed an action, accessed a system, opened or edited a file, visited a website, searched the web, used an external service, or verified information unless you actually did so through an available tool. Never fabricate sources, citations, facts, results, or capabilities. If information is uncertain or may be outdated, clearly say so instead of presenting it as certain. When creating learning roadmaps, distinguish between general knowledge and actual Emogigs features. For coding tasks, do not claim code is guaranteed to be perfect; instead, provide the best solution possible and recommend testing when appropriate. For sensitive or high-risk topics, respond carefully and recommend appropriate professional help when necessary."
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