const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const MODEL = "openai/gpt-oss-20b";
const GROQ_URL = "https://api.groq.com/openai/v1/responses";

const MAX_BODY_SIZE = 64 * 1024;
const MAX_MESSAGE_LENGTH = 16000;
const MAX_HISTORY_MESSAGES = 20;


/*
=========================================================
                    EMOGIGS AI
               INTELLIGENCE CORE
                  STEP 19A
=========================================================

Architecture:

User
 ↓
Request Validation
 ↓
Message Analysis
 ↓
Intent Detection
 ↓
Emotion Signal
 ↓
Goal Detection
 ↓
Language Detection
 ↓
Conversation Memory
 ↓
Dynamic Intelligence Prompt
 ↓
Reasoning Model
 ↓
Groq Responses API
 ↓
Reliable Response Extraction
 ↓
Emogigs AI
=========================================================
*/


// =======================================================
// SECURITY / HTTP
// =======================================================

function setSecurityHeaders(res) {

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "X-Frame-Options",
    "SAMEORIGIN"
  );

  res.setHeader(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  /*
    Microphone intentionally remains disabled here
    because voice development is paused for now.
  */

  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
}


function sendJSON(res, statusCode, data) {

  res.writeHead(statusCode, {
    "Content-Type":
      "application/json; charset=utf-8"
  });

  res.end(
    JSON.stringify(data)
  );
}


// =======================================================
// TEXT HELPERS
// =======================================================

function safeText(value) {

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}


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


// =======================================================
// EMOTION DETECTION
// =======================================================

function detectEmotion(text) {

  const value =
    text.toLowerCase();

  const frustrationWords = [
    "frustrated",
    "angry",
    "annoyed",
    "irritated",
    "hate",
    "problem",
    "error",
    "broken",
    "failed",
    "not working",

    "সমস্যা",
    "কাজ করছে না",
    "কাজ হচ্ছে না",
    "রাগ",
    "বিরক্ত",
    "ঝামেলা",
    "ভুল",
    "হচ্ছে না",
    "পারছি না"
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
    "কাঁদতে",
    "মন খারাপ"
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
    "কেন",
    "বুঝি না"
  ];


  if (
    frustrationWords.some(
      word => value.includes(word)
    )
  ) {
    return "frustrated";
  }


  if (
    sadnessWords.some(
      word => value.includes(word)
    )
  ) {
    return "sad";
  }


  if (
    excitementWords.some(
      word => value.includes(word)
    )
  ) {
    return "excited";
  }


  if (
    confusionWords.some(
      word => value.includes(word)
    )
  ) {
    return "confused";
  }


  return "neutral";
}


// =======================================================
// INTENT DETECTION
// =======================================================

function detectIntent(text) {

  const value =
    text.toLowerCase();


  if (
    value.includes("code") ||
    value.includes("coding") ||
    value.includes("javascript") ||
    value.includes("typescript") ||
    value.includes("html") ||
    value.includes("css") ||
    value.includes("node") ||
    value.includes("server") ||
    value.includes("api") ||
    value.includes("python") ||
    value.includes("java") ||
    value.includes("program") ||
    value.includes("bug") ||
    value.includes("debug") ||
    value.includes("error") ||

    value.includes("কোড") ||
    value.includes("কোডিং") ||
    value.includes("এরর") ||
    value.includes("বাগ") ||
    value.includes("প্রোগ্রাম")
  ) {

    return "programming";
  }


  if (
    value.includes("learn") ||
    value.includes("study") ||
    value.includes("education") ||

    value.includes("শিখতে") ||
    value.includes("শেখা") ||
    value.includes("পড়াশোনা") ||
    value.includes("শিক্ষা")
  ) {

    return "learning";
  }


  if (
    value.includes("job") ||
    value.includes("career") ||
    value.includes("work") ||
    value.includes("freelance") ||

    value.includes("চাকরি") ||
    value.includes("ক্যারিয়ার") ||
    value.includes("ফ্রিল্যান্স") ||
    value.includes("কাজ")
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
    value.includes("অ্যাপ") ||
    value.includes("ওয়েবসাইট")
  ) {

    return "creative-design";
  }


  if (
    value.includes("business") ||
    value.includes("money") ||
    value.includes("income") ||
    value.includes("investment") ||

    value.includes("ব্যবসা") ||
    value.includes("টাকা") ||
    value.includes("আয়") ||
    value.includes("ইনভেস্ট")
  ) {

    return "business-finance";
  }


  if (
    value.includes("photo") ||
    value.includes("image") ||
    value.includes("picture") ||
    value.includes("video") ||
    value.includes("edit") ||

    value.includes("ছবি") ||
    value.includes("ফটো") ||
    value.includes("ভিডিও") ||
    value.includes("এডিট")
  ) {

    return "media-creative";
  }


  return "general";
}


// =======================================================
// GOAL DETECTION
// =======================================================

function detectGoal(text) {

  const value =
    text.toLowerCase();


  if (
    value.includes("build") ||
    value.includes("create") ||
    value.includes("make") ||
    value.includes("develop") ||

    value.includes("বানাতে") ||
    value.includes("তৈরি") ||
    value.includes("ডেভেলপ")
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
    value.includes("bug") ||

    value.includes("ঠিক") ||
    value.includes("সমস্যা") ||
    value.includes("ভুল")
  ) {

    return "solve a problem";
  }


  if (
    value.includes("job") ||
    value.includes("income") ||
    value.includes("earn") ||

    value.includes("চাকরি") ||
    value.includes("আয়") ||
    value.includes("উপার্জন")
  ) {

    return "improve work or income";
  }


  return "understand the request and provide the most useful next step";
}


// =======================================================
// INTELLIGENCE ANALYSIS
// =======================================================

function analyzeUserMessage(message) {

  const language =
    detectLanguage(message);

  const emotion =
    detectEmotion(message);

  const intent =
    detectIntent(message);

  const goal =
    detectGoal(message);


  let responseStyle =
    "clear, natural, accurate, helpful and professional";


  if (emotion === "frustrated") {

    responseStyle =
      "calm, patient, reassuring, direct and solution-focused";
  }


  if (emotion === "sad") {

    responseStyle =
      "warm, empathetic, respectful and supportive";
  }


  if (emotion === "excited") {

    responseStyle =
      "positive, energetic, creative and encouraging while remaining realistic";
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
// DYNAMIC SYSTEM PROMPT
// =======================================================

function buildSystemPrompt(intelligence) {

  return `
You are Emogigs AI.

You are the intelligent assistant inside the Emogigs platform.

=========================================================
IDENTITY
=========================================================

Your name is Emogigs AI.

If the user asks who you are:
say that you are Emogigs AI.

Never claim to be ChatGPT.

Never claim that you were created by OpenAI.

Never invent facts about the Emogigs project.

=========================================================
CORE MISSION
=========================================================

Your mission is to be genuinely useful.

You should:

- understand the user's real goal
- reason carefully
- solve problems
- explain difficult things simply
- help users learn
- help users build projects
- help users debug code
- help users make decisions
- provide practical next steps
- adapt to the user's language and skill level

Do not try to sound artificially human.

Be useful, accurate and honest.

=========================================================
INTELLIGENCE SIGNALS
=========================================================

Detected language:
${intelligence.language}

Detected intent:
${intelligence.intent}

Detected emotional signal:
${intelligence.emotion}

Detected goal:
${intelligence.goal}

Preferred response style:
${intelligence.responseStyle}

These are approximate signals.

Never tell the user that you diagnosed their emotions.

Never pretend to read their mind.

Use these signals only to improve communication.

=========================================================
REASONING
=========================================================

For difficult questions:

1. Understand the actual problem.
2. Identify important constraints.
3. Break the problem into logical parts.
4. Check assumptions.
5. Compare possible solutions.
6. Choose the most practical solution.
7. Explain the result clearly.
8. When useful, provide exact implementation steps.

Do not expose private chain-of-thought or hidden reasoning.

Instead, provide concise explanations, conclusions and useful reasoning summaries.

=========================================================
PROGRAMMING / CODING
=========================================================

Programming is a high-priority capability.

When solving coding problems:

- identify the likely root cause
- inspect the provided code carefully
- preserve working code
- avoid unnecessary rewrites
- provide complete replacement files when requested
- clearly identify the filename
- explain exactly what changed
- consider browser compatibility
- consider mobile compatibility
- consider security
- consider API failures
- consider edge cases
- consider malformed input
- consider asynchronous errors
- consider state management
- test logically before presenting code

Never claim:

"zero bugs guaranteed"

or

"100% perfect"

because software always requires testing.

If something cannot be guaranteed, say so honestly.

=========================================================
EMOGIGS DEVELOPMENT MODE
=========================================================

When the user is working on Emogigs:

Protect the existing project.

Do not randomly replace working architecture.

Prefer incremental upgrades.

Before recommending a major architectural change, explain why it is necessary.

If the user asks for a complete file:

provide the complete file.

Do not provide only fragments unless specifically requested.

=========================================================
CONVERSATION
=========================================================

The current request may contain context from previous messages.

Use the supplied conversation history when it is relevant.

Do not pretend to remember information that was not supplied.

Do not invent user preferences.

=========================================================
FEATURE TRUTH
=========================================================

Only describe a feature as currently available if it has actually been implemented in Emogigs.

Do NOT claim that Emogigs currently has:

- permanent cloud memory
- user accounts
- file editing
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
- web browsing

unless that feature is actually implemented.

If a feature is planned but not implemented:

say:

"That feature is not implemented yet."

Then, if useful, explain how it can be added.

=========================================================
CREATIVE INTELLIGENCE
=========================================================

For creative tasks:

Think beyond generic answers.

Consider:

- user experience
- simplicity
- originality
- usefulness
- scalability
- accessibility
- mobile-first design
- real-world practicality

Suggest better alternatives when they genuinely improve the result.

=========================================================
LANGUAGE
=========================================================

Respond in the user's language whenever possible.

If the user writes Bengali:

respond naturally in Bengali.

If the user mixes Bengali and English:

understand the mixed language naturally.

Do not unnecessarily translate technical terms.

=========================================================
HONESTY
=========================================================

Never fabricate:

- facts
- sources
- API results
- tool usage
- website access
- file access
- external actions
- test results

Never claim that something was executed unless it actually was.

=========================================================
SAFETY
=========================================================

For medical, legal, financial or other high-risk subjects:

avoid false certainty.

Provide general information and recommend appropriate professional help when necessary.

=========================================================
FINAL RESPONSE QUALITY
=========================================================

Before answering, internally check:

- Did I answer the actual question?
- Did I understand the user's goal?
- Did I miss an important constraint?
- Is my answer practical?
- Is the code syntactically coherent?
- Did I avoid inventing capabilities?
- Is the explanation appropriate for the user's skill level?

Then provide the best useful answer.

`;
}


// =======================================================
// HISTORY NORMALIZATION
// =======================================================

function normalizeHistory(history) {

  if (!Array.isArray(history)) {
    return [];
  }


  return history
    .filter(item => {

      return (
        item &&
        (
          item.role === "user" ||
          item.role === "assistant"
        ) &&
        typeof item.content === "string"
      );

    })
    .slice(-MAX_HISTORY_MESSAGES)
    .map(item => {

      return {
        role: item.role,
        content: item.content.slice(0, 12000)
      };

    });
}


// =======================================================
// RESPONSE TEXT EXTRACTION
// =======================================================

function extractGroqText(result) {

  if (!result) {
    return "";
  }


  /*
    Preferred Responses API property.
  */

  if (
    typeof result.output_text === "string" &&
    result.output_text.trim()
  ) {

    return result.output_text.trim();
  }


  /*
    Fallback parser.
  */

  if (Array.isArray(result.output)) {

    for (const item of result.output) {

      if (
        item &&
        item.type === "message" &&
        Array.isArray(item.content)
      ) {

        for (const content of item.content) {

          if (
            content &&
            content.type === "output_text" &&
            typeof content.text === "string"
          ) {

            return content.text.trim();
          }

        }

      }

    }

  }


  return "";
}


// =======================================================
// GROQ AI REQUEST
// =======================================================

async function askGroq({
  systemPrompt,
  history,
  message
}) {

  const input = [];


  /*
    System instructions.
  */

  input.push({

    role: "system",

    content: systemPrompt

  });


  /*
    Conversation history.
  */

  for (const item of history) {

    input.push({

      role: item.role,

      content: item.content

    });

  }


  /*
    Current user message.
  */

  input.push({

    role: "user",

    content: message

  });


  const response =
    await fetch(
      GROQ_URL,
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Bearer ${GROQ_API_KEY}`

        },

        body: JSON.stringify({

          model: MODEL,

          input: input,

          /*
            Medium reasoning is a good starting
            balance between intelligence and speed.
          */

          reasoning: {
            effort: "medium"
          }

        })

      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    const errorMessage =
      result?.error?.message ||
      "Groq API request failed.";

    const error =
      new Error(errorMessage);

    error.status =
      response.status;

    error.groq =
      result;

    throw error;
  }


  const reply =
    extractGroqText(result);


  if (!reply) {

    throw new Error(
      "Groq returned an empty response."
    );
  }


  return {
    reply,
    raw: result
  };
}


// =======================================================
// SERVER
// =======================================================

const server =
  http.createServer(
    (req, res) => {

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


      // ===================================================
      // OPTIONS
      // ===================================================

      if (
        req.method === "OPTIONS"
      ) {

        res.writeHead(204);

        res.end();

        return;
      }


      // ===================================================
      // HEALTH CHECK
      // ===================================================

      if (
        req.method === "GET" &&
        req.url === "/api/health"
      ) {

        sendJSON(
          res,
          200,
          {

            status: "ok",

            message:
              "Emogigs AI server is running.",

            intelligenceCore:
              "19A",

            model:
              MODEL,

            features: {

              conversationHistory:
                true,

              reasoning:
                true,

              programmingMode:
                true,

              emotionAwareness:
                true,

              intentDetection:
                true,

              languageDetection:
                true

            }

          }
        );

        return;
      }


      // ===================================================
      // AI CHAT
      // ===================================================

      if (
        req.method === "POST" &&
        req.url === "/api/chat"
      ) {

        let body = "";

        let bodyTooLarge =
          false;


        req.on(
          "data",
          chunk => {

            body +=
              chunk.toString();


            if (
              Buffer.byteLength(
                body,
                "utf8"
              ) > MAX_BODY_SIZE
            ) {

              bodyTooLarge =
                true;

            }

          }
        );


        req.on(
          "end",
          async () => {

            try {

              // =========================================
              // BODY SIZE
              // =========================================

              if (bodyTooLarge) {

                sendJSON(
                  res,
                  413,
                  {
                    error:
                      "Request is too large."
                  }
                );

                return;
              }


              // =========================================
              // JSON
              // =========================================

              let data;

              try {

                data =
                  JSON.parse(body);

              } catch (error) {

                sendJSON(
                  res,
                  400,
                  {
                    error:
                      "Invalid JSON request."
                  }
                );

                return;
              }


              // =========================================
              // MESSAGE
              // =========================================

              const message =
                safeText(
                  data.message
                );


              if (!message) {

                sendJSON(
                  res,
                  400,
                  {
                    error:
                      "Message is required."
                  }
                );

                return;
              }


              if (
                message.length >
                MAX_MESSAGE_LENGTH
              ) {

                sendJSON(
                  res,
                  413,
                  {
                    error:
                      "Message is too long."
                  }
                );

                return;
              }


              // =========================================
              // API KEY
              // =========================================

              if (!GROQ_API_KEY) {

                console.error(
                  "GROQ_API_KEY is missing."
                );

                sendJSON(
                  res,
                  500,
                  {
                    error:
                      "GROQ_API_KEY is not configured."
                  }
                );

                return;
              }


              // =========================================
              // HISTORY
              // =========================================

              const history =
                normalizeHistory(
                  data.history
                );


              // =========================================
              // INTELLIGENCE
              // =========================================

              const intelligence =
                analyzeUserMessage(
                  message
                );


              console.log(
                "================================================="
              );

              console.log(
                "EMOGIGS AI REQUEST"
              );

              console.log(
                "Intent:",
                intelligence.intent
              );

              console.log(
                "Emotion:",
                intelligence.emotion
              );

              console.log(
                "Goal:",
                intelligence.goal
              );

              console.log(
                "Language:",
                intelligence.language
              );

              console.log(
                "History:",
                history.length
              );

              console.log(
                "================================================="
              );


              // =========================================
              // SYSTEM PROMPT
              // =========================================

              const systemPrompt =
                buildSystemPrompt(
                  intelligence
                );


              // =========================================
              // GROQ
              // =========================================

              console.log(
                "GROQ REQUEST STARTING"
              );


              const ai =
                await askGroq({

                  systemPrompt,

                  history,

                  message

                });


              console.log(
                "GROQ RESPONSE SUCCESS"
              );


              // =========================================
              // RESPONSE
              // =========================================

              sendJSON(
                res,
                200,
                {

                  reply:
                    ai.reply,

                  intelligence: {

                    intent:
                      intelligence.intent,

                    emotion:
                      intelligence.emotion,

                    goal:
                      intelligence.goal,

                    language:
                      intelligence.language

                  },

                  model:
                    MODEL

                }
              );


            } catch (error) {

              console.error(
                "================================================="
              );

              console.error(
                "EMOGIGS SERVER ERROR"
              );

              console.error(
                error
              );

              console.error(
                "================================================="
              );


              const status =
                Number.isInteger(
                  error.status
                )
                  ? error.status
                  : 500;


              let message =
                "Emogigs AI could not complete the request.";


              if (
                status === 401
              ) {

                message =
                  "Groq API authentication failed. Check GROQ_API_KEY.";

              } else if (
                status === 429
              ) {

                message =
                  "Groq rate limit reached. Please try again shortly.";

              } else if (
                status >= 400 &&
                status < 500 &&
                error.message
              ) {

                message =
                  error.message;

              }


              sendJSON(
                res,
                status,
                {
                  error:
                    message
                }
              );

            }

          }
        );


        return;
      }


      // ===================================================
      // INDEX.HTML
      // ===================================================

      if (
        (
          req.method === "GET" ||
          req.method === "HEAD"
        ) &&
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

              res.writeHead(
                500,
                {
                  "Content-Type":
                    "text/plain; charset=utf-8"
                }
              );

              res.end(
                "Could not load index.html."
              );

              return;
            }


            res.writeHead(
              200,
              {
                "Content-Type":
                  "text/html; charset=utf-8"
              }
            );


            res.end(data);

          }
        );


        return;
      }


      // ===================================================
      // SCRIPT.JS
      // ===================================================

      if (
        (
          req.method === "GET" ||
          req.method === "HEAD"
        ) &&
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

              res.writeHead(
                404,
                {
                  "Content-Type":
                    "text/plain; charset=utf-8"
                }
              );

              res.end(
                "script.js not found."
              );

              return;
            }


            res.writeHead(
              200,
              {

                "Content-Type":
                  "application/javascript; charset=utf-8",

                "Cache-Control":
                  "no-cache"

              }
            );


            res.end(data);

          }
        );


        return;
      }


      // ===================================================
      // 404
      // ===================================================

      sendJSON(
        res,
        404,
        {
          error:
            "Not found"
        }
      );

    }
  );


// =======================================================
// START SERVER
// =======================================================

server.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "================================================="
    );

    console.log(
      "EMOGIGS AI SERVER"
    );

    console.log(
      `Running on port ${PORT}`
    );

    console.log(
      `Model: ${MODEL}`
    );

    console.log(
      "Intelligence Core: Step 19A"
    );

    console.log(
      "Conversation History: ENABLED"
    );

    console.log(
      "Reasoning: ENABLED"
    );

    console.log(
      "Programming Intelligence: ENABLED"
    );

    console.log(
      "================================================="
    );

  }
);