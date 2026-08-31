const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/*
=========================================================
EMOGIGS AI
INTELLIGENCE CORE — STEP 20A
=========================================================

STEP 20A FEATURES

1. Conversation Context
2. Intent Detection
3. Goal Detection
4. Emotion Signal
5. Language Detection
6. Mode Intelligence
7. Coding Intelligence
8. Learning Intelligence
9. Creative Intelligence
10. Career / Business Intelligence
11. Self-Check Instructions
12. Hallucination Control
13. Context-Aware Responses
14. Future AI Provider Ready Architecture

IMPORTANT:
This system does NOT guarantee perfect answers.
It is designed to improve accuracy, consistency,
context awareness and practical usefulness.
=========================================================
*/


// =======================================================
// CONFIGURATION
// =======================================================

const MAX_BODY_SIZE = 32 * 1024;
const MAX_MESSAGE_LENGTH = 12000;
const MAX_HISTORY_MESSAGES = 16;


// =======================================================
// SECURITY / HTTP HELPERS
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
// LANGUAGE DETECTION
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
    "not working",
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


  // Programming
  if (
    value.includes("code") ||
    value.includes("coding") ||
    value.includes("javascript") ||
    value.includes("typescript") ||
    value.includes("html") ||
    value.includes("css") ||
    value.includes("node") ||
    value.includes("node.js") ||
    value.includes("server") ||
    value.includes("api") ||
    value.includes("program") ||
    value.includes("bug") ||
    value.includes("error") ||
    value.includes("কোড") ||
    value.includes("কোডিং") ||
    value.includes("সার্ভার") ||
    value.includes("এরর") ||
    value.includes("বাগ")
  ) {
    return "programming";
  }


  // Learning
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


  // Career
  if (
    value.includes("job") ||
    value.includes("career") ||
    value.includes("work") ||
    value.includes("freelance") ||
    value.includes("চাকরি") ||
    value.includes("কাজ") ||
    value.includes("ফ্রিল্যান্স") ||
    value.includes("ক্যারিয়ার")
  ) {
    return "career";
  }


  // Planning
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


  // Creative / Design
  if (
    value.includes("design") ||
    value.includes("ui") ||
    value.includes("ux") ||
    value.includes("app") ||
    value.includes("website") ||
    value.includes("creative") ||
    value.includes("ডিজাইন") ||
    value.includes("অ্যাপ") ||
    value.includes("ওয়েবসাইট") ||
    value.includes("ক্রিয়েটিভ")
  ) {
    return "creative-design";
  }


  // Business / Finance
  if (
    value.includes("business") ||
    value.includes("money") ||
    value.includes("income") ||
    value.includes("profit") ||
    value.includes("ব্যবসা") ||
    value.includes("টাকা") ||
    value.includes("আয়") ||
    value.includes("লাভ")
  ) {
    return "business-finance";
  }


  // Writing
  if (
    value.includes("write") ||
    value.includes("writing") ||
    value.includes("email") ||
    value.includes("article") ||
    value.includes("caption") ||
    value.includes("লিখ") ||
    value.includes("ইমেইল") ||
    value.includes("ক্যাপশন")
  ) {
    return "writing";
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
    value.includes("শিখব") ||
    value.includes("শিখতে চাই")
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
    value.includes("বাগ")
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


  if (
    value.includes("compare") ||
    value.includes("comparison") ||
    value.includes("তুলনা")
  ) {
    return "compare options and make a decision";
  }


  return "understand the user's request and provide useful next steps";

}


// =======================================================
// RESPONSE STYLE
// =======================================================

function detectResponseStyle(
  emotion,
  intent
) {

  if (emotion === "frustrated") {

    return "calm, patient, reassuring and strongly solution-focused";

  }


  if (emotion === "sad") {

    return "warm, empathetic, respectful and supportive";

  }


  if (emotion === "excited") {

    return "positive, energetic, encouraging and realistic";

  }


  if (emotion === "confused") {

    return "simple, patient, structured and step-by-step";

  }


  if (intent === "programming") {

    return "technical, precise, structured and practical";

  }


  if (intent === "learning") {

    return "educational, simple, progressive and example-driven";

  }


  return "clear, natural, helpful and professional";

}


// =======================================================
// INTELLIGENCE ANALYSIS
// =======================================================

function analyzeUserMessage(
  message,
  mode
) {

  const language =
    detectLanguage(message);

  const emotion =
    detectEmotion(message);

  const intent =
    detectIntent(message);

  const goal =
    detectGoal(message);

  const responseStyle =
    detectResponseStyle(
      emotion,
      intent
    );


  return {

    language,
    emotion,
    intent,
    goal,
    responseStyle,
    mode:
      mode || "General"

  };

}


// =======================================================
// HISTORY CLEANING
// =======================================================

function cleanHistory(history) {

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
    .map(item => ({

      role: item.role,

      content:
        item.content
          .slice(0, 12000)

    }));

}


// =======================================================
// BUILD SYSTEM PROMPT
// =======================================================

function buildSystemPrompt(
  intelligence,
  history
) {

  const hasHistory =
    history.length > 0;


  return `
You are Emogigs AI, the intelligent assistant of the Emogigs platform.

=========================================================
IDENTITY
=========================================================

Your name is Emogigs AI.

If the user asks who you are:
identify yourself as Emogigs AI.

Never claim to be ChatGPT.

Never claim that you were created by OpenAI.

Never invent facts about Emogigs.


=========================================================
CORE OBJECTIVE
=========================================================

Your primary objective is:

UNDERSTAND → THINK → VERIFY → ANSWER → GUIDE

Do not rush to answer.

First understand exactly what the user wants.

Then determine the most useful response.

When appropriate, provide concrete steps that the user can actually follow.


=========================================================
CONVERSATION CONTEXT
=========================================================

Previous conversation history is available to you.

Use it when it is relevant.

If the user's latest message refers to:

"it"
"that"
"this"
"আগেরটা"
"ওটা"
"এটা"
"সেটা"
"previous"
"earlier"
"the code"
"the app"

then use the previous conversation context to understand the reference.

Do NOT unnecessarily repeat the entire previous conversation.

Do NOT assume unrelated details from old messages.

Only use context that is relevant to the current request.


=========================================================
CURRENT INTELLIGENCE SIGNALS
=========================================================

Detected language:
${intelligence.language}

Detected emotion signal:
${intelligence.emotion}

Detected intent:
${intelligence.intent}

Detected goal:
${intelligence.goal}

Selected application mode:
${intelligence.mode}

Preferred response style:
${intelligence.responseStyle}


IMPORTANT:

These detections are approximate signals.

Never tell the user that you have diagnosed their emotions.

Never claim to read their mind.

Use these signals only to improve communication.


=========================================================
GENERAL INTELLIGENCE
=========================================================

1. Answer the actual question.

2. Do not answer a different question.

3. If the request is clear, do not unnecessarily ask for clarification.

4. If essential information is missing, ask a concise clarification.

5. Prefer practical solutions.

6. Avoid unnecessary repetition.

7. Match the user's knowledge level.

8. For complex tasks, divide the solution into clear steps.

9. If the user is building software, protect existing working parts.

10. Before suggesting code changes, understand what the existing architecture is doing.

11. Never pretend that code is guaranteed to be perfect.

12. Never fabricate information.

13. Never fabricate tool usage.

14. Never claim to have completed an external action unless it actually happened.

15. If you are uncertain about a factual claim, say so instead of inventing an answer.


=========================================================
SELF-CHECK PROTOCOL
=========================================================

Before producing the final answer, internally check:

A. Did I understand the user's actual request?

B. Did I answer every important part?

C. Did I accidentally assume something unsupported?

D. If code is provided, is the syntax internally consistent?

E. Did I preserve the user's existing architecture where possible?

F. Are the instructions actionable?

G. Is there any contradiction in my answer?

H. Am I claiming a capability that Emogigs does not actually have?

If something is uncertain, communicate the uncertainty honestly.


=========================================================
PROGRAMMING INTELLIGENCE
=========================================================

For coding requests:

1. Identify the likely problem.

2. Explain the cause in simple language.

3. Give the exact file that needs changing.

4. Preserve working code whenever possible.

5. Do not rewrite unrelated files unnecessarily.

6. When useful, provide complete copy-paste-ready code.

7. Explain exactly what the user should replace.

8. After changes, provide a testing procedure.

9. Consider:
   - syntax errors
   - runtime errors
   - API errors
   - missing environment variables
   - browser compatibility
   - asynchronous behavior
   - incorrect endpoints
   - malformed JSON
   - authentication
   - state management
   - security issues

10. Never say:
"100% bug-free"
"guaranteed perfect"
"zero errors"

Instead use evidence-based language.


=========================================================
LEARNING INTELLIGENCE
=========================================================

For learning requests:

- Start from the user's level.
- Explain difficult concepts simply.
- Use examples.
- Progress from basic to advanced.
- Give practical exercises when useful.
- Do not overload the user with unnecessary theory.


=========================================================
CREATIVE INTELLIGENCE
=========================================================

For creative tasks:

- Think beyond generic ideas.
- Consider real-world usability.
- Offer multiple strong directions when appropriate.
- Prioritize originality, clarity and user value.
- Avoid copying another product's identity or proprietary design.


=========================================================
CAREER / BUSINESS INTELLIGENCE
=========================================================

For career and business questions:

- Focus on realistic options.
- Explain advantages and disadvantages.
- Consider the user's stated constraints.
- Avoid unrealistic income guarantees.
- Provide practical next steps.


=========================================================
EMOGIGS FEATURE TRUTH
=========================================================

Only describe a feature as currently available if it is actually implemented.

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

If a feature is not implemented:

say clearly that it is not currently available.

Then, if useful, explain how it could be added in a future version.


=========================================================
LANGUAGE
=========================================================

Respond naturally in the user's language whenever possible.

If the user writes Bengali:

respond naturally in Bengali.

If the user mixes Bengali and English:

you may naturally use both when useful.

Do not translate unnecessarily.


=========================================================
SAFETY / HONESTY
=========================================================

Never fabricate medical, financial, legal or technical certainty.

For high-risk subjects, provide appropriate caution.

Do not pretend to be a human.

Do not pretend to have emotions.

Do not manipulate the user.

Be helpful, respectful and honest.


=========================================================
FINAL RESPONSE QUALITY
=========================================================

The best answer is not necessarily the longest answer.

The best answer is:

accurate
relevant
clear
practical
context-aware
honest
easy to follow

When a step-by-step solution is appropriate, make the steps easy to execute.

=========================================================
CONVERSATION HISTORY AVAILABLE:
=========================================================

${hasHistory
    ? JSON.stringify(history, null, 2)
    : "No previous conversation history was provided."
}
`;

}


// =======================================================
// AI RESPONSE EXTRACTION
// =======================================================

function extractGroqText(result) {

  if (!result) {

    return "";

  }


  // Responses API
  if (
    Array.isArray(result.output)
  ) {

    for (
      const item of result.output
    ) {

      if (
        item &&
        item.type === "message" &&
        Array.isArray(item.content)
      ) {

        for (
          const content of item.content
        ) {

          if (
            content &&
            content.type === "output_text" &&
            typeof content.text === "string"
          ) {

            return content.text;

          }

        }

      }

    }

  }


  // Chat Completions fallback
  if (
    Array.isArray(result.choices) &&
    result.choices[0]
  ) {

    const choice =
      result.choices[0];


    if (
      choice.message &&
      typeof choice.message.content === "string"
    ) {

      return choice.message.content;

    }


    if (
      typeof choice.text === "string"
    ) {

      return choice.text;

    }

  }


  return "";

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
              "20A",

            features: [
              "conversation-context",
              "intent-detection",
              "goal-detection",
              "emotion-awareness",
              "language-detection",
              "mode-intelligence",
              "programming-intelligence",
              "learning-intelligence",
              "self-check",
              "hallucination-control"
            ]
          }
        );

        return;

      }


      console.log(
        "REQUEST:",
        req.method,
        req.url
      );


      // ===================================================
      // CHAT API
      // ===================================================

      if (
        req.method === "POST" &&
        req.url === "/api/chat"
      ) {

        let body = "";

        let bodyTooLarge = false;


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

              bodyTooLarge = true;

            }

          }
        );


        req.on(
          "end",
          async () => {

            try {

              // =========================================
              // BODY LIMIT
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
              // PARSE JSON
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
                typeof data.message === "string"
                  ? data.message.trim()
                  : "";


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
                      "Message is too long. Please shorten your message."
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
              // MODE
              // =========================================

              const mode =
                typeof data.mode === "string" &&
                data.mode.trim()
                  ? data.mode.trim()
                  : "General";


              // =========================================
              // HISTORY
              // =========================================

              const history =
                cleanHistory(
                  data.history
                );


              // =========================================
              // INTELLIGENCE
              // =========================================

              const intelligence =
                analyzeUserMessage(
                  message,
                  mode
                );


              console.log(
                "EMOGIGS INTELLIGENCE:",
                JSON.stringify(
                  intelligence
                )
              );


              // =========================================
              // SYSTEM PROMPT
              // =========================================

              const systemPrompt =
                buildSystemPrompt(
                  intelligence,
                  history
                );


              // =========================================
              // GROQ REQUEST
              // =========================================

              console.log(
                "GROQ REQUEST STARTING"
              );


              const groqResponse =
                await fetch(
                  "https://api.groq.com/openai/v1/responses",
                  {

                    method:
                      "POST",

                    headers: {

                      "Content-Type":
                        "application/json",

                      "Authorization":
                        `Bearer ${GROQ_API_KEY}`

                    },

                    body:
                      JSON.stringify({

                        model:
                          "openai/gpt-oss-20b",

                        input: [

                          {
                            role:
                              "system",

                            content:
                              systemPrompt
                          },

                          ...history,

                          {
                            role:
                              "user",

                            content:
                              message
                          }

                        ]

                      })

                  }
                );


              // =========================================
              // GROQ RESULT
              // =========================================

              const result =
                await groqResponse.json();


              console.log(
                "GROQ RESPONSE STATUS:",
                groqResponse.status
              );


              if (
                !groqResponse.ok
              ) {

                console.error(
                  "GROQ ERROR:",
                  JSON.stringify(
                    result
                  )
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


              // =========================================
              // EXTRACT ANSWER
              // =========================================

              const reply =
                extractGroqText(
                  result
                );


              if (!reply) {

                console.error(
                  "EMPTY GROQ RESPONSE:",
                  JSON.stringify(
                    result
                  )
                );


                sendJSON(
                  res,
                  502,
                  {
                    error:
                      "AI returned an empty response."
                  }
                );

                return;

              }


              // =========================================
              // FINAL RESPONSE
              // =========================================

              sendJSON(
                res,
                200,
                {

                  reply,

                  intelligence: {

                    intent:
                      intelligence.intent,

                    emotion:
                      intelligence.emotion,

                    goal:
                      intelligence.goal,

                    language:
                      intelligence.language,

                    mode:
                      intelligence.mode

                  }

                }
              );


            } catch (error) {

              console.error(
                "SERVER ERROR:",
                error
              );


              sendJSON(
                res,
                500,
                {
                  error:
                    "Server error."
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
      // NOT FOUND
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
      `Emogigs AI server running on port ${PORT}`
    );

    console.log(
      "Emogigs Intelligence Core: Step 20A"
    );

  }
);