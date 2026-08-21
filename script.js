let isSending = false;

const STORAGE_KEY = "emogigs_chat_history_v1";

let chatHistory = loadChatHistory();

function loadChatHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Emogigs AI: Could not load chat history.", error);
    return [];
  }
}

function saveChatHistory() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(chatHistory)
    );
  } catch (error) {
    console.error("Emogigs AI: Could not save chat history.", error);
  }
}

function setPrompt(text) {
  const input = document.getElementById("userInput");

  if (!input) {
    console.error("Emogigs AI: userInput not found.");
    return;
  }

  input.value = text;
  input.focus();
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderChatHistory() {
  const response = document.getElementById("response");

  if (!response) {
    console.error("Emogigs AI: response element not found.");
    return;
  }

  if (chatHistory.length === 0) {
    response.style.display = "none";
    response.innerHTML = "";
    return;
  }

  response.style.display = "block";

  response.innerHTML = "";

  chatHistory.forEach((message, index) => {
    const messageBox = document.createElement("div");

    messageBox.style.marginBottom = "18px";

    if (message.role === "user") {
      messageBox.innerHTML = `
        <div style="
          margin-bottom:6px;
          font-weight:700;
          color:#6ea8ff;
        ">
          You
        </div>

        <div style="
          padding:12px;
          border-radius:12px;
          background:#16213a;
          color:#ffffff;
          white-space:pre-wrap;
          word-break:break-word;
        ">
          ${escapeHTML(message.content)}
        </div>

        <button
          onclick="editMessage(${index})"
          style="
            margin-top:7px;
            padding:6px 10px;
            border:none;
            border-radius:8px;
            background:#25304a;
            color:#d9e1f2;
            cursor:pointer;
          "
        >
          ✏️ Edit
        </button>
      `;

    } else {
      messageBox.innerHTML = `
        <div style="
          margin-bottom:6px;
          font-weight:700;
          color:#ffffff;
        ">
          Emogigs AI
        </div>

        <div style="
          padding:12px;
          border-radius:12px;
          background:#0b1020;
          color:#d9e1f2;
          line-height:1.6;
          white-space:pre-wrap;
          word-break:break-word;
        ">
          ${escapeHTML(message.content)}
        </div>

        <div style="
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          margin-top:8px;
        ">
          <button
            onclick="copyMessage(${index})"
            style="
              padding:6px 9px;
              border:none;
              border-radius:8px;
              background:#25304a;
              color:#ffffff;
              cursor:pointer;
            "
          >
            📋 Copy
          </button>

          <button
            onclick="likeMessage(${index})"
            style="
              padding:6px 9px;
              border:none;
              border-radius:8px;
              background:#25304a;
              color:#ffffff;
              cursor:pointer;
            "
          >
            👍
          </button>

          <button
            onclick="dislikeMessage(${index})"
            style="
              padding:6px 9px;
              border:none;
              border-radius:8px;
              background:#25304a;
              color:#ffffff;
              cursor:pointer;
            "
          >
            👎
          </button>

          <button
            onclick="speakMessage(${index})"
            style="
              padding:6px 9px;
              border:none;
              border-radius:8px;
              background:#25304a;
              color:#ffffff;
              cursor:pointer;
            "
          >
            🔊 Listen
          </button>

          <button
            onclick="shareMessage(${index})"
            style="
              padding:6px 9px;
              border:none;
              border-radius:8px;
              background:#25304a;
              color:#ffffff;
              cursor:pointer;
            "
          >
            ↗️ Share
          </button>

          <button
            onclick="regenerateMessage(${index})"
            style="
              padding:6px 9px;
              border:none;
              border-radius:8px;
              background:#25304a;
              color:#ffffff;
              cursor:pointer;
            "
          >
            🔄 Regenerate
          </button>
        </div>
      `;
    }

    response.appendChild(messageBox);
  });

  response.scrollTop = response.scrollHeight;
}

async function askEmogigs() {
  const input = document.getElementById("userInput");
  const button = document.getElementById("askButton");

  if (!input) {
    console.error("Emogigs AI: userInput not found.");
    return;
  }

  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  if (isSending) {
    return;
  }

  isSending = true;

  if (button) {
    button.disabled = true;
    button.textContent = "Thinking...";
  }

  chatHistory.push({
    role: "user",
    content: text
  });

  saveChatHistory();
  renderChatHistory();

  input.value = "";

  const response = document.getElementById("response");

  if (response) {
    const thinking = document.createElement("div");

    thinking.id = "thinkingMessage";

    thinking.textContent = "Emogigs AI is thinking...";

    thinking.style.padding = "12px";
    thinking.style.color = "#9aa6bd";

    response.appendChild(thinking);
    response.style.display = "block";
  }

  try {
    console.log("Emogigs AI: Sending request...");

    const res = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: text
      })
    });

    console.log(
      "Emogigs AI: Server response:",
      res.status
    );

    const data = await res.json();

    console.log(
      "Emogigs AI: Response data:",
      data
    );

    if (!res.ok) {
      throw new Error(
        data.error || "Server returned an error."
      );
    }

    const thinkingMessage =
      document.getElementById("thinkingMessage");

    if (thinkingMessage) {
      thinkingMessage.remove();
    }

    chatHistory.push({
      role: "assistant",
      content:
        data.reply || "No response received."
    });

    saveChatHistory();
    renderChatHistory();

  } catch (error) {
    console.error(
      "EMOGIGS AI ERROR:",
      error
    );

    const thinkingMessage =
      document.getElementById("thinkingMessage");

    if (thinkingMessage) {
      thinkingMessage.remove();
    }

    chatHistory.push({
      role: "assistant",
      content:
        "Sorry, I couldn't connect to Emogigs AI right now."
    });

    saveChatHistory();
    renderChatHistory();

  } finally {
    isSending = false;

    if (button) {
      button.disabled = false;
      button.textContent = "Ask AI";
    }

    input.focus();
  }
}

function editMessage(index) {
  const message = chatHistory[index];

  if (!message || message.role !== "user") {
    return;
  }

  const input = document.getElementById("userInput");

  if (!input) {
    return;
  }

  input.value = message.content;
  input.focus();

  chatHistory = chatHistory.slice(
    0,
    index
  );

  saveChatHistory();
  renderChatHistory();
}

async function copyMessage(index) {
  const message = chatHistory[index];

  if (!message) {
    return;
  }

  try {
    await navigator.clipboard.writeText(
      message.content
    );

    alert("Copied!");
  } catch (error) {
    console.error(
      "Copy failed:",
      error
    );
  }
}

function likeMessage(index) {
  console.log(
    "Emogigs AI: Liked message",
    index
  );

  alert("Thanks for your feedback! 👍");
}

function dislikeMessage(index) {
  console.log(
    "Emogigs AI: Disliked message",
    index
  );

  alert("Thanks for your feedback! 👎");
}

function speakMessage(index) {
  const message = chatHistory[index];

  if (!message) {
    return;
  }

  if (!("speechSynthesis" in window)) {
    alert(
      "Voice playback is not supported on this device."
    );

    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      message.content
    );

  utterance.lang = "bn-BD";

  window.speechSynthesis.speak(
    utterance
  );
}

async function shareMessage(index) {
  const message = chatHistory[index];

  if (!message) {
    return;
  }

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Emogigs AI",
        text: message.content
      });

      return;
    }

    await navigator.clipboard.writeText(
      message.content
    );

    alert(
      "Sharing is not available here, so the response was copied instead."
    );

  } catch (error) {
    console.error(
      "Share failed:",
      error
    );
  }
}

async function regenerateMessage(index) {
  if (isSending) {
    return;
  }

  const message = chatHistory[index];

  if (!message || message.role !== "assistant") {
    return;
  }

  const userMessage = chatHistory[index - 1];

  if (
    !userMessage ||
    userMessage.role !== "user"
  ) {
    return;
  }

  isSending = true;

  const button =
    document.getElementById("askButton");

  if (button) {
    button.disabled = true;
    button.textContent = "Thinking...";
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: userMessage.content
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error || "Server error."
      );
    }

    chatHistory[index].content =
      data.reply ||
      "No response received.";

    saveChatHistory();
    renderChatHistory();

  } catch (error) {
    console.error(
      "Regenerate error:",
      error
    );

  } finally {
    isSending = false;

    if (button) {
      button.disabled = false;
      button.textContent = "Ask AI";
    }
  }
}

function newChat() {
  if (
    chatHistory.length > 0 &&
    !confirm(
      "Start a new chat? Your current conversation will be cleared from this device."
    )
  ) {
    return;
  }

  chatHistory = [];

  saveChatHistory();
  renderChatHistory();

  const input =
    document.getElementById("userInput");

  if (input) {
    input.value = "";
    input.focus();
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const input =
      document.getElementById("userInput");

    const button =
      document.getElementById("askButton");

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

    button.addEventListener(
      "click",
      askEmogigs
    );

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

    renderChatHistory();

    console.log(
      "Emogigs AI Chat Engine v2 loaded successfully."
    );
  }
);