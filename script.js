let isSending = false;

const STORAGE_KEY = "emogigs_chat_history";

function getChatHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Emogigs AI: Could not load chat history.", error);
    return [];
  }
}

function saveChatHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Emogigs AI: Could not save chat history.", error);
  }
}

function addMessage(role, content) {
  const chatHistory = document.getElementById("chatHistory");

  if (!chatHistory) {
    console.error("Emogigs AI: chatHistory not found.");
    return;
  }

  const message = document.createElement("div");

  message.className =
    role === "user"
      ? "chat-message user-message"
      : "chat-message ai-message";

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent =
    role === "user" ? "You" : "Emogigs AI";

  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = content;

  message.appendChild(label);
  message.appendChild(text);

  chatHistory.appendChild(message);

  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function renderChatHistory() {
  const chatHistory = document.getElementById("chatHistory");

  if (!chatHistory) {
    console.error("Emogigs AI: chatHistory not found.");
    return;
  }

  chatHistory.innerHTML = "";

  const history = getChatHistory();

  history.forEach(item => {
    addMessage(item.role, item.content);
  });
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

async function askEmogigs() {
  const input = document.getElementById("userInput");
  const button = document.getElementById("askButton");

  if (!input) {
    console.error("Emogigs AI: userInput not found.");
    return;
  }

  if (!button) {
    console.error("Emogigs AI: askButton not found.");
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

  button.disabled = true;
  button.textContent = "Thinking...";

  // Show user's message immediately
  addMessage("user", text);

  const history = getChatHistory();

  history.push({
    role: "user",
    content: text
  });

  saveChatHistory(history);

  // Clear input for the next question
  input.value = "";
  input.focus();

  // Temporary thinking message
  addMessage("assistant", "Emogigs AI is thinking...");

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

    const reply =
      data.reply || "No response received.";

    // Remove temporary thinking message
    const chatHistory =
      document.getElementById("chatHistory");

    if (chatHistory) {
      const messages =
        chatHistory.querySelectorAll(
          ".ai-message"
        );

      const lastMessage =
        messages[messages.length - 1];

      if (
        lastMessage &&
        lastMessage.querySelector(".message-text")
          ?.textContent ===
          "Emogigs AI is thinking..."
      ) {
        lastMessage.remove();
      }
    }

    // Add actual AI response
    addMessage("assistant", reply);

    // Save AI response
    const updatedHistory = getChatHistory();

    updatedHistory.push({
      role: "assistant",
      content: reply
    });

    saveChatHistory(updatedHistory);

  } catch (error) {
    console.error(
      "EMOGIGS AI ERROR:",
      error
    );

    // Remove thinking message
    const chatHistory =
      document.getElementById("chatHistory");

    if (chatHistory) {
      const messages =
        chatHistory.querySelectorAll(
          ".ai-message"
        );

      const lastMessage =
        messages[messages.length - 1];

      if (
        lastMessage &&
        lastMessage.querySelector(".message-text")
          ?.textContent ===
          "Emogigs AI is thinking..."
      ) {
        lastMessage.remove();
      }
    }

    const errorMessage =
      "Sorry, I couldn't connect to Emogigs AI right now.";

    addMessage("assistant", errorMessage);

  } finally {
    isSending = false;

    button.disabled = false;
    button.textContent = "Ask AI";

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
      "Emogigs AI frontend loaded successfully."
    );
  }
);