let isSending = false;

function setPrompt(text) {
  const input = document.getElementById("userInput");

  if (!input) return;

  input.value = text;
  input.focus();
}

async function askEmogigs() {
  const input = document.getElementById("userInput");
  const response = document.getElementById("response");
  const button = document.querySelector(".ask-btn");

  if (!input || !response) return;

  const text = input.value.trim();

  if (!text) {
    response.style.display = "block";
    response.textContent = "Please tell me what you need help with.";
    return;
  }

  if (isSending) return;

  isSending = true;

  response.style.display = "block";
  response.textContent = "Emogigs AI is thinking...";

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
        message: text
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Server error");
    }

    response.textContent =
      data.reply || "No response received.";

    /*
      Keep the user's input available so they can
      continue asking questions without refreshing.
    */
    input.focus();

  } catch (error) {
    console.error("EMOGIGS AI ERROR:", error);

    response.textContent =
      "Sorry, I couldn't connect to Emogigs AI right now.";
  } finally {
    isSending = false;

    if (button) {
      button.disabled = false;
      button.textContent = "Ask AI";
    }
  }
}

/*
  Press Enter to send.
  Shift + Enter creates a new line.
*/
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("userInput");

  if (!input) return;

  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askEmogigs();
    }
  });
});