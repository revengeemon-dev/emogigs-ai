let isSending = false;

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
  const response = document.getElementById("response");
  const button = document.getElementById("askButton");

  if (!input || !response) {
    console.error("Emogigs AI: Required elements not found.");
    return;
  }

  const text = input.value.trim();

  if (!text) {
    response.style.display = "block";
    response.textContent = "Please tell me what you need help with.";
    input.focus();
    return;
  }

  if (isSending) {
    return;
  }

  isSending = true;

  response.style.display = "block";
  response.textContent = "Emogigs AI is thinking...";

  if (button) {
    button.disabled = true;
    button.textContent = "Thinking...";
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

    console.log("Emogigs AI: Server response:", res.status);

    const data = await res.json();

    console.log("Emogigs AI: Response data:", data);

    if (!res.ok) {
      throw new Error(
        data.error || "Server returned an error."
      );
    }

    response.textContent =
      data.reply || "No response received.";

    input.value = "";
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

document.addEventListener("DOMContentLoaded", () => {
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

  button.addEventListener("click", askEmogigs);

  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askEmogigs();
    }
  });

  console.log(
    "Emogigs AI frontend loaded successfully."
  );
});