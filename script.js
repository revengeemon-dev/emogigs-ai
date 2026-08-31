/* =========================================================
   EMOGIGS AI
   Mobile AI Life OS
   CHAT + VOICE INPUT + READ ALOUD
   REBUILT VOICE SYSTEM
========================================================= */

(() => {

  "use strict";

  /* =========================================================
     CONFIG
  ========================================================== */

  const API_URL = "/api/chat";

  const STORAGE_KEY = "emogigs_ai_chat_v2";

  let currentMode = "General";

  let isListening = false;

  let recognition = null;

  let currentSpeakingButton = null;

  let conversation = [];

  let voiceStarting = false;

  let microphoneStream = null;


  /* =========================================================
     DOM
  ========================================================== */

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

    setupButtons();

    setupVoiceRecognition();

    loadConversation();

  });


  /* =========================================================
     BUTTONS
  ========================================================== */

  function setupButtons() {

    if (sendBtn) {

      sendBtn.addEventListener("click", () => {

        sendMessage();

      });

    }


    if (micBtn) {

      micBtn.addEventListener("click", () => {

        toggleVoiceInput();

      });

    }


    if (newChatBtn) {

      newChatBtn.addEventListener("click", () => {

        startNewChat();

      });

    }


    if (messageInput) {

      messageInput.addEventListener("keydown", event => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          sendMessage();

        }

      });

    }

  }


  /* =========================================================
     TEXTAREA
  ========================================================== */

  function setupTextarea() {

    if (!messageInput) return;

    messageInput.addEventListener("input", () => {

      messageInput.style.height = "auto";

      messageInput.style.height =
        Math.min(
          messageInput.scrollHeight,
          130
        ) + "px";

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

        modes.forEach(item => {

          item.classList.remove("active");

        });

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

        if (!messageInput) return;

        messageInput.value = prompt;

        messageInput.dispatchEvent(
          new Event("input")
        );

        sendMessage();

      });

    });

  }


  /* =========================================================
     VOICE RECOGNITION
  ========================================================== */

  function setupVoiceRecognition() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    /* -------------------------------------------------------
       Browser support check
    ------------------------------------------------------- */

    if (!SpeechRecognition) {

      console.log(
        "SpeechRecognition is not supported."
      );

      return;

    }


    recognition =
      new SpeechRecognition();


    /* -------------------------------------------------------
       LANGUAGE
       Bengali first because Emogigs is being used in
       Bengali environment.
    ------------------------------------------------------- */

    recognition.lang = "bn-BD";


    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;


    /* -------------------------------------------------------
       START
    ------------------------------------------------------- */

    recognition.onstart = () => {

      console.log(
        "Emogigs voice recognition started."
      );

      voiceStarting = false;

      isListening = true;

      micBtn.classList.add("listening");

      micBtn.textContent = "⏹";

      micBtn.setAttribute(
        "aria-label",
        "Stop voice input"
      );

      voiceStatus.classList.add("show");

      voiceStatusText.textContent =
        "Listening... speak now";

    };


    /* -------------------------------------------------------
       RESULT
    ------------------------------------------------------- */

    recognition.onresult = event => {

      let finalText = "";

      let interimText = "";


      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        const result =
          event.results[i];

        const transcript =
          result[0].transcript;


        if (result.isFinal) {

          finalText += transcript;

        } else {

          interimText += transcript;

        }

      }


      /* -----------------------------------------------------
         Final voice text
      ----------------------------------------------------- */

      if (finalText.trim()) {

        const cleanText =
          finalText.trim();


        if (messageInput) {

          const oldText =
            messageInput.value.trim();


          messageInput.value =
            oldText
              ? oldText + " " + cleanText
              : cleanText;


          messageInput.dispatchEvent(
            new Event("input")
          );

        }


        voiceStatusText.textContent =
          "Voice captured ✓";


        /* Small delay so user can see captured state */

        setTimeout(() => {

          if (!isListening) {

            voiceStatus.classList.remove(
              "show"
            );

          }

        }, 700);

      }


      /* -----------------------------------------------------
         Interim voice text
      ----------------------------------------------------- */

      else if (interimText.trim()) {

        voiceStatusText.textContent =
          "Listening: " +
          interimText.trim();

      }

    };


    /* -------------------------------------------------------
       ERROR
    ------------------------------------------------------- */

    recognition.onerror = event => {

      console.log(
        "Emogigs SpeechRecognition error:",
        event.error
      );


      voiceStarting = false;


      switch (event.error) {

        case "not-allowed":

          stopVoiceUI();

          showToast(
            "Microphone permission denied. Check Chrome microphone permission."
          );

          break;


        case "permission-denied":

          stopVoiceUI();

          showToast(
            "Microphone permission denied."
          );

          break;


        case "no-speech":

          stopVoiceUI();

          showToast(
            "No speech detected. Please speak closer to the microphone."
          );

          break;


        case "audio-capture":

          stopVoiceUI();

          showToast(
            "Microphone is unavailable. Check your phone microphone."
          );

          break;


        case "network":

          stopVoiceUI();

          showToast(
            "Voice service needs an internet connection."
          );

          break;


        case "aborted":

          stopVoiceUI();

          break;


        case "service-not-allowed":

          stopVoiceUI();

          showToast(
            "Chrome voice service is unavailable."
          );

          break;


        default:

          stopVoiceUI();

          showToast(
            "Voice input could not start. Please try again."
          );

      }

    };


    /* -------------------------------------------------------
       END
    ------------------------------------------------------- */

    recognition.onend = () => {

      console.log(
        "Emogigs SpeechRecognition ended."
      );

      stopVoiceUI();

    };

  }


  /* =========================================================
     MICROPHONE TEST
  ========================================================== */

  async function requestMicrophoneAccess() {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      throw new Error(
        "MICROPHONE_API_NOT_SUPPORTED"
      );

    }


    try {

      microphoneStream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });


      console.log(
        "Microphone access granted."
      );


      return true;

    } catch (error) {

      console.error(
        "Microphone access error:",
        error
      );


      throw error;

    }

  }


  /* =========================================================
     STOP MICROPHONE TEST STREAM
  ========================================================== */

  function releaseMicrophone() {

    if (!microphoneStream) {

      return;

    }


    microphoneStream
      .getTracks()
      .forEach(track => {

        track.stop();

      });


    microphoneStream = null;

  }


  /* =========================================================
     VOICE TOGGLE
  ========================================================== */

  async function toggleVoiceInput() {

    if (!recognition) {

      showToast(
        "Voice input is not supported by this browser."
      );

      return;

    }


    /* -------------------------------------------------------
       Already listening
    ------------------------------------------------------- */

    if (isListening) {

      try {

        recognition.stop();

      } catch (error) {

        console.log(error);

      }

      return;

    }


    /* -------------------------------------------------------
       Prevent double click / busy state
    ------------------------------------------------------- */

    if (voiceStarting) {

      showToast(
        "Voice system is starting. Please wait..."
      );

      return;

    }


    voiceStarting = true;


    try {

      /* -----------------------------------------------------
         First test actual microphone permission
      ----------------------------------------------------- */

      voiceStatus.classList.add("show");

      voiceStatusText.textContent =
        "Checking microphone...";


      await requestMicrophoneAccess();


      /*
        Release getUserMedia stream before starting
        SpeechRecognition.
      */

      releaseMicrophone();


      /* -----------------------------------------------------
         Start speech recognition
      ----------------------------------------------------- */

      voiceStatusText.textContent =
        "Starting voice input...";


      /*
        Small delay helps Chrome Android switch
        from microphone permission handling to
        SpeechRecognition.
      */

      await new Promise(resolve => {

        setTimeout(resolve, 150);

      });


      try {

        recognition.start();

      } catch (startError) {

        console.error(
          "SpeechRecognition start error:",
          startError
        );


        voiceStarting = false;

        stopVoiceUI();

        showToast(
          "Voice system is busy. Please wait and try again."
        );

      }

    } catch (error) {

      console.error(
        "Microphone permission failed:",
        error
      );


      voiceStarting = false;

      releaseMicrophone();

      stopVoiceUI();


      /* -----------------------------------------------------
         Permission denied
      ----------------------------------------------------- */

      if (
        error &&
        (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        )
      ) {

        showToast(
          "Microphone permission denied. Allow microphone for Chrome."
        );

        return;

      }


      /* -----------------------------------------------------
         Microphone not found
      ----------------------------------------------------- */

      if (
        error &&
        error.name === "NotFoundError"
      ) {

        showToast(
          "No microphone was found on this device."
        );

        return;

      }


      /* -----------------------------------------------------
         Microphone already busy
      ----------------------------------------------------- */

      if (
        error &&
        error.name === "NotReadableError"
      ) {

        showToast(
          "Microphone is being used by another app."
        );

        return;

      }


      /* -----------------------------------------------------
         Browser doesn't support microphone API
      ----------------------------------------------------- */

      if (
        error &&
        error.message ===
        "MICROPHONE_API_NOT_SUPPORTED"
      ) {

        showToast(
          "This browser cannot access the microphone."
        );

        return;

      }


      showToast(
        "Could not access the microphone."
      );

    }

  }


  /* =========================================================
     STOP VOICE UI
  ========================================================== */

  function stopVoiceUI() {

    isListening = false;

    voiceStarting = false;


    if (micBtn) {

      micBtn.classList.remove(
        "listening"
      );

      micBtn.textContent = "🎙️";

      micBtn.setAttribute(
        "aria-label",
        "Voice input"
      );

    }


    if (voiceStatus) {

      voiceStatus.classList.remove(
        "show"
      );

    }


    releaseMicrophone();

  }


  /* =========================================================
     SEND MESSAGE
  ========================================================== */

  async function sendMessage() {

    if (!messageInput) return;


    const text =
      messageInput.value.trim();


    if (!text) {

      return;

    }


    stopSpeaking();


    /* -------------------------------------------------------
       Stop voice if currently listening
    ------------------------------------------------------- */

    if (
      recognition &&
      isListening
    ) {

      try {

        recognition.stop();

      } catch (error) {

        console.log(error);

      }

    }


    /* -------------------------------------------------------
       Hide home UI
    ------------------------------------------------------- */

    if (hero) {

      hero.style.display = "none";

    }


    if (quickTools) {

      quickTools.style.display = "none";

    }


    if (modeRow) {

      modeRow.style.display = "flex";

    }


    if (chatArea) {

      chatArea.classList.add("visible");

    }


    const empty =
      document.getElementById("emptyChat");


    if (empty) {

      empty.remove();

    }


    /* -------------------------------------------------------
       User message
    ------------------------------------------------------- */

    addMessage(
      "user",
      text
    );


    conversation.push({

      role: "user",

      content: text

    });


    saveConversation();


    /* -------------------------------------------------------
       Clear input
    ------------------------------------------------------- */

    messageInput.value = "";

    messageInput.style.height = "auto";


    /* -------------------------------------------------------
       Typing indicator
    ------------------------------------------------------- */

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

            history:
              conversation.slice(-12)

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


      addMessage(
        "assistant",
        "Sorry, I couldn't connect to Emogigs AI right now. Please try again."
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


    if (
      typeof data === "string"
    ) {

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

    if (!chatArea) return null;


    const message =
      document.createElement("div");


    message.className =
      `message ${role}`;


    const avatar =
      document.createElement("div");


    avatar.className =
      "avatar";


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


    wrap.appendChild(
      bubble
    );


    /* -------------------------------------------------------
       ACTIONS
    ------------------------------------------------------- */

    const actions =
      document.createElement("div");


    actions.className =
      "message-actions";


    if (
      role === "assistant"
    ) {

      /* READ ALOUD */

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


      /* COPY */

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


      /* REGENERATE */

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


    wrap.appendChild(
      actions
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


    if (
      currentSpeakingButton === button
    ) {

      stopSpeaking();

      return;

    }


    stopSpeaking();


    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    const voices =
      window.speechSynthesis.getVoices();


    const preferredVoice =
      voices.find(
        voice => {

          if (!voice.lang) {

            return false;

          }


          const lang =
            voice.lang.toLowerCase();


          return (
            lang.startsWith("bn") ||
            lang.startsWith("en")
          );

        }
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

      if (
        navigator.clipboard
      ) {

        await navigator.clipboard.writeText(
          text
        );

        showToast(
          "Copied to clipboard"
        );

        return;

      }


      /* Fallback */

      const textarea =
        document.createElement("textarea");


      textarea.value = text;

      textarea.style.position =
        "fixed";

      textarea.style.opacity = "0";


      document.body.appendChild(
        textarea
      );


      textarea.select();

      document.execCommand("copy");


      textarea.remove();


      showToast(
        "Copied to clipboard"
      );

    } catch (error) {

      console.error(error);

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
        conversation[i].role === "user"
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


    messageInput.dispatchEvent(
      new Event("input")
    );


    const messages =
      chatArea.querySelectorAll(
        ".message.assistant"
      );


    if (messages.length) {

      messages[
        messages.length - 1
      ].remove();

    }


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


    if (
      recognition &&
      isListening
    ) {

      try {

        recognition.stop();

      } catch (error) {

        console.log(error);

      }

    }


    conversation = [];


    localStorage.removeItem(
      STORAGE_KEY
    );


    chatArea.innerHTML = `

      <div class="empty-chat" id="emptyChat">

        <div class="empty-chat-icon">
          ✦
        </div>

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
          (
            item.role === "user" ||
            item.role === "assistant"
          ) &&
          typeof item.content === "string"
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


  function showToast(message) {

    if (!toast) return;


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

      }, 3000);

  }


  /* =========================================================
     SPEECH VOICES
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