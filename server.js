const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/*
=========================================================
EMOGIGS AI — INTELLIGENCE CORE
STEP 18A
=========================================================

Architecture:

User Message
     ↓
Input Validation
     ↓
Intelligence Analysis
     ├── Intent
     ├── Emotion Signal
     ├── Goal
     ├── Language
     └── Response Style
     ↓
Dynamic AI System Instructions
     ↓
Groq
     ↓
Emogigs AI Response
=========================================================
*/


// =======================================================
// SECURITY / HTTP HELPERS
// =======================================================

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });

  res.end(JSON.stringify(data));
}


// =======================================================
// BASIC TEXT ANALYSIS
// =======================================================

function detectLanguage(text) {
  if (/[\u0980-\u09FF]/.test(text)) {
    return "Bengali";
  }

  if (/[\u0600-\u06FF]/.test(text)) {
    return "Arabic-script language";
  }

  if (/[\u4E00-\u9FFF]/.test(text)) {
    return "Chinese";
  }

  if (/[\u3040-\u30FF]/.test(text)) {
    return "Japanese";
  }

  if (/[\uAC00-\uD7AF]/.test(text)) {
    return "Korean";
  }

  return "English or Latin-script language";
}


function detectEmotion(text) {
  const value = text.toLowerCase();

  const frustrationWords = [
    "frustrated",
    "angry",
    "annoyed",
    "irritated",
    "hate",
    "problem",
    "error",
    "broken",
    "কাজ করছে না",
    "সমস্যা",
    "রাগ",
    "বিরক্ত",
    "ঝামেলা",
    "ভুল"
  ];

  const sadnessWords = [
    "sad",
    "depressed",
    "lonely",
    "hurt",
    "cry",
    "hopeless",
    "দুঃখ",
    "কষ্ট",
    "একা",
    "হতাশ",
    "কাঁদতে"
  ];

  const excitementWords = [
    "excited",
    "amazing",
    "awesome",
    "great",
    "wow",
    "love",
    "perfect",
    "দারুণ",
    "অসাধারণ",
    "সুন্দর",
    "খুশি",
    "ভালো লাগছে"
  ];

  const confusionWords = [
    "confused",
    "don't understand",
    "what should i do",
    "how",
    "why",
    "বুঝতে পারছি না",
    "কি করব",
    "কিভাবে",
    "কেন"
  ];

  if (frustrationWords.some(word => value.includes(word))) {
    return "frustrated";
  }

  if (sadnessWords.some(word => value.includes(word))) {
    return "sad";
  }

  if (excitementWords.some(word => value.includes(word))) {
    return "excited";
  }

  if (confusionWords.some(word => value.includes(word))) {
    return "confused";
  }

  return "neutral";
}


function detectIntent(text) {
  const value = text.toLowerCase();

  if (
    value.includes("code") ||
    value.includes("javascript") ||
    value.includes("html") ||
    value.includes("css") ||
    value.includes("server") ||
    value.includes("api") ||
    value.includes("program")
  ) {
    return "programming";
  }

  if (
    value.includes("learn") ||
    value.includes("study") ||
    value.includes("শিখতে") ||
    value.includes("শেখা") ||
    value.includes("পড়াশোনা")
  ) {
    return "learning";
  }

  if (
    value.includes("job") ||
    value.includes("career") ||
    value.includes("work") ||
    value.includes("freelance") ||
    value.includes("চাকরি") ||
    value.includes("কাজ") ||
    value.includes("ফ্রিল্যান্স")
  ) {
    return "career";
  }

  if (
    value.includes("plan") ||
    value.includes("goal") ||
    value.includes("routine") ||
    value.includes("পরিকল্পনা") ||
    value.includes("লক্ষ্য") ||
    value.includes("রুটিন")
  ) {
    return "planning";
  }

  if (
    value.includes("design") ||
    value.includes("ui") ||
    value.includes("ux") ||
    value.includes("app") ||
    value.includes("website") ||
    value.includes("ডিজাইন") ||
    value.includes("অ্যাপ")
  ) {
    return "creative-design";
  }

  if (
    value.includes("business") ||
    value.includes("money") ||
    value.includes("income") ||
    value.includes("ব্যবসা") ||
    value.includes("টাকা") ||
    value.includes("আয়")
  ) {
    return "business-finance";
  }

  return "general";
}


function detectGoal(text) {
  const value = text.toLowerCase();

  if (
    value.includes("build") ||
    value.includes("create") ||
    value.includes("make") ||
    value.includes("বানাতে") ||
    value.includes("তৈরি")
  ) {
    return "create or build something";
  }

  if (
    value.includes("learn") ||
    value.includes("শিখতে") ||
    value.includes("শিখব")
  ) {
    return "learn or improve a skill";
  }

  if (
    value.includes("fix") ||
    value.includes("error") ||
    value.includes("problem") ||
    value.includes("ঠিক") ||
    value.includes("সমস্যা")
  ) {
    return "solve a problem";
  }

  if (
    value.includes("job") ||
    value.includes("income") ||
    value.includes("earn") ||
    value.includes("চাকরি") ||
    value.includes("আয়")
  ) {
    return "improve work or income";
  }

  return "understand the user's request and provide useful next steps";
}


// =======================================================
// EMOGIGS INTELLIGENCE ANALYSIS
// =======================================================

function analyzeUserMessage(message) {
  const language = detectLanguage(message);
  const emotion = detectEmotion(message);
  const intent = detectIntent(message);
  const goal = detectGoal(message);

  let responseStyle =
    "clear, natural, helpful and professional";

  if (emotion === "frustrated") {
    responseStyle =
      "calm, patient, reassuring and solution-focused";
  }

  if (emotion === "sad") {
    responseStyle =
      "warm, empathetic, respectful and supportive";
  }

  if (emotion === "excited") {
    responseStyle =
      "positive, energetic, encouraging and constructive";
  }

  if (emotion === "confused") {
    responseStyle =
      "simple, patient, structured and step-by-step";
  }

  return {
    language,
    emotion,
    intent,
    goal,
    responseStyle
  };
}


// =======================================================
// DYNAMIC EMOGIGS AI SYSTEM PROMPT
// =======================================================

function buildSystemPrompt(intelligence) {
  return `
You are Emogigs AI, the intelligent assistant of the Emogigs platform.

IDENTITY
- Your name is Emogigs AI.
- If asked who you are, identify yourself as Emogigs AI.
- Never claim to be ChatGPT.
- Never claim that you were created by OpenAI.
- Never invent information about Emogigs.

CORE PERSONALITY
You are intelligent, calm, friendly, respectful, practical and emotionally aware.

You should communicate naturally rather than sounding robotic.

EMOTIONAL AWARENESS
The system has detected an approximate emotional signal from the user's message.

Detected emotion:
${intelligence.emotion}

IMPORTANT:
This is only an inference from the user's words.
Do not tell the user that you have diagnosed their emotion.
Do not pretend to read their mind.
Use the signal only to adjust your communication style.

For example:
- If the user appears frustrated, remain calm and focus on solving the problem.
- If the user appears confused, explain things simply and step by step.
- If the user appears sad or emotionally hurt, respond with empathy and avoid cold robotic language.
- If the user appears excited, encourage the positive energy while remaining realistic.

USER LANGUAGE
Detected language:
${intelligence.language}

Always respond naturally in the user's language whenever possible.

USER INTENT
Detected intent:
${intelligence.intent}

USER GOAL
Detected goal:
${intelligence.goal}

Use these signals to make the answer more relevant.

RESPONSE STYLE
Preferred response style:
${intelligence.responseStyle}

GENERAL INTELLIGENCE RULES
1. Understand the user's actual question before answering.
2. Do not answer a different question just because it is related.
3. If the request is ambiguous, ask a short clarifying question when necessary.
4. Prefer useful actions and practical next steps.
5. Avoid unnecessary repetition.
6. Match the user's knowledge level.
7. For complex problems, break the solution into manageable steps.
8. If the user is building something, protect their existing work and explain exactly what should be changed.
9. Never say that code is guaranteed to be perfect.
10. Never invent facts, sources, tools, capabilities or results.

EMOGIGS FEATURE TRUTH
Only describe a feature as currently available if it actually exists in the current Emogigs application.

Do NOT claim that Emogigs currently has:
- permanent cloud memory
- user accounts
- file editing
- web search
- image generation
- video generation
- Photoshop integration
- Canva integration
- job placement
- marketplace
- community
- certificates
- badges
- courses
- progress tracking
- external account integrations
- voice features
- any other feature that has not actually been implemented.

If a feature is not currently implemented:
say clearly that it is not currently available,
then explain how it could be added in a future version if useful.

PROGRAMMING
For programming requests:
- provide structured solutions
- identify likely causes of errors
- preserve working code whenever possible
- explain exactly which file should change
- recommend testing after changes

LEARNING
For learning requests:
- teach step by step
- use simple examples
- create practical exercises when useful

CREATIVE WORK
For design, writing, UI/UX, business, content creation and creative tasks:
- provide practical ideas
- prioritize usability
- think about real users
- suggest improvements when they genuinely help

SAFETY AND HONESTY
Never fabricate medical, financial, legal or technical certainty.
For high-risk matters, encourage appropriate professional assistance.

Never claim to have opened a website, accessed a file, used a tool, searched the web or completed an external action unless that actually happened.

The objective is not to sound artificially human.
The objective is to be genuinely useful, emotionally considerate, accurate and honest.
`;
}


// =======================================================
// SERVER
// =======================================================

const server = http.createServer((req, res) => {

  setSecurityHeaders(res);

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );


  // =====================================================
  // OPTIONS
  // =====================================================

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }


  // =====================================================
  // HEALTH CHECK
  // =====================================================

  if (
    req.method === "GET" &&
    req.url === "/api/health"
  ) {
    sendJSON(res, 200, {
      status: "ok",
      message: "Emogigs AI server is running.",
      intelligenceCore: "18A"
    });

    return;
  }


  // =====================================================
  // AI CHAT API
  // =====================================================

  console.log(
    "REQUEST:",
    req.method,
    req.url
  );


  if (
    req.method === "POST" &&
    req.url === "/api/chat"
  ) {

    let body = "";

    let bodyTooLarge = false;

    req.on("data", chunk => {

      body += chunk.toString();

      /*
       Limit incoming request body to approximately
       32 KB to prevent unnecessarily large requests.
      */

      if (Buffer.byteLength(body, "utf8") > 32 * 1024) {
        bodyTooLarge = true;
      }
    });


    req.on("end", async () => {

      try {

        if (bodyTooLarge) {

          sendJSON(res, 413, {
            error: "Request is too large."
          });

          return;
        }


        // =================================================
        // PARSE REQUEST
        // =================================================

        let data;

        try {
          data = JSON.parse(body);
        } catch (parseError) {

          sendJSON(res, 400, {
            error: "Invalid JSON request."
          });

          return;
        }


        const message =
          typeof data.message === "string"
            ? data.message.trim()
            : "";


        if (!message) {

          sendJSON(res, 400, {
            error: "Message is required."
          });

          return;
        }


        // =================================================
        // MESSAGE LENGTH PROTECTION
        // =================================================

        if (message.length > 12000) {

          sendJSON(res, 413, {
            error:
              "Message is too long. Please shorten your message."
          });

          return;
        }


        // =================================================
        // API KEY CHECK
        // =================================================

        if (!GROQ_API_KEY) {

          console.error(
            "GROQ_API_KEY is missing."
          );

          sendJSON(res, 500, {
            error:
              "GROQ_API_KEY is not configured."
          });

          return;
        }


        // =================================================
        // INTELLIGENCE ANALYSIS
        // =================================================

        const intelligence =
          analyzeUserMessage(message);


        console.log(
          "EMOGIGS INTELLIGENCE:",
          JSON.stringify(intelligence)
        );


        // =================================================
        // BUILD INTELLIGENT SYSTEM PROMPT
        // =================================================

        const systemPrompt =
          buildSystemPrompt(intelligence);


        // =================================================
        // GROQ REQUEST
        // =================================================

        console.log(
          "GROQ REQUEST STARTING"
        );


        const groqResponse = await fetch(
          "https://api.groq.com/openai/v1/responses",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "Authorization":
                `Bearer ${GROQ_API_KEY}`
            },

            body: JSON.stringify({

              model:
                "openai/gpt-oss-20b",

              input: [

                {
                  role: "system",

                  content: systemPrompt
                },

                {
                  role: "user",

                  content: message
                }

              ]

            })
          }
        );


        // =================================================
        // GROQ RESPONSE
        // =================================================

        const result =
          await groqResponse.json();


        console.log(
          "GROQ RESPONSE:",
          groqResponse.status
        );


        if (!groqResponse.ok) {

          console.error(
            "GROQ ERROR:",
            JSON.stringify(result)
          );

          sendJSON(
            res,
            groqResponse.status,
            {
              error:
                result.error?.message ||
                "Groq API request failed."
            }
          );

          return;
        }


        // =================================================
        // EXTRACT AI TEXT
        // =================================================

        const reply =
          result.output
            ?.find(
              item =>
                item.type === "message"
            )
            ?.content
            ?.find(
              item =>
                item.type === "output_text"
            )
            ?.text ||
          "I couldn't generate a response.";


        // =================================================
        // RETURN RESPONSE
        // =================================================

        sendJSON(res, 200, {

          reply: reply,

          /*
          This metadata is useful for debugging
          the Intelligence Core.

          The frontend does not need to display it.
          */

          intelligence: {
            intent:
              intelligence.intent,

            emotion:
              intelligence.emotion,

            goal:
              intelligence.goal,

            language:
              intelligence.language
          }

        });

      } catch (error) {

        console.error(
          "SERVER ERROR:",
          error
        );

        sendJSON(res, 500, {
          error:
            "Server error."
        });
      }

    });

    return;
  }


  // =====================================================
  // SERVE INDEX.HTML
  // =====================================================

  if (
    (req.method === "GET" ||
      req.method === "HEAD") &&
    (
      req.url === "/" ||
      req.url === "/index.html"
    )
  ) {

    const filePath =
      path.join(
        __dirname,
        "index.html"
      );


    fs.readFile(
      filePath,
      (err, data) => {

        if (err) {

          console.error(
            "INDEX ERROR:",
            err
          );

          res.writeHead(500, {
            "Content-Type":
              "text/plain; charset=utf-8"
          });

          res.end(
            "Could not load index.html."
          );

          return;
        }


        res.writeHead(200, {
          "Content-Type":
            "text/html; charset=utf-8"
        });

        res.end(data);
      }
    );

    return;
  }


  // =====================================================
  // SERVE SCRIPT.JS
  // =====================================================

  if (
    (req.method === "GET" ||
      req.method === "HEAD") &&
    req.url === "/script.js"
  ) {

    const filePath =
      path.join(
        __dirname,
        "script.js"
      );


    fs.readFile(
      filePath,
      (err, data) => {

        if (err) {

          console.error(
            "SCRIPT.JS ERROR:",
            err
          );

          res.writeHead(404, {
            "Content-Type":
              "text/plain; charset=utf-8"
          });

          res.end(
            "script.js not found."
          );

          return;
        }


        res.writeHead(200, {

          "Content-Type":
            "application/javascript; charset=utf-8",

          "Cache-Control":
            "no-cache"

        });

        res.end(data);
      }
    );

    return;
  }


  // =====================================================
  // NOT FOUND
  // =====================================================

  sendJSON(res, 404, {
    error: "Not found"
  });

});


// =======================================================
// START SERVER
// =======================================================

server.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Emogigs AI server running on port ${PORT}`
    );

    console.log(
      "Emogigs Intelligence Core: Step 18A"
    );

  }
);