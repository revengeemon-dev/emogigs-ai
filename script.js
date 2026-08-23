/* =========================================================
   EMOGIGS AI
   STEP 16B — UNIFIED CHAT ENGINE
   ========================================================= */

let isSending = false;

const STORAGE_KEY = "emogigs_chat_history";


/* =========================================================
   STORAGE
   ========================================================= */

function getChatHistory() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const history =
      JSON.parse(saved);

    return Array.isArray(history)
      ? history
      : [];

  } catch (error) {

    console.error(
      "Emogigs AI: Could not load chat history.",
      error
    );

    return [];
  }
}


function saveChatHistory(history) {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history)
    );

  } catch (error) {

    console.error(
      "Emogigs AI: Could not save chat history.",
      error
    );
  }
}


/* =========================================================
   ESCAPE HTML
   নিরাপদভাবে AI text render করার জন্য
   ========================================================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


/* =========================================================
   SIMPLE AI TEXT FORMATTER
   ========================================================= */

function formatAIText(text) {

  if (!text) {
    return "";
  }

  let html =
    escapeHTML(text);


  /* Bold */

  html = html.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );


  /* Headings */

  html = html.replace(
    /^### (.*)$/gm,
    "<strong>$1</strong>"
  );

  html = html.replace(
    /^## (.*)$/gm,
    "<strong>$1</strong>"
  );

  html = html.replace(
    /^# (.*)$/gm,
    "<strong>$1</strong>"
  );


  /* Bullet points */

  html = html.replace(
    /^[•*-]\s+(.*)$/gm,
    "• $1"
  );


  /* Line breaks */

  html = html.replace(
    /\n\n+/g,
    "</p><p>"
  );

  html = html.replace(
    /\n/g,
    "<br>"
  );


  return "<p>" + html + "</p>";
}


/* =========================================================
   REMOVE EMPTY STATE
   ========================================================= */

function removeEmptyState() {

  const empty =
    document.getElementById("chatEmpty");

  if (empty) {
    empty.remove();
  }
}


/* =========================================================
   SCROLL CHAT TO BOTTOM
   ========================================================= */

function scrollChatToBottom() {

  const chat =
    document.getElementById("chatHistory");

  if (!chat) {
    return;
  }

  requestAnimationFrame(() => {

    chat.scrollTop =
      chat.scrollHeight;

  });
}


/* =========================================================
   CREATE USER MESSAGE
   ========================================================= */

function createUserMessage(content) {

  const message =
    document.createElement("div");

  message.className =
    "message user";


  const bubble =
    document.createElement("div");

  bubble.className =
    "user-bubble";

  bubble.textContent =
    content;


  message.appendChild(bubble);


  return message;
}


/* =========================================================
   CREATE AI MESSAGE
   ========================================================= */

function createAIMessage(
  content,
  options = {}
) {

  const message =
    document.createElement("div");

  message.className =
    "message ai";


  /* Avatar */

  const avatar =
    document.createElement("div");

  avatar.className =
    "ai-message-avatar";

  avatar.textContent =
    "✦";


  /* Wrapper */

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "ai-message-wrapper";


  /* Label */

  const label =
    document.createElement("div");

  label.className =
    "ai-label";

  label.textContent =
    "Emogigs AI";


  /* Bubble */

  const bubble =
    document.createElement("div");

  bubble.className =
    "ai-bubble";

  bubble.innerHTML =
    formatAIText(content);


  wrapper.appendChild(label);

  wrapper.appendChild(bubble);


  /* Actions */

  if (!options.thinking) {

    const actions =
      document.createElement("div");

    actions.className =
      "message-actions";


    /* Copy */

    const copy =
      createActionButton(
        "⧉",
        "Copy",
        () => {
          copyText(content);
        }
      );


    /* Like */

    const like =
      createActionButton(
        "♡",
        "Like",
        event => {

          event.currentTarget.classList.toggle(
            "active"
          );

        }
      );


    /* Dislike */

    const dislike =
      createActionButton(
        "♧",
        "Not helpful",
        event => {

          event.currentTarget.classList.toggle(
            "active"
          );

        }
      );


    /* Listen */

    const listen =
      createActionButton(
        "🔊",
        "Listen",
        () => {
          speakText(content);
        }
      );


    actions.appendChild(copy);

    actions.appendChild(like);

    actions.appendChild(dislike);

    actions.appendChild(listen);


    wrapper.appendChild(actions);
  }


  message.appendChild(avatar);

  message.appendChild(wrapper);


  return message;
}


/* =========================================================
   ACTION BUTTON
   ========================================================= */

function createActionButton(
  icon,
  title,
  handler
) {

  const button =
    document.createElement("button");

  button.type =
    "button";

  button.className =
    "message-action";

  button.textContent =
    icon;

  button.title =
    title;

  button.setAttribute(
    "aria-label",
    title
  );

  button.addEventListener(
    "click",
    handler
  );

  return button;
}


/* =========================================================
   THINKING MESSAGE
   ========================================================= */

function createThinkingMessage() {

  const message =
    document.createElement("div");

  message.className =
    "message ai thinking-message";


  const avatar =
    document.createElement("div");

  avatar.className =
    "ai-message-avatar";

  avatar.textContent =
    "✦";


  const wrapper =
    document.createElement("div");

  wrapper.className =
    "ai-message-wrapper";


  const label =
    document.createElement("div");

  label.className =
    "ai-label";

  label.textContent =
    "Emogigs AI";


  const bubble =
    document.createElement("div");

  bubble.className =
    "ai-bubble";


  const thinking =
    document.createElement("div");

  thinking.className =
    "thinking";


  for (let i = 0; i < 3; i++) {

    const dot =
      document.createElement("span");

    dot.className =
      "thinking-dot";

    thinking.appendChild(dot);
  }


  bubble.appendChild(thinking);

  wrapper.appendChild(label);

  wrapper.appendChild(bubble);

  message.appendChild(avatar);

  message.appendChild(wrapper);


  return message;
}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(
  role,
  content
) {

  const chat =
    document.getElementById(
      "chatHistory"
    );

  if (!chat) {

    console.error(
      "Emogigs AI: chatHistory not found."
    );

    return null;
  }


  removeEmptyState();


  let message;


  if (role === "user") {

    message =
      createUserMessage(content);

  } else {

    message =
      createAIMessage(content);

  }


  chat.appendChild(message);

  scrollChatToBottom();


  return message;
}


/* =========================================================
   THINKING
   ========================================================= */

function addThinkingMessage() {

  const chat =
    document.getElementById(
      "chatHistory"
    );

  if (!chat) {
    return null;
  }


  removeEmptyState();


  const message =
    createThinkingMessage();


  chat.appendChild(message);

  scrollChatToBottom();


  return message;
}


/* =========================================================
   REMOVE THINKING
   ========================================================= */

function removeThinkingMessage() {

  const chat =
    document.getElementById(
      "chatHistory"
    );

  if (!chat) {
    return;
  }


  const thinking =
    chat.querySelector(
      ".thinking-message"
    );


  if (thinking) {
    thinking.remove();
  }
}


/* =========================================================
   RENDER HISTORY
   ========================================================= */

function renderChatHistory() {

  const chat =
    document.getElementById(
      "chatHistory"
    );

  if (!chat) {
    return;
  }


  chat.innerHTML = "";


  const history =
    getChatHistory();


  if (!history.length) {

    chat.innerHTML = `
      <div id="chatEmpty" class="chat-empty">

        <div class="chat-empty-icon">
          ✦
        </div>

        <h3>
          How can I help you today?
        </h3>

        <p>
          Ask me anything about learning,
          work, planning, skills or your next goal.
        </p>

      </div>
    `;

    return;
  }


  history.forEach(item => {

    if (
      !item ||
      !item.role ||
      !item.content
    ) {
      return;
    }


    addMessage(
      item.role,
      item.content
    );

  });


  scrollChatToBottom();
}


/* =========================================================
   SET QUICK PROMPT
   ========================================================= */

function setPrompt(text) {

  const input =
    document.getElementById(
      "userInput"
    );

  if (!input) {
    return;
  }


  input.value =
    text;


  autoResizeInput();


  input.focus();


  /* Scroll toward composer */

  input.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


/* =========================================================
   AUTO RESIZE INPUT
   ========================================================= */

function autoResizeInput() {

  const input =
    document.getElementById(
      "userInput"
    );

  if (!input) {
    return;
  }


  input.style.height =
    "auto";


  input.style.height =
    Math.min(
      input.scrollHeight,
      110
    ) + "px";
}


/* =========================================================
   COPY
   ========================================================= */

async function copyText(text) {

  try {

    await navigator.clipboard.writeText(
      text
    );

    showCopyNotice(
      "Copied"
    );

  } catch (error) {

    console.error(
      "Copy failed:",
      error
    );

    showCopyNotice(
      "Copy failed"
    );
  }
}


/* =========================================================
   COPY NOTICE
   ========================================================= */

function showCopyNotice(text) {

  const notice =
    document.getElementById(
      "copyNotice"
    );

  if (!notice) {
    return;
  }


  notice.textContent =
    text;

  notice.classList.add(
    "show"
  );


  setTimeout(() => {

    notice.classList.remove(
      "show"
    );

  }, 1400);
}


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function speakText(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    showCopyNotice(
      "Voice not supported"
    );

    return;
  }


  window.speechSynthesis.cancel();


  const utterance =
    new SpeechSynthesisUtterance(
      text
    );


  utterance.rate =
    0.95;

  utterance.pitch =
    1;


  window.speechSynthesis.speak(
    utterance
  );
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function askEmogigs() {

  const input =
    document.getElementById(
      "userInput"
    );

  const button =
    document.getElementById(
      "askButton"
    );


  if (!input || !button) {
    return;
  }


  const text =
    input.value.trim();


  if (!text) {

    input.focus();

    return;
  }


  if (isSending) {
    return;
  }


  isSending =
    true;


  button.disabled =
    true;


  button.textContent =
    "…";


  /* ============================================
     USER MESSAGE
     ============================================ */

  addMessage(
    "user",
    text
  );


  /* Save user message */

  const history =
    getChatHistory();


  history.push({
    role: "user",
    content: text
  });


  saveChatHistory(
    history
  );


  /* Clear input */

  input.value = "";

  autoResizeInput();


  /* ============================================
     THINKING
     ============================================ */

  addThinkingMessage();


  try {

    console.log(
      "Emogigs AI: Sending request..."
    );


    const response =
      await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              message: text
            })
        }
      );


    console.log(
      "Emogigs AI: Server status:",
      response.status
    );


    let data;


    try {

      data =
        await response.json();

    } catch (jsonError) {

      throw new Error(
        "Server returned invalid JSON."
      );
    }


    console.log(
      "Emogigs AI: Server data:",
      data
    );


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Server returned an error."
      );
    }


    const reply =
      data.reply ||
      "I couldn't generate a response right now.";


    /* Remove thinking */

    removeThinkingMessage();


    /* ============================================
       AI MESSAGE
       ============================================ */

    addMessage(
      "assistant",
      reply
    );


    /* Save AI */

    const updatedHistory =
      getChatHistory();


    updatedHistory.push({
      role: "assistant",
      content: reply
    });


    saveChatHistory(
      updatedHistory
    );


  } catch (error) {

    console.error(
      "EMOGIGS AI ERROR:",
      error
    );


    removeThinkingMessage();


    const errorMessage =
      "Sorry, I couldn't connect to Emogigs AI right now.";


    addMessage(
      "assistant",
      errorMessage
    );

  } finally {

    isSending =
      false;


    button.disabled =
      false;


    button.textContent =
      "➤";


    input.focus();

  }
}


/* =========================================================
   ENTER KEY
   ========================================================= */

function handleInputKeydown(event) {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();

    askEmogigs();

  }

}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const input =
      document.getElementById(
        "userInput"
      );


    const button =
      document.getElementById(
        "askButton"
      );


    if (!input || !button) {

      console.error(
        "Emogigs AI: Required UI elements missing."
      );

      return;
    }


    /* Send button */

    button.addEventListener(
      "click",
      askEmogigs
    );


    /* Enter */

    input.addEventListener(
      "keydown",
      handleInputKeydown
    );


    /* Auto resize */

    input.addEventListener(
      "input",
      autoResizeInput
    );


    /* Restore chat */

    renderChatHistory();


    console.log(
      "Emogigs AI Step 16B loaded successfully."
    );

  }
);