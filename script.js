/* =========================================================
   EMOGIGS AI — SCRIPT.JS
   PART 1 / 3

   EMOGIGS AI
   Mobile AI Life OS

   CORE SYSTEM
   ─────────────────────────────────────────────────────────
   💬 AI Chat foundation
   🎙️ Voice Input
   🔊 Read Aloud / Text-to-Speech
   📋 Copy
   ↻ Regenerate
   🆕 New Chat
   💾 Local Chat History
   🤖 General / Mode System

   👤 EMOGIGS ID / ACCOUNT
   🪪 Create / View / Remove Emogigs ID
   📱 Mobile-friendly Account Modal
   🎨 Dynamic Account Modal CSS
   🎤 Microphone permission handling

   PART 1 also creates the foundation for:
   🧠 AI Life OS
   🎯 Goals
   🔥 Streak
   📊 Statistics
   ⭐ Favorites
   🔎 Search
   ⚡ Focus Mode
   🧠 Local Memory
   ⚙️ Settings
   ========================================================= */

(() => {

  "use strict";


  /* =========================================================
     01 — CONFIGURATION
  ========================================================== */

  const API_URL = "/api/chat";

  const STORAGE_KEY =
    "emogigs_ai_chat_v3";

  const ACCOUNT_STORAGE_KEY =
    "emogigs_user_account_v2";

  const MEMORY_STORAGE_KEY =
    "emogigs_ai_memory_v1";

  const SETTINGS_STORAGE_KEY =
    "emogigs_ai_settings_v1";

  const GOALS_STORAGE_KEY =
    "emogigs_ai_goals_v1";

  const ACTIVITY_STORAGE_KEY =
    "emogigs_ai_activity_v1";

  const FAVORITES_STORAGE_KEY =
    "emogigs_ai_favorites_v1";


  /* =========================================================
     02 — GLOBAL STATE
  ========================================================== */

  let currentMode = "General";

  let isListening = false;

  let recognition = null;

  let currentSpeakingButton = null;

  let conversation = [];

  let voiceStarting = false;

  let microphoneStream = null;

  let toastTimer = null;

  let currentConversationId = null;

  let isOnline = navigator.onLine;

  let focusMode = false;

  let isSendingMessage = false;

  let accountModalCreated = false;


  /*
    AI Life OS state.

    These are intentionally stored locally for now.

    Later we can connect them to a real database/backend.
  */

  let aiMemory = [];

  let userGoals = [];

  let activityData = {

    totalMessages: 0,

    totalChats: 0,

    totalVoiceInputs: 0,

    totalAIReplies: 0,

    currentStreak: 0,

    lastActiveDate: null

  };

  let favorites = [];

  let settings = {

    autoSave: true,

    soundEffects: true,

    enterToSend: true,

    rememberMode: true,

    showSuggestions: true

  };


  /* =========================================================
     03 — DOM REFERENCES
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
     04 — INITIALIZATION
  ========================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      console.log(
        "🚀 Emogigs AI Life OS initializing..."
      );


      loadLocalSystems();

      setupTextarea();

      setupModes();

      setupQuickTools();

      setupButtons();

      setupAccountSystem();

      setupVoiceRecognition();

      setupOnlineStatus();

      setupKeyboardShortcuts();

      initializeAccountState();

      loadConversation();

      updateModeState();

      updateActivityUI();

      injectCoreStyles();


      console.log(
        "✅ Emogigs AI Life OS initialized."
      );

    }
  );


  /* =========================================================
     05 — LOCAL SYSTEM LOADER
  ========================================================== */

  function loadLocalSystems() {

    aiMemory =
      readLocalStorage(
        MEMORY_STORAGE_KEY,
        []
      );


    userGoals =
      readLocalStorage(
        GOALS_STORAGE_KEY,
        []
      );


    favorites =
      readLocalStorage(
        FAVORITES_STORAGE_KEY,
        []
      );


    activityData =
      readLocalStorage(
        ACTIVITY_STORAGE_KEY,
        {

          totalMessages: 0,

          totalChats: 0,

          totalVoiceInputs: 0,

          totalAIReplies: 0,

          currentStreak: 0,

          lastActiveDate: null

        }
      );


    settings =
      readLocalStorage(
        SETTINGS_STORAGE_KEY,
        {

          autoSave: true,

          soundEffects: true,

          enterToSend: true,

          rememberMode: true,

          showSuggestions: true

        }
      );


    /*
      Restore remembered mode.
    */

    if (
      settings.rememberMode
    ) {

      const savedMode =
        localStorage.getItem(
          "emogigs_current_mode"
        );


      if (savedMode) {

        currentMode =
          savedMode;

      }

    }

  }


  /* =========================================================
     06 — SAFE LOCAL STORAGE
  ========================================================== */

  function readLocalStorage(
    key,
    fallback
  ) {

    try {

      const saved =
        localStorage.getItem(key);


      if (!saved) {

        return fallback;

      }


      const parsed =
        JSON.parse(saved);


      return parsed;

    } catch (error) {

      console.warn(
        "Emogigs local storage read error:",
        key,
        error
      );


      return fallback;

    }

  }


  function writeLocalStorage(
    key,
    value
  ) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );


      return true;

    } catch (error) {

      console.warn(
        "Emogigs local storage write error:",
        key,
        error
      );


      return false;

    }

  }


  /* =========================================================
     07 — BUTTON SYSTEM
  ========================================================== */

  function setupButtons() {

    /*
      Send button
    */

    if (sendBtn) {

      sendBtn.addEventListener(
        "click",
        () => {

          sendMessage();

        }
      );

    }


    /*
      Microphone button
    */

    if (micBtn) {

      micBtn.addEventListener(
        "click",
        () => {

          toggleVoiceInput();

        }
      );

    }


    /*
      New chat
    */

    if (newChatBtn) {

      newChatBtn.addEventListener(
        "click",
        () => {

          startNewChat();

        }
      );

    }


    /*
      Message input
    */

    if (messageInput) {

      messageInput.addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {

            if (
              settings.enterToSend
            ) {

              event.preventDefault();

              sendMessage();

            }

          }

        }
      );

    }

  }


  /* =========================================================
     08 — TEXTAREA SYSTEM
  ========================================================== */

  function setupTextarea() {

    if (!messageInput) {

      return;

    }


    messageInput.addEventListener(
      "input",
      () => {

        messageInput.style.height =
          "auto";


        messageInput.style.height =
          Math.min(
            messageInput.scrollHeight,
            140
          ) + "px";

      }
    );

  }


  /* =========================================================
     09 — MODE SYSTEM
  ========================================================== */

  function setupModes() {

    const modes =
      document.querySelectorAll(
        ".mode-chip"
      );


    modes.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            modes.forEach(
              item => {

                item.classList.remove(
                  "active"
                );

              }
            );


            button.classList.add(
              "active"
            );


            currentMode =
              button.dataset.mode ||
              "General";


            if (
              settings.rememberMode
            ) {

              try {

                localStorage.setItem(
                  "emogigs_current_mode",
                  currentMode
                );

              } catch (error) {

                console.log(error);

              }

            }


            showToast(
              `${currentMode} mode selected`
            );


            /*
              AI Life OS can later use this
              mode to modify system prompts.
            */

            emitLifeOSEvent(
              "mode_changed",
              {

                mode:
                  currentMode

              }
            );

          }
        );

      }
    );

  }


  /* =========================================================
     10 — RESTORE MODE
  ========================================================== */

  function updateModeState() {

    const modes =
      document.querySelectorAll(
        ".mode-chip"
      );


    if (!modes.length) {

      return;

    }


    let found = false;


    modes.forEach(
      button => {

        const mode =
          button.dataset.mode ||
          "General";


        if (
          mode === currentMode
        ) {

          button.classList.add(
            "active"
          );

          found = true;

        } else {

          button.classList.remove(
            "active"
          );

        }

      }
    );


    /*
      If remembered mode no longer exists,
      return to General.
    */

    if (!found) {

      currentMode =
        "General";


      const general =
        document.querySelector(
          ".mode-chip[data-mode='General']"
        );


      if (general) {

        general.classList.add(
          "active"
        );

      }

    }

  }


  /* =========================================================
     11 — QUICK AI TOOLS
  ========================================================== */

  function setupQuickTools() {

    const cards =
      document.querySelectorAll(
        ".quick-card"
      );


    cards.forEach(
      card => {

        card.addEventListener(
          "click",
          () => {

            const prompt =
              card.dataset.prompt ||
              "";


            if (!messageInput) {

              return;

            }


            messageInput.value =
              prompt;


            messageInput.dispatchEvent(
              new Event("input")
            );


            sendMessage();

          }
        );

      }
    );

  }


  /* =========================================================
     12 — ACCOUNT / EMOGIGS ID SYSTEM
  ========================================================== */

  function setupAccountSystem() {

    /*
      Supports multiple possible
      account button selectors.

      This makes the system compatible
      with your existing HTML.
    */

    const accountButtons =
      document.querySelectorAll(
        [
          "#accountBtn",
          "#accountButton",
          ".account-btn",
          ".account-button",
          "[data-action='account']",
          "[data-account]"
        ].join(",")
      );


    if (!accountButtons.length) {

      console.log(
        "ℹ️ Emogigs Account button was not found."
      );


      return;

    }


    accountButtons.forEach(
      button => {

        /*
          Avoid attaching the same listener
          multiple times.
        */

        if (
          button.dataset.emogigsAccountBound ===
          "true"
        ) {

          return;

        }


        button.dataset.emogigsAccountBound =
          "true";


        button.addEventListener(
          "click",
          event => {

            event.preventDefault();

            event.stopPropagation();

            openAccountModal();

          }
        );

      }
    );


    console.log(
      "👤 Emogigs Account system initialized."
    );

  }


  /* =========================================================
     13 — OPEN ACCOUNT MODAL
  ========================================================== */

  function openAccountModal() {

    let modal =
      document.getElementById(
        "emogigsAccountModal"
      );


    if (!modal) {

      modal =
        createAccountModal();

    }


    updateAccountModal();


    injectAccountModalStyles();


    modal.classList.add(
      "show"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "emogigs-modal-open"
    );


    setTimeout(
      () => {

        const firstInput =
          modal.querySelector(
            "input"
          );


        if (
          firstInput &&
          !getEmogigsAccount()
        ) {

          firstInput.focus();

        }

      },
      100
    );

  }


  /* =========================================================
     14 — CREATE ACCOUNT MODAL
  ========================================================== */

  function createAccountModal() {

    const modal =
      document.createElement(
        "div"
      );


    modal.id =
      "emogigsAccountModal";


    modal.className =
      "emogigs-account-modal";


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    modal.innerHTML = `

      <div
        class="emogigs-account-backdrop"
        data-close-account="true">
      </div>


      <div
        class="emogigs-account-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emogigsAccountTitle">


        <button
          type="button"
          class="emogigs-account-close"
          id="emogigsAccountClose"
          aria-label="Close account">

          ×

        </button>


        <div class="emogigs-account-icon">
          ✦
        </div>


        <div class="emogigs-account-content">


          <div
            class="emogigs-account-badge">
            EMOGIGS AI
          </div>


          <h2
            id="emogigsAccountTitle">

            Create Emogigs ID

          </h2>


          <p
            class="emogigs-account-subtitle">

            Create your free Emogigs ID
            to personalize your AI Life OS
            experience.

          </p>


          <div
            id="emogigsExistingAccount"
            class="emogigs-existing-account"
            style="display:none;">
          </div>


          <form
            id="emogigsAccountForm"
            autocomplete="off">


            <div class="emogigs-field">