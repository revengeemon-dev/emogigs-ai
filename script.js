/* =========================================================
   EMOGIGS AI — STEP 16B
   NEXT LEVEL CONVERSATION ENGINE
   ========================================================= */

let isSending = false;

const STORAGE_KEY = "emogigs_chat_history";

/* =========================================================
   1. CHAT HISTORY
   ========================================================= */

function getChatHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const history = JSON.parse(saved);

    return Array.isArray(history) ? history : [];

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
   2. SAFE TEXT
   ========================================================= */

function createTextElement(className, text) {
  const element = document.createElement("div");

  element.className = className;
  element.textContent = text;

  return element;
}


/* =========================================================
   3. USER MESSAGE
   ========================================================= */

function createUserMessage(content) {

  const message = document.createElement("div");

  message.className =
    "chat-message user";

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
   4. AI MESSAGE
   ========================================================= */

function createAIMessage(content) {

  const message =
    document.createElement("div");

  message.className =
    "chat-message ai";

  /* AI avatar */

  const avatar =
    document.createElement("div");

  avatar.className =
    "ai-avatar";

  avatar.textContent =
    "✦";


  /* Main wrapper */

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "ai-message-wrapper";


  /* AI bubble */

  const bubble =
    document.createElement("div");

  bubble.className =
    "ai-bubble";

  bubble.textContent =
    content;


  /* Action buttons */

  const actions =
    document.createElement("div");

  actions.className =
    "message-actions";


  /* Copy */

  const copyButton =
    document.createElement("button");

  copyButton.className =
    "message-action";

  copyButton.type =
    "button";

  copyButton.title =
    "Copy";

  copyButton.textContent =
    "📋";


  copyButton.addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          content
        );

        copyButton.textContent =
          "✓";

        setTimeout(() => {
          copyButton.textContent =
            "📋";
        }, 1200);

      } catch (error) {

        console.error(
          "Emogigs AI: Copy failed.",
          error
        );

      }

    }
  );


  actions.appendChild(
    copyButton
  );


  wrapper.appendChild(
    bubble
  );

  wrapper.appendChild(
    actions
  );


  message.appendChild(
    avatar
  );

  message.appendChild(
    wrapper
  );


  return message;
}


/* =========================================================
   5. THINKING MESSAGE
   ========================================================= */

function createThinkingMessage() {

  const message =
    document.createElement("div");

  message.className =
    "chat-message ai";

  message.dataset.thinking =
    "true";


  const avatar =
    document.createElement("div");

  avatar.className =
    "ai-avatar";

  avatar.textContent =
    "✦";


  const wrapper =
    document.createElement("div");

  wrapper.className =
    "ai-message-wrapper";


  const bubble =
    document.createElement("div");

  bubble.className =
    "ai-bubble thinking-bubble";


  for (let i = 0; i < 3; i++) {

    const dot =
      document.createElement("span");

    dot.className =
      "thinking-dot";

    bubble.appendChild(
      dot
    );
  }


  wrapper.appendChild(
    bubble
  );

  message.appendChild(
    avatar
  );

  message.appendChild(
    wrapper
  );


  return message;
}


/* =========================================================
   6. ADD MESSAGE TO CHAT
   ========================================================= */

function addMessage(role, content) {

  const chatHistoryElement =
    document.getElementById(
      "chatHistory"
    );

  if (!chatHistoryElement) {

    console.error(
      "Emogigs AI: chatHistory not found."
    );

    return null;
  }


  let message;


  if (role === "user") {

    message =
      createUserMessage(
        content
      );

  } else {

    message =
      createAIMessage(
        content
      );
  }


  chatHistoryElement.appendChild(
    message
  );


  scrollChatToBottom();


  return message;
}


/* =========================================================
   7. ADD THINKING
   ========================================================= */

function addThinkingMessage() {

  const chatHistoryElement =
    document.getElementById(
      "chatHistory"
    );

  if (!chatHistoryElement) {
    return null;
  }


  const message =
    createThinkingMessage();


  chatHistoryElement.appendChild(
    message
  );


  scrollChatToBottom();


  return message;
}


/* =========================================================
   8. REMOVE THINKING
   ========================================================= */

function removeThinkingMessage() {

  const chatHistoryElement =
    document.getElementById(
      "chatHistory"
    );

  if (!chatHistoryElement) {
    return;
  }


  const thinkingMessage =
    chatHistoryElement.querySelector(
      '[data-thinking="true"]'
    );


  if (thinkingMessage) {

    thinkingMessage.remove();

  }
}


/* =========================================================
   9. SCROLL CHAT
   ========================================================= */

function scrollChatToBottom() {

  const chatHistoryElement =
    document.getElementById(
      "chatHistory"
    );

  if (!chatHistoryElement) {
    return;
  }


  requestAnimationFrame(() => {

    chatHistoryElement.scrollTop =
      chatHistoryElement.scrollHeight;

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });

  });
}


/* =========================================================
   10. RENDER SAVED HISTORY
   ========================================================= */

function renderChatHistory() {

  const chatHistoryElement =
    document.getElementById(
      "chatHistory"
    );

  if (!chatHistoryElement) {

    console.error(
      "Emogigs AI: chatHistory not found."
    );

    return;
  }


  chatHistoryElement.innerHTML =
    "";


  const history =
    getChatHistory();


  history.forEach(item => {

    if (
      !item ||
      !item.role ||
      !item.content
    ) {
      return;
    }


    if (
      item.role === "user"
    ) {

      addMessage(
        "user",
        item.content
      );

    } else if (
      item.role === "assistant"
    ) {

      addMessage(
        "assistant",
        item.content
      );

    }

  });


  if (history.length > 0) {

    setTimeout(
      scrollChatToBottom,
      100
    );

  }
}


/* =========================================================
   11. SET PROMPT
   ========================================================= */

function setPrompt(text) {

  const input =
    document.getElementById(
      "userInput"
    );

  if (!input) {

    console.error(
      "Emogigs AI: userInput not found."
    );

    return;
  }


  input.value =
    text;

  input.focus();


  /* Put cursor at the end */

  try {

    input.selectionStart =
      input.value.length;

    input.selectionEnd =
      input.value.length;

  } catch (error) {
    // Some browsers may not support selection
  }
}


/* =========================================================
   12. ASK EMOGIGS AI
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


  if (!input) {

    console.error(
      "Emogigs AI: userInput not found."
    );

    return;
  }


  if (!button) {

    console.error(
      "Emogigs AI: askButton not found."
    );

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


  /* Disable button */

  button.disabled =
    true;

  button.textContent =
    "Thinking...";


  /* =====================================================
     SHOW USER MESSAGE IMMEDIATELY
     ===================================================== */

  addMessage(
    "user",
    text
  );


  /* =====================================================
     SAVE USER MESSAGE
     ===================================================== */

  const history =
    getChatHistory();


  history.push({

    role: "user",

    content: text

  });


  saveChatHistory(
    history
  );


  /* =====================================================
     CLEAR INPUT
     ===================================================== */

  input.value =
    "";

  input.focus();


  /* =====================================================
     SHOW THINKING
     ===================================================== */

  addThinkingMessage();


  try {

    console.log(
      "Emogigs AI: Sending request..."
    );


    /* ===================================================
       API REQUEST
       =================================================== */

    const res =
      await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message: text
          })
        }
      );


    console.log(
      "Emogigs AI: Server response:",
      res.status
    );


    let data;


    try {

      data =
        await res.json();

    } catch (jsonError) {

      throw new Error(
        "Invalid server response."
      );

    }


    console.log(
      "Emogigs AI: Response data:",
      data
    );


    if (!res.ok) {

      throw new Error(
        data.error ||
        "Server returned an error."
      );

    }


    const reply =
      data.reply ||
      "No response received.";


    /* ===================================================
       REMOVE THINKING
       =================================================== */

    removeThinkingMessage();


    /* ===================================================
       SHOW AI RESPONSE
       =================================================== */

    addMessage(
      "assistant",
      reply
    );


    /* ===================================================
       SAVE AI RESPONSE
       =================================================== */

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


    /* Remove thinking */

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
      "Ask AI";


    input.focus();

  }
}


/* =========================================================
   13. ENTER KEY
   ========================================================= */

function setupInput() {

  const input =
    document.getElementById(
      "userInput"
    );


  if (!input) {
    return;
  }


  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        askEmogigs();

      }

    }
  );

}


/* =========================================================
   14. START EMOGIGS AI
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

    const chatHistory =
      document.getElementById(
        "chatHistory"
      );


    if (!input) {

      console.error(
        "Emogigs AI: userInput not found."
      );

      return;
    }


    if (!button) {

      console.error(
        "Emogigs AI: askButton not found."
      );

      return;
    }


    if (!chatHistory) {

      console.error(
        "Emogigs AI: chatHistory not found."
      );

      return;
    }


    /* Button */

    button.addEventListener(
      "click",
      askEmogigs
    );


    /* Keyboard */

    setupInput();


    /* Restore conversation */

    renderChatHistory();


    console.log(
      "Emogigs AI Step 16B loaded successfully."
    );

  }
);