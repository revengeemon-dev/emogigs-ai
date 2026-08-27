/* =========================================================
   EMOGIGS AI
   Mobile AI Life OS
   Voice + Chat + Read Aloud + Creative Tools
========================================================= */

(() => {

  "use strict";


  /* =========================================================
     CONFIG
  ========================================================= */

  const API_URL = "/api/chat";

  const STORAGE_KEY = "emogigs_ai_chat_v2";

  let currentMode = "General";

  let isListening = false;

  let recognition = null;

  let currentSpeakingButton = null;

  let conversation = [];


  /* =========================================================
     DOM
  ========================================================= */

  const messageInput =
    document.getElementById("messageInput");

  const sendBtn =
    document.getElementById("sendBtn");

  const micBtn =
    document.getElementById("micBtn");

  const chatArea =
    document.getElementById("chatArea");

  const quickTools =
    document.getElementById("quickTools");

  const hero =
    document.getElementById("hero");

  const modeRow =
    document.getElementById("modeRow");

  const newChatBtn =
    document.getElementById("newChatBtn");

  const voiceStatus =
    document.getElementById("voiceStatus");

  const voiceStatusText =
    document.getElementById("voiceStatusText");

  const toast =
    document.getElementById("toast");


  /* =========================================================
     INITIALIZATION
  ========================================================== */

  document.addEventListener("DOMContentLoaded", () => {

    setupTextarea();

    setupModes();

    setupQuickTools();

    setupVoiceRecognition();

    loadConversation();

    setupButtons();

  });


  /* =========================================================
     BUTTONS
  ========================================================== */

  function setupButtons() {

    sendBtn.addEventListener("click", () => {

      sendMessage();

    });


    micBtn.addEventListener("click", () => {

      toggleVoiceInput();

    });


    newChatBtn.addEventListener("click", () => {

      startNewChat();

    });


    messageInput.addEventListener("keydown", event => {

      if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();

      }

    });

  }


  /* =========================================================
     TEXTAREA
  ========================================================== */

  function setupTextarea() {

    messageInput.addEventListener("input", () => {

      messageInput.style.height = "auto";

      messageInput.style.height =
        Math.min(messageInput.scrollHeight, 130) + "px";

    });

  }


  /* =========================================================
     MODES
  ========================================================== */

  function setupModes() {

    const modes =
      document.querySelectorAll(".mode-chip");

    modes.forEach(button => {

      button.addEventListener("click", () => {

        modes.forEach(item =>
          item.classList.remove("active")
        );

        button.classList.add("active");

        currentMode =
          button.dataset.mode || "General";

        showToast(
          `${currentMode} mode selected`
        );

      });

    });

  }


  /* =========================================================
     QUICK TOOLS
  ========================================================== */

  function setupQuickTools() {

    const cards =
      document.querySelectorAll(".quick-card");

    cards.forEach(card => {

      card.addEventListener("click", () => {

        const prompt =
          card.dataset.prompt || "";

        messageInput.value = prompt;

        messageInput.dispatchEvent(
          new Event("input")
        );

        sendMessage();

      });

    });

  }


      /* =========================================================
     VOICE RECOGNITION — STEP 17B
     Fresh recognition instance on every start
  ========================================================== */

  function createVoiceRecognition() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    const rec = new SpeechRecognition();

    rec.lang = "bn-BD";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {

      console.log("VOICE: STARTED");

      isListening = true;

      micBtn.classList.add("listening");

      micBtn.textContent = "⏹";

      voiceStatus.classList.add("show");

      voiceStatusText.textContent =
        "🎙️ শুনছি... কথা বলুন";

    };


    rec.onresult = event => {

      console.log("VOICE: RESULT");

      let finalText = "";
      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        const text =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {

          finalText += text;

        } else {

          interimText += text;

        }

      }


      if (interimText) {

        voiceStatusText.textContent =
          "🎙️ " + interimText;

      }


      if (finalText.trim()) {

        const oldText =
          messageInput.value.trim();

        messageInput.value =
          oldText
            ? oldText + " " + finalText.trim()
            : finalText.trim();

        messageInput.dispatchEvent(
          new Event("input")
        );

        voiceStatusText.textContent =
          "✓ লেখা পাওয়া গেছে";

      }

    };


    rec.onerror = event => {

      console.error(
        "VOICE ERROR:",
        event.error
      );

      isListening = false;

      stopVoiceUI();


      if (event.error === "not-allowed") {

        showToast(
          "🎙️ Microphone permission denied."
        );

      }

      else if (event.error === "no-speech") {

        showToast(
          "🎙️ কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।"
        );

      }

      else if (event.error === "audio-capture") {

        showToast(
          "🎙️ Microphone পাওয়া যাচ্ছে না।"
        );

      }

      else if (event.error === "network") {

        showToast(
          "🌐 Voice service connection সমস্যা।"
        );

      }

      else if (event.error !== "aborted") {

        showToast(
          "🎙️ Voice input চালু করা যায়নি।"
        );

      }

    };


    rec.onend = () => {

      console.log("VOICE: ENDED");

      isListening = false;

      stopVoiceUI();

    };


    return rec;

  }


  /* =========================================================
     VOICE SETUP
  ========================================================== */

  function setupVoiceRecognition() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      console.log(
        "Speech Recognition NOT supported."
      );

      recognition = null;

      return;

    }


    console.log(
      "Speech Recognition supported."
    );

    /*
      Don't create one permanent recognition object.
      A fresh one will be created every time.
    */

    recognition = null;

  }


  /* =========================================================
     VOICE TOGGLE
  ========================================================== */

  function toggleVoiceInput() {

    console.log(
      "MIC BUTTON CLICKED"
    );


    /* Stop current recognition */

    if (isListening) {

      console.log(
        "Stopping current voice..."
      );

      try {

        if (recognition) {
          recognition.stop();
        }

      } catch (error) {

        console.log(
          "Stop error:",
          error
        );

      }

      stopVoiceUI();

      return;

    }


    /*
      Create a completely NEW recognition
      object every time.
    */

    const newRecognition =
      createVoiceRecognition();


    if (!newRecognition) {

      showToast(
        "এই browser-এ Voice Recognition support নেই।"
      );

      return;

    }


    recognition =
      newRecognition;


    try {

      console.log(
        "Starting NEW voice recognition..."
      );

      recognition.start();

    }

    catch (error) {

      console.error(
        "VOICE START ERROR:",
        error
      );

      stopVoiceUI();


      if (
        error.name ===
        "InvalidStateError"
      ) {

        /*
          Wait and automatically reset.
        */

        recognition = null;

        showToast(
          "Voice engine reset হচ্ছে। আবার 🎙️ চাপুন।"
        );

      }

      else {

        recognition = null;

        showToast(
          "🎙️ Voice input শুরু করা যায়নি।"
        );

      }

    }

  }


  /* =========================================================
     STOP VOICE UI
  ========================================================== */

  function stopVoiceUI() {

    isListening = false;

    micBtn.classList.remove(
      "listening"
    );

    micBtn.textContent =
      "🎙️";

    voiceStatus.classList.remove(
      "show"
    );

  }


  /* =========================================================
     SEND MESSAGE
  ========================================================== */

  async function sendMessage() {

    const text =
      messageInput.value.trim();


    if (!text) {

      return;

    }


    /* Stop any currently playing speech */

    stopSpeaking();


    /* Hide home UI */

    hero.style.display = "none";

    quickTools.style.display = "none";

    modeRow.style.display = "flex";


    chatArea.classList.add("visible");


    const empty =
      document.getElementById("emptyChat");

    if (empty) {

      empty.remove();

    }


    /* Add user message */

    addMessage(
      "user",
      text
    );


    conversation.push({

      role: "user",

      content: text

    });


    saveConversation();


    /* Clear input */

    messageInput.value = "";

    messageInput.style.height = "auto";


    /* Typing indicator */

    const typingId =
      addTyping();


    try {

      const response =
        await fetch(API_URL, {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            message: text,

            prompt: text,

            mode: currentMode,

            history: conversation.slice(-12)

          })

        });


      removeTyping(typingId);


      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        );

      }


      const data =
        await response.json();


      const answer =
        extractAnswer(data);


      if (!answer) {

        throw new Error(
          "Empty AI response"
        );

      }


      /* Add AI message */

      addMessage(
        "assistant",
        answer
      );


      conversation.push({

        role: "assistant",

        content: answer

      });


      saveConversation();


    } catch (error) {

      console.error(
        "Emogigs AI error:",
        error
      );


      removeTyping(typingId);


      const errorMessage =
        "Sorry, I couldn't connect to Emogigs AI right now. Please try again.";


      addMessage(
        "assistant",
        errorMessage
      );

    }

  }


  /* =========================================================
     EXTRACT API RESPONSE
  ========================================================== */

  function extractAnswer(data) {

    if (!data) {

      return "";

    }


    /* Most common */

    if (typeof data === "string") {

      return data;

    }


    if (data.reply) {

      return data.reply;

    }


    if (data.response) {

      return data.response;

    }


    if (data.answer) {

      return data.answer;

    }


    if (data.message) {

      if (
        typeof data.message === "string"
      ) {

        return data.message;

      }

      if (data.message.content) {

        return data.message.content;

      }

    }


    /* OpenAI / Groq style */

    if (
      Array.isArray(data.choices) &&
      data.choices[0]
    ) {

      const choice =
        data.choices[0];


      if (choice.message) {

        return choice.message.content || "";

      }


      if (choice.text) {

        return choice.text;

      }

    }


    return "";

  }


  /* =========================================================
     ADD MESSAGE
  ========================================================== */

  function addMessage(
    role,
    text
  ) {

    const message =
      document.createElement("div");


    message.className =
      `message ${role}`;


    const avatar =
      document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
      role === "assistant"
        ? "✦"
        : "👤";


    const wrap =
      document.createElement("div");

    wrap.className =
      "bubble-wrap";


    const bubble =
      document.createElement("div");

    bubble.className =
      "bubble";


    bubble.textContent =
      text;


    wrap.appendChild(bubble);


    /* Actions */

    const actions =
      document.createElement("div");

    actions.className =
      "message-actions";


    if (role === "assistant") {

      /* Read aloud */

      const speakBtn =
        createActionButton(
          "🔊",
          "Read aloud"
        );


      speakBtn.addEventListener(
        "click",
        () => {

          speakText(
            text,
            speakBtn
          );

        }
      );


      /* Copy */

      const copyBtn =
        createActionButton(
          "📋",
          "Copy"
        );


      copyBtn.addEventListener(
        "click",
        async () => {

          await copyText(text);

          copyBtn.textContent = "✓";

          setTimeout(() => {

            copyBtn.textContent = "📋";

          }, 1200);

        }
      );


      /* Regenerate */

      const regenerateBtn =
        createActionButton(
          "↻",
          "Regenerate"
        );


      regenerateBtn.addEventListener(
        "click",
        () => {

          regenerateLastAnswer();

        }
      );


      actions.appendChild(
        speakBtn
      );

      actions.appendChild(
        copyBtn
      );

      actions.appendChild(
        regenerateBtn
      );

    }


    wrap.appendChild(actions);


    message.appendChild(avatar);

    message.appendChild(wrap);


    chatArea.appendChild(message);


    scrollToBottom();


    return message;

  }


  /* =========================================================
     ACTION BUTTON
  ========================================================== */

  function createActionButton(
    icon,
    title
  ) {

    const button =
      document.createElement("button");


    button.className =
      "small-btn";


    button.textContent =
      icon;


    button.title =
      title;


    button.setAttribute(
      "aria-label",
      title
    );


    return button;

  }


  /* =========================================================
     TEXT TO SPEECH
  ========================================================== */

  function speakText(
    text,
    button
  ) {

    if (
      !("speechSynthesis" in window)
    ) {

      showToast(
        "Text-to-speech is not supported."
      );

      return;

    }


    /* If THIS message is currently speaking,
       stop it. */

    if (
      currentSpeakingButton === button
    ) {

      stopSpeaking();

      return;

    }


    /* Stop previous speech */

    stopSpeaking();


    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    /*
      Automatically choose a good voice.
      Browser decides available language.
    */

    const voices =
      window.speechSynthesis.getVoices();


    const preferredVoice =
      voices.find(
        voice =>
          voice.lang &&
          (
            voice.lang
              .toLowerCase()
              .startsWith("en") ||
            voice.lang
              .toLowerCase()
              .startsWith("bn")
          )
      );


    if (preferredVoice) {

      utterance.voice =
        preferredVoice;

    }


    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;


    utterance.onstart = () => {

      currentSpeakingButton =
        button;

      button.classList.add(
        "speaking"
      );

      button.textContent =
        "⏹";

    };


    utterance.onend = () => {

      if (
        currentSpeakingButton ===
        button
      ) {

        currentSpeakingButton =
          null;

        button.classList.remove(
          "speaking"
        );

        button.textContent =
          "🔊";

      }

    };


    utterance.onerror = () => {

      if (
        currentSpeakingButton ===
        button
      ) {

        currentSpeakingButton =
          null;

        button.classList.remove(
          "speaking"
        );

        button.textContent =
          "🔊";

      }

    };


    window.speechSynthesis.speak(
      utterance
    );

  }


  /* =========================================================
     STOP SPEAKING
  ========================================================== */

  function stopSpeaking() {

    if (
      "speechSynthesis" in window
    ) {

      window.speechSynthesis.cancel();

    }


    if (
      currentSpeakingButton
    ) {

      currentSpeakingButton.classList.remove(
        "speaking"
      );

      currentSpeakingButton.textContent =
        "🔊";

    }


    currentSpeakingButton =
      null;

  }


  /* =========================================================
     COPY
  ========================================================== */

  async function copyText(text) {

    try {

      await navigator.clipboard.writeText(
        text
      );

      showToast(
        "Copied to clipboard"
      );

    } catch {

      showToast(
        "Copy failed"
      );

    }

  }


  /* =========================================================
     TYPING
  ========================================================== */

  function addTyping() {

    const id =
      "typing-" +
      Date.now();


    const message =
      document.createElement("div");


    message.className =
      "message assistant";


    message.id =
      id;


    const avatar =
      document.createElement("div");

    avatar.className =
      "avatar";

    avatar.textContent =
      "✦";


    const wrap =
      document.createElement("div");

    wrap.className =
      "bubble-wrap";


    const typing =
      document.createElement("div");

    typing.className =
      "bubble typing";


    typing.innerHTML =
      "<span></span><span></span><span></span>";


    wrap.appendChild(
      typing
    );


    message.appendChild(
      avatar
    );

    message.appendChild(
      wrap
    );


    chatArea.appendChild(
      message
    );


    scrollToBottom();


    return id;

  }


  function removeTyping(id) {

    const element =
      document.getElementById(id);


    if (element) {

      element.remove();

    }

  }


  /* =========================================================
     REGENERATE
  ========================================================== */

  async function regenerateLastAnswer() {

    if (
      conversation.length === 0
    ) {

      return;

    }


    let lastUserMessage = null;


    for (
      let i = conversation.length - 1;
      i >= 0;
      i--
    ) {

      if (
        conversation[i].role ===
        "user"
      ) {

        lastUserMessage =
          conversation[i].content;

        break;

      }

    }


    if (!lastUserMessage) {

      return;

    }


    messageInput.value =
      lastUserMessage;


    /* Remove latest assistant message */

    const messages =
      chatArea.querySelectorAll(
        ".message.assistant"
      );


    if (messages.length) {

      messages[
        messages.length - 1
      ].remove();

    }


    /* Remove last assistant from history */

    if (
      conversation[
        conversation.length - 1
      ]?.role === "assistant"
    ) {

      conversation.pop();

    }


    await sendMessage();

  }


  /* =========================================================
     NEW CHAT
  ========================================================== */

  function startNewChat() {

    stopSpeaking();

    conversation = [];

    localStorage.removeItem(
      STORAGE_KEY
    );


    chatArea.innerHTML = `
      <div class="empty-chat" id="emptyChat">
        <div class="empty-chat-icon">✦</div>

        <strong>
          Emogigs AI is ready
        </strong>

        Ask anything, type a message,
        or use your microphone.
      </div>
    `;


    chatArea.classList.remove(
      "visible"
    );


    hero.style.display =
      "block";


    quickTools.style.display =
      "block";


    modeRow.style.display =
      "flex";


    messageInput.value =
      "";

    messageInput.style.height =
      "auto";


    showToast(
      "New chat started"
    );

  }


  /* =========================================================
     LOCAL STORAGE
  ========================================================== */

  function saveConversation() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          conversation.slice(-30)
        )
      );

    } catch (error) {

      console.log(
        "Storage error:",
        error
      );

    }

  }


  function loadConversation() {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (!saved) {

        return;

      }


      conversation =
        JSON.parse(saved);


      if (
        !Array.isArray(
          conversation
        ) ||
        conversation.length === 0
      ) {

        conversation = [];

        return;

      }


      hero.style.display =
        "none";


      quickTools.style.display =
        "none";


      chatArea.classList.add(
        "visible"
      );


      const empty =
        document.getElementById(
          "emptyChat"
        );


      if (empty) {

        empty.remove();

      }


      conversation.forEach(item => {

        if (
          item.role === "user" ||
          item.role === "assistant"
        ) {

          addMessage(
            item.role,
            item.content
          );

        }

      });


    } catch (error) {

      console.log(
        "Could not load saved chat:",
        error
      );

    }

  }


  /* =========================================================
     SCROLL
  ========================================================== */

  function scrollToBottom() {

    setTimeout(() => {

      window.scrollTo({

        top:
          document.body.scrollHeight,

        behavior:
          "smooth"

      });

    }, 50);

  }


  /* =========================================================
     TOAST
  ========================================================== */

  let toastTimer;


  function showToast(
    message
  ) {

    toast.textContent =
      message;


    toast.classList.add(
      "show"
    );


    clearTimeout(
      toastTimer
    );


    toastTimer =
      setTimeout(() => {

        toast.classList.remove(
          "show"
        );

      }, 2200);

  }


  /* =========================================================
     LOAD SPEECH VOICES
  ========================================================== */

  if (
    "speechSynthesis" in window &&
    "onvoiceschanged" in window.speechSynthesis
  ) {

    window.speechSynthesis.onvoiceschanged =
      () => {

        window.speechSynthesis
          .getVoices();

      };

  }


})();