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
            <label for="emogigsName">
              Your name
            </label>


            <input
              type="text"
              id="emogigsName"
              name="name"
              placeholder="Enter your name"
              maxlength="40"
              autocomplete="name"
              required>

          </div>


          <div class="emogigs-field">

            <label for="emogigsUsername">
              Emogigs ID
            </label>


            <div
              class="emogigs-username-wrapper">

              <span>@</span>


              <input
                type="text"
                id="emogigsUsername"
                name="username"
                placeholder="Choose your ID"
                maxlength="20"
                autocomplete="username"
                required>

            </div>


            <small>
              3–20 characters.
              Letters, numbers and underscore.
            </small>

          </div>


          <button
            type="submit"
            class="emogigs-create-id-btn"
            id="emogigsCreateIdBtn">

            Create Emogigs ID

          </button>


        </form>


        <button
          type="button"
          id="emogigsContinueBtn"
          class="emogigs-continue-btn"
          style="display:none;">

          Continue to Emogigs AI

        </button>


        <button
          type="button"
          id="emogigsDeleteAccountBtn"
          class="emogigs-delete-btn"
          style="display:none;">

          Remove this ID from this device

        </button>


      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  accountModalCreated =
    true;


  /*
    Close button
  */

  const closeBtn =
    modal.querySelector(
      "#emogigsAccountClose"
    );


  if (closeBtn) {

    closeBtn.addEventListener(
      "click",
      closeAccountModal
    );

  }


  /*
    Backdrop
  */

  const backdrop =
    modal.querySelector(
      "[data-close-account='true']"
    );


  if (backdrop) {

    backdrop.addEventListener(
      "click",
      closeAccountModal
    );

  }


  /*
    Account form
  */

  const form =
    modal.querySelector(
      "#emogigsAccountForm"
    );


  if (form) {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        createEmogigsID();

      }
    );

  }


  /*
    Continue
  */

  const continueBtn =
    modal.querySelector(
      "#emogigsContinueBtn"
    );


  if (continueBtn) {

    continueBtn.addEventListener(
      "click",
      closeAccountModal
    );

  }


  /*
    Remove ID
  */

  const deleteBtn =
    modal.querySelector(
      "#emogigsDeleteAccountBtn"
    );


  if (deleteBtn) {

    deleteBtn.addEventListener(
      "click",
      removeEmogigsID
    );

  }


  /*
    Username formatting.
  */

  const usernameInput =
    modal.querySelector(
      "#emogigsUsername"
    );


  if (usernameInput) {

    usernameInput.addEventListener(
      "input",
      () => {

        usernameInput.value =
          usernameInput.value
            .replace(/\s+/g, "")
            .replace(
              /[^a-zA-Z0-9_]/g,
              ""
            )
            .slice(0, 20);

      }
    );

  }


  /*
    Escape key.
  */

  if (
    !modal.dataset.escapeBound
  ) {

    modal.dataset.escapeBound =
      "true";


    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          modal.classList.contains(
            "show"
          )
        ) {

          closeAccountModal();

        }

      }
    );

  }


  /*
    Inject account CSS.
  */

  injectAccountModalStyles();


  return modal;

}


/* =========================================================
   15 — UPDATE ACCOUNT MODAL
========================================================== */

function updateAccountModal() {

  const account =
    getEmogigsAccount();


  const title =
    document.getElementById(
      "emogigsAccountTitle"
    );


  const subtitle =
    document.querySelector(
      ".emogigs-account-subtitle"
    );


  const form =
    document.getElementById(
      "emogigsAccountForm"
    );


  const existing =
    document.getElementById(
      "emogigsExistingAccount"
    );


  const continueBtn =
    document.getElementById(
      "emogigsContinueBtn"
    );


  const deleteBtn =
    document.getElementById(
      "emogigsDeleteAccountBtn"
    );


  if (account) {

    if (title) {

      title.textContent =
        "Your Emogigs ID";

    }


    if (subtitle) {

      subtitle.textContent =
        "Your Emogigs ID is saved on this device.";

    }


    if (form) {

      form.style.display =
        "none";

    }


    if (existing) {

      existing.style.display =
        "block";


      existing.innerHTML = `

        <div
          class="emogigs-profile-card">


          <div
            class="emogigs-profile-avatar">

            ${escapeHTML(
              getInitials(
                account.name
              )
            )}

          </div>


          <div
            class="emogigs-profile-info">

            <strong>

              ${escapeHTML(
                account.name
              )}

            </strong>


            <span>

              @${escapeHTML(
                account.username
              )}

            </span>

          </div>


        </div>


        <div
          class="emogigs-id-success">

          ✓ Emogigs ID is active

        </div>


        <div
          class="emogigs-account-local-note">

          🔒 Your ID is currently stored
          on this device.

        </div>

      `;

    }


    if (continueBtn) {

      continueBtn.style.display =
        "block";

    }


    if (deleteBtn) {

      deleteBtn.style.display =
        "block";

    }

  } else {

    if (title) {

      title.textContent =
        "Create Emogigs ID";

    }


    if (subtitle) {

      subtitle.textContent =
        "Create your free Emogigs ID to personalize your AI Life OS experience.";

    }


    if (form) {

      form.style.display =
        "block";

    }


    if (existing) {

      existing.style.display =
        "none";

    }


    if (continueBtn) {

      continueBtn.style.display =
        "none";

    }


    if (deleteBtn) {

      deleteBtn.style.display =
        "none";

    }

  }

}


/* =========================================================
   16 — CREATE EMOGIGS ID
========================================================== */

function createEmogigsID() {

  const nameInput =
    document.getElementById(
      "emogigsName"
    );


  const usernameInput =
    document.getElementById(
      "emogigsUsername"
    );


  if (
    !nameInput ||
    !usernameInput
  ) {

    return;

  }


  const name =
    nameInput.value.trim();


  const username =
    usernameInput.value
      .trim()
      .toLowerCase();


  if (
    name.length < 2
  ) {

    showToast(
      "Please enter your name."
    );


    nameInput.focus();


    return;

  }


  if (
    !/^[a-zA-Z0-9_]{3,20}$/.test(
      username
    )
  ) {

    showToast(
      "Emogigs ID must be 3–20 characters."
    );


    usernameInput.focus();


    return;

  }


  const account = {

    name,

    username,

    createdAt:
      new Date().toISOString(),

    version:
      2

  };


  const saved =
    writeLocalStorage(
      ACCOUNT_STORAGE_KEY,
      account
    );


  if (!saved) {

    showToast(
      "Could not save Emogigs ID on this device."
    );


    return;

  }


  /*
    Create first memory entry.
  */

  rememberLocally(
    `User's name is ${name}.`,
    "profile"
  );


  updateAccountModal();

  updateAccountButton();


  showToast(
    `Welcome to Emogigs, ${name}! ✨`
  );


  emitLifeOSEvent(
    "account_created",
    {

      username

    }
  );

}


/* =========================================================
   17 — GET EMOGIGS ACCOUNT
========================================================== */

function getEmogigsAccount() {

  try {

    const saved =
      localStorage.getItem(
        ACCOUNT_STORAGE_KEY
      );


    if (!saved) {

      return null;

    }


    const account =
      JSON.parse(saved);


    if (
      !account ||
      typeof account !== "object"
    ) {

      return null;

    }


    if (
      !account.name ||
      !account.username
    ) {

      return null;

    }


    return account;

  } catch (error) {

    console.warn(
      "Could not read Emogigs ID:",
      error
    );


    return null;

  }

}


/* =========================================================
   18 — REMOVE EMOGIGS ID
========================================================== */

function removeEmogigsID() {

  const confirmed =
    window.confirm(
      "Remove your Emogigs ID from this device?"
    );


  if (!confirmed) {

    return;

  }


  try {

    localStorage.removeItem(
      ACCOUNT_STORAGE_KEY
    );

  } catch (error) {

    console.log(error);

  }


  updateAccountModal();

  updateAccountButton();


  showToast(
    "Emogigs ID removed from this device."
  );


  emitLifeOSEvent(
    "account_removed",
    {}
  );

}


/* =========================================================
   19 — UPDATE ACCOUNT BUTTON
========================================================== */

function updateAccountButton() {

  const account =
    getEmogigsAccount();


  const buttons =
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


  buttons.forEach(
    button => {

      if (!account) {

        button.removeAttribute(
          "data-emogigs-user"
        );

        button.removeAttribute(
          "title"
        );

        return;

      }


      button.setAttribute(
        "data-emogigs-user",
        account.username
      );


      button.setAttribute(
        "title",
        `Emogigs ID: @${account.username}`
      );


      button.setAttribute(
        "aria-label",
        `Emogigs account @${account.username}`
      );

    }
  );

}


/* =========================================================
   20 — INITIAL ACCOUNT STATE
========================================================== */

function initializeAccountState() {

  const account =
    getEmogigsAccount();


  if (account) {

    updateAccountButton();

  }

}


/* =========================================================
   21 — CLOSE ACCOUNT MODAL
========================================================== */

function closeAccountModal() {

  const modal =
    document.getElementById(
      "emogigsAccountModal"
    );


  if (!modal) {

    return;

  }


  modal.classList.remove(
    "show"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "emogigs-modal-open"
  );

}


/* =========================================================
   22 — GET INITIALS
========================================================== */

function getInitials(name) {

  const words =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (!words.length) {

    return "E";

  }


  if (
    words.length === 1
  ) {

    return words[0]
      .substring(0, 2)
      .toUpperCase();

  }


  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();

}


/* =========================================================
   23 — ESCAPE HTML
========================================================== */

function escapeHTML(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   24 — ACCOUNT MODAL CSS
========================================================== */

function injectAccountModalStyles() {

  if (
    document.getElementById(
      "emogigsAccountModalStyles"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "emogigsAccountModalStyles";


  style.textContent = `

    body.emogigs-modal-open {
      overflow: hidden;
    }


    .emogigs-account-modal {

      position: fixed;

      inset: 0;

      z-index: 99999;

      display: flex;

      align-items: center;

      justify-content: center;

      padding: 18px;

      opacity: 0;

      visibility: hidden;

      transition:
        opacity .22s ease,
        visibility .22s ease;

    }


    .emogigs-account-modal.show {

      opacity: 1;

      visibility: visible;

    }


    .emogigs-account-backdrop {

      position: absolute;

      inset: 0;

      background:
        rgba(0,0,0,.66);

      backdrop-filter:
        blur(9px);

      -webkit-backdrop-filter:
        blur(9px);

    }


    .emogigs-account-dialog {

      position: relative;

      z-index: 2;

      width: min(
        100%,
        430px
      );

      max-height: 90vh;

      overflow-y: auto;

      background:
        linear-gradient(
          145deg,
          #17172a,
          #0c0c16
        );

      border:
        1px solid
        rgba(
          255,
          255,
          255,
          .12
        );

      border-radius: 26px;

      padding:
        30px 22px 22px;

      box-shadow:
        0 30px 90px
        rgba(
          0,
          0,
          0,
          .52
        );

      transform:
        translateY(20px)
        scale(.96);

      transition:
        transform .25s ease;

    }


    .emogigs-account-modal.show
    .emogigs-account-dialog {

      transform:
        translateY(0)
        scale(1);

    }


    .emogigs-account-close {

      position: absolute;

      top: 10px;

      right: 12px;

      width: 38px;

      height: 38px;

      border: 0;

      border-radius: 50%;

      background:
        rgba(
          255,
          255,
          255,
          .08
        );

      color: white;

      font-size: 25px;

      cursor: pointer;

      display: flex;

      align-items: center;

      justify-content: center;

    }


    .emogigs-account-icon {

      width: 64px;

      height: 64px;

      margin:
        0 auto 13px;

      border-radius: 20px;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 31px;

      background:
        linear-gradient(
          135deg,
          #7c5cff,
          #b36cff
        );

      color: white;

      box-shadow:
        0 12px 34px
        rgba(
          124,
          92,
          255,
          .30
        );

    }


    .emogigs-account-content {

      text-align: center;

    }


    .emogigs-account-badge {

      display: inline-flex;

      align-items: center;

      justify-content: center;

      padding:
        5px 9px;

      margin-bottom: 8px;

      border-radius: 999px;

      background:
        rgba(
          124,
            92,
            255,
            .12
          );

        border:
          1px solid
          rgba(
            124,
            92,
            255,
            .22
          );

        color:
          rgba(
            255,
            255,
            255,
            .70
          );

        font-size: 9px;

        font-weight: 800;

        letter-spacing:
          1.5px;

      }


      .emogigs-account-content h2 {

        margin:
          0 0 8px;

        color: white;

        font-size: 24px;

        font-weight: 750;

      }


      .emogigs-account-subtitle {

        margin:
          0 auto 22px;

        max-width: 340px;

        color:
          rgba(
            255,
            255,
            255,
            .65
          );

        line-height: 1.5;

        font-size: 14px;

      }


      .emogigs-field {

        text-align: left;

        margin-bottom: 15px;

      }


      .emogigs-field label {

        display: block;

        margin-bottom: 7px;

        color:
          rgba(
            255,
            255,
            255,
            .86
          );

        font-size: 13px;

        font-weight: 650;

      }


      .emogigs-field input {

        box-sizing: border-box;

        width: 100%;

        height: 50px;

        padding:
          0 15px;

        border-radius: 13px;

        border:
          1px solid
          rgba(
            255,
            255,
            255,
            .12
          );

        outline: none;

        background:
          rgba(
            255,
            255,
            255,
            .06
          );

        color: white;

        font-size: 15px;

        transition:
          border-color .2s,
          background .2s;

      }


      .emogigs-field input:focus {

        border-color:
          rgba(
            124,
            92,
            255,
            .78
          );

        background:
          rgba(
            255,
            255,
            255,
            .09
          );

      }


      .emogigs-field input::placeholder {

        color:
          rgba(
            255,
            255,
            255,
            .35
          );

      }


      .emogigs-field small {

        display: block;

        margin-top: 6px;

        color:
          rgba(
            255,
            255,
            255,
            .42
          );

        font-size: 11px;

      }


      .emogigs-username-wrapper {

        position: relative;

      }


      .emogigs-username-wrapper > span {

        position: absolute;

        left: 14px;

        top: 50%;

        transform:
          translateY(-50%);

        color:
          rgba(
            255,
            255,
            255,
            .42
          );

        font-size: 15px;

        pointer-events: none;

      }


      .emogigs-username-wrapper input {

        padding-left: 29px;

      }


      .emogigs-create-id-btn,
      .emogigs-continue-btn {

        width: 100%;

        height: 51px;

        border: 0;

        border-radius: 14px;

        background:
          linear-gradient(
            135deg,
            #7c5cff,
            #a66cff
          );

        color: white;

        font-size: 15px;

        font-weight: 700;

        cursor: pointer;

        margin-top: 6px;

        box-shadow:
          0 11px 27px
          rgba(
            124,
            92,
            255,
            .23
          );

        transition:
          transform .15s ease;

      }


      .emogigs-create-id-btn:active,
      .emogigs-continue-btn:active {

        transform:
          scale(.98);

      }


      .emogigs-existing-account {

        margin-bottom: 18px;

      }


      .emogigs-profile-card {

        display: flex;

        align-items: center;

        gap: 13px;

        padding: 15px;

        border-radius: 16px;

        background:
          rgba(
            255,
            255,
            255,
            .06
          );

        border:
          1px solid
          rgba(
            255,
            255,
            255,
            .08
          );

        text-align: left;

      }


      .emogigs-profile-avatar {

        width: 48px;

        height: 48px;

        flex-shrink: 0;

        border-radius: 50%;

        display: flex;

        align-items: center;

        justify-content: center;

        background:
          linear-gradient(
            135deg,
            #7c5cff,
            #a66cff
          );

        color: white;

        font-weight: 750;

      }


      .emogigs-profile-info {

        display: flex;

        flex-direction: column;

        gap: 4px;

      }


      .emogigs-profile-info strong {

        color: white;

        font-size: 15px;

      }


      .emogigs-profile-info span {

        color:
          rgba(
            255,
            255,
            255,
            .55
          );

        font-size: 13px;

      }


      .emogigs-id-success {

        margin-top: 10px;

        color:
          #75e6a5;

        font-size: 13px;

      }


      .emogigs-account-local-note {

        margin-top: 9px;

        color:
          rgba(
            255,
            255,
            255,
            .40
          );

        font-size: 11px;

      }


      .emogigs-delete-btn {

        display: block;

        width: 100%;

        border: 0;

        background: transparent;

        color:
          rgba(
            255,
            255,
            255,
            .42
          );

        padding:
          15px 5px 4px;

        font-size: 12px;

        cursor: pointer;

      }


      @media (max-width: 480px) {

        .emogigs-account-modal {

          padding: 10px;

          align-items: flex-end;

        }


        .emogigs-account-dialog {

          width: 100%;

          border-radius:
            25px 25px 18px 18px;

          padding:
            25px 18px 18px;

          max-height: 88vh;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* =========================================================
     25 — VOICE RECOGNITION
  ========================================================== */

  function setupVoiceRecognition() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      console.log(
        "⚠️ SpeechRecognition is not supported."
      );


      if (micBtn) {

        micBtn.setAttribute(
          "title",
          "Voice input is not supported"
        );

      }


      return;

    }


    recognition =
      new SpeechRecognition();


    recognition.lang =
      "bn-BD";


    recognition.continuous =
      false;


    recognition.interimResults =
      true;


    recognition.maxAlternatives =
      1;


    recognition.onstart =
      () => {

        console.log(
          "🎙️ Emogigs voice recognition started."
        );


        voiceStarting =
          false;


        isListening =
          true;


        if (micBtn) {

          micBtn.classList.add(
            "listening"
          );


          micBtn.textContent =
            "⏹";


          micBtn.setAttribute(
            "aria-label",
            "Stop voice input"
          );

        }


        if (voiceStatus) {

          voiceStatus.classList.add(
            "show"
          );

        }


        if (voiceStatusText) {

          voiceStatusText.textContent =
            "Listening... speak now";

        }

      };


    recognition.onresult =
      event => {

        let finalText =
          "";

        let interimText =
          "";


        for (
          let i =
            event.resultIndex;

          i <
            event.results.length;

          i++
        ) {

          const result =
            event.results[i];


          const transcript =
            result[0].transcript;


          if (
            result.isFinal
          ) {

            finalText +=
              transcript;

          } else {

            interimText +=
              transcript;

          }

        }


        if (
          finalText.trim()
        ) {

          const cleanText =
            finalText.trim();


          if (messageInput) {

            const oldText =
              messageInput.value.trim();


            messageInput.value =
              oldText
                ? oldText +
                  " " +
                  cleanText
                : cleanText;


            messageInput.dispatchEvent(
              new Event("input")
            );

          }


          activityData.totalVoiceInputs =
            Number(
              activityData.totalVoiceInputs ||
              0
            ) + 1;


          saveActivityData();


          if (voiceStatusText) {

            voiceStatusText.textContent =
              "Voice captured ✓";

          }


          emitLifeOSEvent(
            "voice_input",
            {
              text:
                cleanText
            }
          );


          setTimeout(
            () => {

              if (
                !isListening &&
                voiceStatus
              ) {

                voiceStatus.classList.remove(
                  "show"
                );

              }

            },
            700
          );

        }
        else if (
          interimText.trim()
        ) {

          if (voiceStatusText) {

            voiceStatusText.textContent =
              "Listening: " +
              interimText.trim();

          }

        }

      };


    recognition.onerror =
      event => {

        console.log(
          "🎙️ SpeechRecognition error:",
          event.error
        );


        voiceStarting =
          false;


        switch (
          event.error
        ) {

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
              "No speech detected. Please try again."
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


    recognition.onend =
      () => {

        console.log(
          "🎙️ Emogigs SpeechRecognition ended."
        );


        stopVoiceUI();

      };

  }


  /* =========================================================
     26 — MICROPHONE ACCESS
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
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true
          }
        );


      console.log(
        "🎤 Microphone access granted."
      );


      return true;

    } catch (error) {

      console.error(
        "🎤 Microphone access error:",
        error
      );


      throw error;

    }

  }


  /* =========================================================
     27 — RELEASE MICROPHONE
  ========================================================== */

  function releaseMicrophone() {

    if (!microphoneStream) {

      return;

    }


    microphoneStream
      .getTracks()
      .forEach(
        track => {

          track.stop();

        }
      );


    microphoneStream =
      null;

  }


  /* =========================================================
     28 — VOICE INPUT TOGGLE
  ========================================================== */

  async function toggleVoiceInput() {

    if (!recognition) {

      showToast(
        "Voice input is not supported by this browser."
      );


      return;

    }


    if (isListening) {

      try {

        recognition.stop();

      } catch (error) {

        console.log(error);

      }


      return;

    }


    if (voiceStarting) {

      showToast(
        "Voice system is starting. Please wait..."
      );


      return;

    }


    voiceStarting =
      true;


    try {

      if (voiceStatus) {

        voiceStatus.classList.add(
          "show"
        );

      }


      if (voiceStatusText) {

        voiceStatusText.textContent =
          "Checking microphone...";

      }


      await requestMicrophoneAccess();


      releaseMicrophone();


      if (voiceStatusText) {

        voiceStatusText.textContent =
          "Starting voice input...";

      }


      await new Promise(
        resolve => {

          setTimeout(
            resolve,
            150
          );

        }
      );


      try {

        recognition.start();

      } catch (startError) {

        console.error(
          "SpeechRecognition start error:",
          startError
        );


        voiceStarting =
          false;


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


      voiceStarting =
        false;


      releaseMicrophone();


      stopVoiceUI();


      if (
        error &&
        (
          error.name ===
            "NotAllowedError" ||

          error.name ===
            "PermissionDeniedError"
        )
      ) {

        showToast(
          "Microphone permission denied. Allow microphone for Chrome."
        );


        return;

      }


      if (
        error &&
        error.name ===
          "NotFoundError"
      ) {

        showToast(
          "No microphone was found on this device."
        );


        return;

      }


      if (
        error &&
        error.name ===
          "NotReadableError"
      ) {

        showToast(
          "Microphone is being used by another app."
        );


        return;

      }


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
     29 — STOP VOICE UI
  ========================================================== */

  function stopVoiceUI() {

    isListening =
      false;


    voiceStarting =
      false;


    if (micBtn) {

      micBtn.classList.remove(
        "listening"
      );


      micBtn.textContent =
        "🎙️";


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
     30 — ONLINE / OFFLINE SYSTEM
  ========================================================== */

  function setupOnlineStatus() {

    window.addEventListener(
      "online",
      () => {

        isOnline =
          true;


        showToast(
          "Internet connection restored ✓"
        );


        emitLifeOSEvent(
          "online",
          {}
        );

      }
    );


    window.addEventListener(
      "offline",
      () => {

        isOnline =
          false;


        showToast(
          "You are offline. Local features still work."
        );


        emitLifeOSEvent(
          "offline",
          {}
        );

      }
    );

  }


  /* =========================================================
     31 — KEYBOARD SHORTCUTS
  ========================================================== */

  function setupKeyboardShortcuts() {

    document.addEventListener(
      "keydown",
      event => {

        if (
          (event.ctrlKey ||
            event.metaKey) &&
          event.key.toLowerCase() ===
            "k"
        ) {

          event.preventDefault();


          if (messageInput) {

            messageInput.focus();

          }

        }


        if (
          event.key ===
            "Escape"
        ) {

          if (
            isListening &&
            recognition
          ) {

            try {

              recognition.stop();

            } catch (error) {

              console.log(error);

            }

          }


          stopSpeaking();

        }

      }
    );

  }


  /* =========================================================
     32 — LOCAL AI MEMORY FOUNDATION
  ========================================================== */

  function rememberLocally(
    text,
    category = "general"
  ) {

    if (
      !text ||
      typeof text !== "string"
    ) {

      return;

    }


    const clean =
      text.trim();


    if (!clean) {

      return;

    }


    const duplicate =
      aiMemory.some(
        item =>
          item &&
          item.text ===
            clean
      );


    if (duplicate) {

      return;

    }


    aiMemory.push({

      id:
        createUniqueId(
          "memory"
        ),

      text:
        clean,

      category,

      createdAt:
        new Date().toISOString()

    });


    if (
      aiMemory.length >
      100
    ) {

      aiMemory =
        aiMemory.slice(
          -100
        );

    }


    writeLocalStorage(
      MEMORY_STORAGE_KEY,
      aiMemory
    );

  }


  function getLocalMemory() {

    return [
      ...aiMemory
    ];

  }


  /* =========================================================
     33 — ACTIVITY SYSTEM
  ========================================================== */

  function registerActivity(
    type = "message"
  ) {

    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10
        );


    if (
      activityData.lastActiveDate !==
      today
    ) {

      updateStreak(
        today
      );

    }


    if (
      type === "message"
    ) {

      activityData.totalMessages =
        Number(
          activityData.totalMessages ||
          0
        ) + 1;

    }


    if (
      type === "ai"
    ) {

      activityData.totalAIReplies =
        Number(
          activityData.totalAIReplies ||
          0
        ) + 1;

    }


    saveActivityData();


    updateActivityUI();

  }


  function updateStreak(
    today
  ) {

    if (
      !activityData.lastActiveDate
    ) {

      activityData.currentStreak =
        1;

      activityData.lastActiveDate =
        today;


      return;

    }


    const previous =
      new Date(
        activityData.lastActiveDate
      );


    const current =
      new Date(
        today
      );


    const difference =
      Math.round(
        (
          current -
          previous
        ) /
        (
          1000 *
          60 *
          60 *
          24
        )
      );


    if (
      difference === 1
    ) {

      activityData.currentStreak =
        Number(
          activityData.currentStreak ||
          0
        ) + 1;

    }
    else if (
      difference > 1
    ) {

      activityData.currentStreak =
        1;

    }


    activityData.lastActiveDate =
      today;

  }


  function saveActivityData() {

    writeLocalStorage(
      ACTIVITY_STORAGE_KEY,
      activityData
    );

  }


  function updateActivityUI() {

    const streakElements =
      document.querySelectorAll(
        "[data-emogigs-streak]"
      );


    streakElements.forEach(
      element => {

        element.textContent =
          activityData.currentStreak ||
          0;

      }
    );


    const messageElements =
      document.querySelectorAll(
        "[data-emogigs-messages]"
      );


    messageElements.forEach(
      element => {

        element.textContent =
          activityData.totalMessages ||
          0;

      }
    );

  }


  /* =========================================================
     34 — LIFE OS EVENT BUS
  ========================================================== */

  function emitLifeOSEvent(
    name,
    detail
  ) {

    try {

      document.dispatchEvent(
        new CustomEvent(
          `emogigs:${name}`,
          {
            detail:
              detail || {}
          }
        )
      );

    } catch (error) {

      console.log(
        "Life OS event error:",
        error
      );

    }

  }


  /* =========================================================
     35 — UNIQUE ID GENERATOR
  ========================================================== */

  function createUniqueId(
    prefix = "id"
  ) {

    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random()
        .toString(36)
        .substring(2, 9)
    );

  }


  /* =========================================================
     36 — TOAST SYSTEM
  ========================================================== */

  function showToast(
    message
  ) {

    if (!toast) {

      console.log(
        "Emogigs Toast:",
        message
      );


      return;

    }


    toast.textContent =
      message;


    toast.classList.add(
      "show"
    );


    clearTimeout(
      toastTimer
    );


    toastTimer =
      setTimeout(
        () => {

          toast.classList.remove(
            "show"
          );

        },
        3000
      );

  }
  /* =========================================================
     37 — SPEAKING / TEXT-TO-SPEECH
  ========================================================== */

  function speakText(text, button = null) {

    if (
      !text ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {

      showToast(
        "Read aloud is not supported on this browser."
      );

      return;

    }


    /*
      If something is already speaking,
      stop it first.
    */

    if (
      window.speechSynthesis.speaking
    ) {

      window.speechSynthesis.cancel();


      if (
        currentSpeakingButton
      ) {

        currentSpeakingButton.classList.remove(
          "speaking"
        );

        currentSpeakingButton =
          null;

      }


      /*
        If the same button was pressed
        while speaking, treat it as stop.
      */

      if (
        button &&
        button ===
          currentSpeakingButton
      ) {

        return;

      }

    }


    const cleanText =
      stripHTML(
        String(text)
      ).trim();


    if (!cleanText) {

      return;

    }


    const utterance =
      new SpeechSynthesisUtterance(
        cleanText
      );


    /*
      Prefer Bangla when the text contains
      Bengali characters.
    */

    const hasBangla =
      /[\u0980-\u09FF]/.test(
        cleanText
      );


    utterance.lang =
      hasBangla
        ? "bn-BD"
        : "en-US";


    utterance.rate =
      0.95;


    utterance.pitch =
      1;


    utterance.volume =
      1;


    const voices =
      window.speechSynthesis.getVoices();


    if (voices.length) {

      const preferred =
        voices.find(
          voice =>
            hasBangla &&
            (
              voice.lang
                .toLowerCase()
                .startsWith("bn")
            )
        ) ||
        voices.find(
          voice =>
            !hasBangla &&
            voice.lang
              .toLowerCase()
              .startsWith("en")
        );


      if (preferred) {

        utterance.voice =
          preferred;

      }

    }


    if (button) {

      button.classList.add(
        "speaking"
      );


      currentSpeakingButton =
        button;

    }


    utterance.onend =
      () => {

        if (
          button
        ) {

          button.classList.remove(
            "speaking"
          );

        }


        if (
          currentSpeakingButton ===
          button
        ) {

          currentSpeakingButton =
            null;

        }

      };


    utterance.onerror =
      event => {

        console.warn(
          "Speech synthesis error:",
          event
        );


        if (
          button
        ) {

          button.classList.remove(
            "speaking"
          );

        }


        if (
          currentSpeakingButton ===
          button
        ) {

          currentSpeakingButton =
            null;

        }

      };


    window.speechSynthesis.speak(
      utterance
    );

  }


  /* =========================================================
     38 — STOP SPEAKING
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


      currentSpeakingButton =
        null;

    }

  }


  /* =========================================================
     39 — STRIP HTML
  ========================================================== */

  function stripHTML(
    html
  ) {

    const temporary =
      document.createElement(
        "div"
      );


    temporary.innerHTML =
      html;


    return (
      temporary.textContent ||
      temporary.innerText ||
      ""
    );

  }


  /* =========================================================
     40 — MARKDOWN → SAFE HTML
  ========================================================== */

  function renderMarkdown(
    text
  ) {

    if (
      text === null ||
      text === undefined
    ) {

      return "";

    }


    let source =
      String(text);


    /*
      Protect HTML by escaping first.
    */

    source =
      escapeHTML(
        source
      );


    /*
      Code blocks.
    */

    const codeBlocks = [];


    source =
      source.replace(
        /```([\s\S]*?)```/g,
        (
          match,
          code
        ) => {

          const index =
            codeBlocks.length;


          codeBlocks.push(
            code
              .replace(
                /^\n+/,
                ""
              )
              .replace(
                /\n+$/,
                ""
              )
          );


          return `___EMOGIGS_CODE_${index}___`;

        }
      );


    /*
      Inline code.
    */

    source =
      source.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
      );


    /*
      Bold.
    */

    source =
      source.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
      );


    /*
      Italic.
    */

    source =
      source.replace(
        /(^|[^*])\*([^*]+)\*/g,
        "$1<em>$2</em>"
      );


    /*
      Markdown links.

      Only safe http/https links
      are allowed.
    */

    source =
      source.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        (
          match,
          label,
          url
        ) => {

          return `
            <a
              href="${escapeAttribute(url)}"
              target="_blank"
              rel="noopener noreferrer">
              ${label}
            </a>
          `;

        }
      );


    /*
      Headings.
    */

    source =
      source.replace(
        /^### (.+)$/gm,
        "<h4>$1</h4>"
      );


    source =
      source.replace(
        /^## (.+)$/gm,
        "<h3>$1</h3>"
      );


    source =
      source.replace(
        /^# (.+)$/gm,
        "<h2>$1</h2>"
      );


    /*
      Unordered lists.
    */

    source =
      source.replace(
        /^(?:[-*]) (.+)$/gm,
        "<li>$1</li>"
      );


    source =
      source.replace(
        /(<li>[\s\S]*?<\/li>)(?=\s*(?:<li>|$))/g,
        "$1"
      );


    /*
      Numbered lists.
    */

    source =
      source.replace(
        /^\d+\.\s+(.+)$/gm,
        "<li>$1</li>"
      );


    /*
      Line breaks.

      Don't add <br> directly after block
      elements.
    */

    source =
      source.replace(
        /\n{2,}/g,
        "</p><p>"
      );


    source =
      source.replace(
        /\n/g,
        "<br>"
      );


    /*
      Restore code blocks.
    */

    codeBlocks.forEach(
      (
        code,
        index
      ) => {

        const safeCode =
          escapeHTML(
            code
          );


        const html =
          `
            <div class="emogigs-code-wrap">

              <button
                type="button"
                class="emogigs-code-copy"
                data-code-copy="${index}">

                Copy

              </button>

              <pre><code>${safeCode}</code></pre>

            </div>
          `;


        source =
          source.replace(
            `___EMOGIGS_CODE_${index}___`,
            html
          );

      }
    );


    /*
      Normalize paragraphs.
    */

    source =
      `<p>${source}</p>`;


    source =
      source.replace(
        /<p>\s*<\/p>/g,
        ""
      );


    source =
      source.replace(
        /<p>\s*(<h[234]>)/g,
        "$1"
      );


    source =
      source.replace(
        /(<\/h[234]>)\s*<\/p>/g,
        "$1"
      );


    return source;

  }


  /* =========================================================
     41 — ATTRIBUTE ESCAPE
  ========================================================== */

  function escapeAttribute(
    value
  ) {

    return String(value)

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      );

  }


  /* =========================================================
     42 — AI RESPONSE NORMALIZER
  ========================================================== */

  function normalizeAIResponse(
    data
  ) {

    if (
      data === null ||
      data === undefined
    ) {

      return "";

    }


    /*
      Plain string response.
    */

    if (
      typeof data ===
      "string"
    ) {

      return data.trim();

    }


    /*
      Common backend response formats.
    */

    const candidates = [

      data.reply,

      data.response,

      data.message,

      data.content,

      data.text,

      data.output_text

    ];


    for (
      const candidate of
      candidates
    ) {

      if (
        typeof candidate ===
        "string" &&
        candidate.trim()
      ) {

        return candidate.trim();

      }

    }


    /*
      OpenAI/Groq-style output.
    */

    if (
      Array.isArray(
        data.output
      )
    ) {

      const parts = [];


      data.output.forEach(
        item => {

          if (
            !item
          ) {

            return;

          }


          if (
            typeof item.text ===
            "string"
          ) {

            parts.push(
              item.text
            );

          }


          if (
            Array.isArray(
              item.content
            )
          ) {

            item.content.forEach(
              content => {

                if (
                  content &&
                  typeof content.text ===
                    "string"
                ) {

                  parts.push(
                    content.text
                  );

                }

              }
            );

          }

        }
      );


      if (
        parts.length
      ) {

        return parts.join(
          "\n"
        ).trim();

      }

    }


    /*
      Chat-completions style response.
    */

    if (
      data.choices &&
      Array.isArray(
        data.choices
      )
    ) {

      const choice =
        data.choices[0];


      if (
        choice &&
        choice.message
      ) {

        if (
          typeof choice.message.content ===
          "string"
        ) {

          return choice.message.content.trim();

        }


        if (
          Array.isArray(
            choice.message.content
          )
        ) {

          return choice.message.content
            .map(
              part =>
                part &&
                typeof part.text ===
                  "string"
                  ? part.text
                  : ""
            )
            .join("")
            .trim();

        }

      }

    }


    /*
      Final fallback.

      Avoid showing [object Object].
    */

    return "";

  }


  /* =========================================================
     43 — FRIENDLY AI ERROR
  ========================================================== */

  function getFriendlyAIError(
    error,
    status = null
  ) {

    if (
      !isOnline
    ) {

      return (
        "You're offline right now. " +
        "Please reconnect to the internet and try again."
      );

    }


    if (
      status === 401 ||
      status === 403
    ) {

      return (
        "The AI service authorization needs attention. " +
        "Please check the server configuration."
      );

    }


    if (
      status === 429
    ) {

      return (
        "Emogigs AI is receiving too many requests right now. " +
        "Please wait a moment and try again."
      );

    }


    if (
      status >= 500
    ) {

      return (
        "The Emogigs AI server is temporarily unavailable. " +
        "Please try again in a moment."
      );

    }


    if (
      error &&
      error.name ===
        "AbortError"
    ) {

      return (
        "The request took too long. " +
        "Please try again."
      );

    }


    return (
      "Sorry, I couldn't connect to Emogigs AI right now. " +
      "Please try again."
    );

  }


  /* =========================================================
     44 — REQUEST WITH RETRY
  ========================================================== */

  async function requestWithRetry(
    url,
    options = {},
    maxRetries = 2
  ) {

    let lastError =
      null;


    for (
      let attempt = 0;
      attempt <= maxRetries;
      attempt++
    ) {

      try {

        const controller =
          new AbortController();


        const timeout =
          setTimeout(
            () => {

              controller.abort();

            },
            60000
          );


        const requestOptions =
          {
            ...options,

            signal:
              controller.signal

          };


        const response =
          await fetch(
            url,
            requestOptions
          );


        clearTimeout(
          timeout
        );


        /*
          Don't retry client-side errors.
        */

        if (
          response.ok ||
          (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429
          )
        ) {

          return response;

        }


        /*
          Retry server / rate-limit errors.
        */

        lastError =
          new Error(
            `HTTP ${response.status}`
          );


        if (
          attempt <
          maxRetries
        ) {

          const delay =
            Math.min(
              1000 *
                Math.pow(
                  2,
                  attempt
                ),
              5000
            );


          await wait(
            delay
          );

        }

      } catch (error) {

        lastError =
          error;


        if (
          attempt <
          maxRetries
        ) {

          await wait(
            Math.min(
              1000 *
                Math.pow(
                  2,
                  attempt
                ),
              5000
            )
          );

        }

      }

    }


    throw (
      lastError ||
      new Error(
        "REQUEST_FAILED"
      )
    );

  }


  /* =========================================================
     45 — WAIT
  ========================================================== */

  function wait(
    milliseconds
  ) {

    return new Promise(
      resolve => {

        setTimeout(
          resolve,
          milliseconds
        );

      }
    );

  }


  /* =========================================================
     46 — SEND MESSAGE
  ========================================================== */

  async function sendMessage() {

    if (
      isSendingMessage
    ) {

      return;

    }


    if (!messageInput) {

      return;

    }


    const text =
      messageInput.value.trim();


    if (!text) {

      return;

    }


    if (
      !isOnline
    ) {

      showToast(
        "You are offline."
      );


      return;

    }


    isSendingMessage =
      true;


    /*
      Clear composer.
    */

    messageInput.value =
      "";


    messageInput.style.height =
      "auto";


    /*
      Register user activity.
    */

    registerActivity(
      "message"
    );


    /*
      Show user's message.
    */

    addMessage(
      "user",
      text
    );


    /*
      Store conversation item.
    */

    conversation.push({

      role:
        "user",

      content:
        text,

      timestamp:
        new Date().toISOString()

    });


    saveConversation();


    /*
      Typing indicator.
    */

    const typingId =
      addTypingIndicator();


    try {

      /*
        Build conversation history.

        Keep the payload reasonably small
        for mobile performance.
      */

      const history =
        conversation
          .slice(-30)
          .map(
            item => ({
              role:
                item.role,
              content:
                item.content
            })
          );


      /*
        Local memory context.
      */

      const memory =
        getLocalMemory()
          .slice(-20);


      const account =
        getEmogigsAccount();


      const userContext = {

        account:
          account
            ? {
                name:
                  account.name,

                username:
                  account.username
              }
            : null,

        mode:
          currentMode,

        memory,

        goals:
          userGoals.slice(
            -10
          )

      };


      const payload = {

        message:
          text,

        prompt:
          text,

        mode:
          currentMode,

        history,

        conversation:
          history,

        userContext

      };


      console.log(
        "🤖 Emogigs AI request:",
        {
          mode:
            currentMode,
          historyLength:
            history.length
        }
      );


      const response =
        await requestWithRetry(
          API_URL,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(
                payload
              )

          }
        );


      /*
        Remove typing indicator
        before processing response.
      */

      removeTypingIndicator(
        typingId
      );


      let data =
        null;


      try {

        data =
          await response.json();

      } catch (jsonError) {

        console.warn(
          "AI response JSON parse error:",
          jsonError
        );

      }


      if (
        !response.ok
      ) {

        const serverMessage =
          data &&
          (
            data.error ||
            data.message
          );


        throw Object.assign(
          new Error(
            serverMessage ||
            `HTTP ${response.status}`
          ),
          {
            status:
              response.status
          }
        );

      }


      const aiText =
        normalizeAIResponse(
          data
        );


      if (!aiText) {

        throw new Error(
          "EMPTY_AI_RESPONSE"
        );

      }


      /*
        Display assistant reply.
      */

      addMessage(
        "assistant",
        aiText
      );


      conversation.push({

        role:
          "assistant",

        content:
          aiText,

        timestamp:
          new Date().toISOString()

      });


      saveConversation();


      registerActivity(
        "ai"
      );


      /*
        Basic memory detection.
      */

      detectUserMemory(
        text
      );


      /*
        If this is the first user message,
        count the chat.
      */

      if (
        conversation.filter(
          item =>
            item.role ===
            "user"
        ).length === 1
      ) {

        activityData.totalChats =
          Number(
            activityData.totalChats ||
            0
          ) + 1;


        saveActivityData();

      }


      emitLifeOSEvent(
        "ai_reply",
        {

          mode:
            currentMode,

          text:
            aiText

        }
      );


    } catch (error) {

      console.error(
        "❌ Emogigs AI request failed:",
        error
      );


      removeTypingIndicator(
        typingId
      );


      const status =
        error &&
        error.status
          ? error.status
          : null;


      const friendly =
        getFriendlyAIError(
          error,
          status
        );


      addMessage(
        "assistant",
        friendly,
        {
          isError:
            true
        }
      );


      /*
        Restore user's message in the
        composer only when useful.

        This makes mobile retry easier.
      */

      if (
        messageInput &&
        !messageInput.value
      ) {

        messageInput.value =
          text;


        messageInput.dispatchEvent(
          new Event("input")
        );

      }

    } finally {

      isSendingMessage =
        false;

    }

  }


  /* =========================================================
     47 — ADVANCED SEND ALIAS
  ========================================================== */

  async function sendMessageAdvanced() {

    return sendMessage();

  }


  /* =========================================================
     48 — ADD MESSAGE
  ========================================================== */

  function addMessage(
    role,
    text,
    options = {}
  ) {

    if (!chatArea) {

      console.warn(
        "Chat area not found."
      );


      return null;

    }


    const message =
      document.createElement(
        "div"
      );


    message.className =
      `message ${role}`;


    if (
      options.isError
    ) {

      message.classList.add(
        "error-message"
      );

    }


    const messageInner =
      document.createElement(
        "div"
      );


    messageInner.className =
      "message-inner";


    const avatar =
      document.createElement(
        "div"
      );


    avatar.className =
      "message-avatar";


    avatar.textContent =
      role === "user"
        ? "You"
        : "✦";


    const bubble =
      document.createElement(
        "div"
      );


    bubble.className =
      "message-bubble";


    /*
      User messages are kept plain.

      Assistant messages support
      lightweight Markdown.
    */

    if (
      role === "assistant"
    ) {

      bubble.innerHTML =
        renderMarkdown(
          text
        );

    } else {

      bubble.textContent =
        text;

    }


    messageInner.appendChild(
      avatar
    );


    messageInner.appendChild(
      bubble
    );


    message.appendChild(
      messageInner
    );


    /*
      Assistant actions.
    */

    if (
      role === "assistant"
    ) {

      const actions =
        createMessageActions(
          text
        );


      message.appendChild(
        actions
      );

    }


    chatArea.appendChild(
      message
    );


    /*
      Code copy buttons.
    */

    bindCodeCopyButtons(
      message
    );


    /*
      Smooth scroll.
    */

    requestAnimationFrame(
      () => {

        chatArea.scrollTo(
          {
            top:
              chatArea.scrollHeight,

            behavior:
              "smooth"
          }
        );

      }
    );


    return message;

  }


  /* =========================================================
     49 — MESSAGE ACTIONS
  ========================================================== */

  function createMessageActions(
    text
  ) {

    const actions =
      document.createElement(
        "div"
      );


    actions.className =
      "message-actions";


    /*
      Copy
    */

    const copyBtn =
      createActionButton(
        "Copy",
        "📋"
      );


    copyBtn.addEventListener(
      "click",
      async () => {

        const success =
          await copyText(
            text
          );


        if (success) {

          showToast(
            "Copied to clipboard ✓"
          );

        } else {

          showToast(
            "Could not copy text."
          );

        }

      }
    );


    /*
      Read aloud
    */

    const speakBtn =
      createActionButton(
        "Read aloud",
        "🔊"
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


    /*
      Regenerate
    */

    const regenerateBtn =
      createActionButton(
        "Regenerate",
        "↻"
      );


    regenerateBtn.addEventListener(
      "click",
      () => {

        regenerateLastResponse();

      }
    );


    /*
      Favorite
    */

    const favoriteBtn =
      createActionButton(
        "Favorite",
        "☆"
      );


    favoriteBtn.addEventListener(
      "click",
      () => {

        toggleFavorite(
          text,
          favoriteBtn
        );

      }
    );


    actions.appendChild(
      copyBtn
    );


    actions.appendChild(
      speakBtn
    );


    actions.appendChild(
      regenerateBtn
    );


    actions.appendChild(
      favoriteBtn
    );


    return actions;

  }


  /* =========================================================
     50 — CREATE ACTION BUTTON
  ========================================================== */

  function createActionButton(
    label,
    icon
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "message-action-btn";


    button.setAttribute(
      "aria-label",
      label
    );


    button.setAttribute(
      "title",
      label
    );


    button.innerHTML =
      `<span>${icon}</span>`;


    return button;

  }


  /* =========================================================
     51 — COPY TEXT
  ========================================================== */

  async function copyText(
    text
  ) {

    const cleanText =
      stripHTML(
        String(text)
      );


    try {

      if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {

        await navigator.clipboard.writeText(
          cleanText
        );


        return true;

      }

    } catch (error) {

      console.warn(
        "Clipboard API failed:",
        error
      );

    }


    /*
      Fallback for older mobile browsers.
    */

    try {

      const textarea =
        document.createElement(
          "textarea"
        );


      textarea.value =
        cleanText;


      textarea.style.position =
        "fixed";


      textarea.style.left =
        "-9999px";


      textarea.style.top =
        "0";


      document.body.appendChild(
        textarea
      );


      textarea.focus();

      textarea.select();


      const result =
        document.execCommand(
          "copy"
        );


      textarea.remove();


      return result;

    } catch (error) {

      console.warn(
        "Clipboard fallback failed:",
        error
      );


      return false;

    }

  }


  /* =========================================================
     52 — CODE COPY BUTTONS
  ========================================================== */

  function bindCodeCopyButtons(
    container
  ) {

    if (!container) {

      return;

    }


    const buttons =
      container.querySelectorAll(
        ".emogigs-code-copy"
      );


    buttons.forEach(
      button => {

        if (
          button.dataset.bound ===
          "true"
        ) {

          return;

        }


        button.dataset.bound =
          "true";


        button.addEventListener(
          "click",
          async () => {

            const wrap =
              button.closest(
                ".emogigs-code-wrap"
              );


            const code =
              wrap &&
              wrap.querySelector(
                "pre code"
              );


            if (!code) {

              return;

            }


            const success =
              await copyText(
                code.textContent
              );


            if (success) {

              button.textContent =
                "Copied ✓";


              setTimeout(
                () => {

                  button.textContent =
                    "Copy";

                },
                1500
              );

            }

          }
        );

      }
    );

  }


  /* =========================================================
     53 — TYPING INDICATOR
  ========================================================== */

  function addTypingIndicator() {

    if (!chatArea) {

      return null;

    }


    const id =
      createUniqueId(
        "typing"
      );


    const element =
      document.createElement(
        "div"
      );


    element.id =
      id;


    element.className =
      "message assistant typing-message";


    element.innerHTML = `

      <div class="message-inner">

        <div class="message-avatar">
          ✦
        </div>


        <div class="message-bubble typing-bubble">

          <span></span>
          <span></span>
          <span></span>

        </div>

      </div>

    `;


    chatArea.appendChild(
      element
    );


    chatArea.scrollTo(
      {
        top:
          chatArea.scrollHeight,

        behavior:
          "smooth"
      }
    );


    return id;

  }


  /* =========================================================
     54 — REMOVE TYPING INDICATOR
  ========================================================== */

  function removeTypingIndicator(
    id
  ) {

    if (!id) {

      return;

    }


    const element =
      document.getElementById(
        id
      );


    if (element) {

      element.remove();

    }

  }


  /* =========================================================
     55 — REGENERATE LAST RESPONSE
  ========================================================== */

  async function regenerateLastResponse() {

    if (
      isSendingMessage
    ) {

      return;

    }


    /*
      Find the last user message.
    */

    let lastUserIndex =
      -1;


    for (
      let i =
        conversation.length - 1;

      i >= 0;

      i--
    ) {

      if (
        conversation[i] &&
        conversation[i].role ===
          "user"
      ) {

        lastUserIndex =
          i;


        break;

      }

    }


    if (
      lastUserIndex ===
      -1
    ) {

      showToast(
        "There is no message to regenerate."
      );


      return;

    }


    const lastUserMessage =
      conversation[
        lastUserIndex
      ];


    /*
      Remove the last assistant response
      from local conversation.
    */

    while (
      conversation.length >
      lastUserIndex + 1
    ) {

      conversation.pop();

    }


    saveConversation();


    /*
      Re-send without duplicating the
      user message visually.

      Temporarily place the text in
      composer and call the normal sender.
    */

    if (!messageInput) {

      return;

    }


    messageInput.value =
      lastUserMessage.content;


    messageInput.dispatchEvent(
      new Event("input")
    );


    /*
      Remove the latest assistant bubble
      from the UI if it exists.

      We only remove the last assistant
      message, preserving the conversation.
    */

    if (chatArea) {

      const assistantMessages =
        chatArea.querySelectorAll(
          ".message.assistant:not(.typing-message)"
        );


      const lastAssistant =
        assistantMessages[
          assistantMessages.length - 1
        ];


      if (lastAssistant) {

        lastAssistant.remove();

      }

    }


    /*
      The normal send function will add
      the user message again, so remove
      the duplicate user item from the
      conversation after it is rendered.
    */

    const originalAddMessage =
      addMessage;


    /*
      sendMessage() intentionally handles
      the standard user flow.

      Recreate the request directly here
      to avoid duplicating history.
    */

    isSendingMessage =
      true;


    const typingId =
      addTypingIndicator();


    try {

      const history =
        conversation
          .slice(-30)
          .map(
            item => ({
              role:
                item.role,

              content:
                item.content

            })
          );


      const account =
        getEmogigsAccount();


      const payload = {

        message:
          lastUserMessage.content,

        prompt:
          lastUserMessage.content,

        mode:
          currentMode,

        history,

        conversation:
          history,

        userContext: {

          account:
            account
              ? {
                  name:
                    account.name,

                  username:
                    account.username
                }
              : null,

          mode:
            currentMode,

          memory:
            getLocalMemory().slice(
              -20
            ),

          goals:
            userGoals.slice(
              -10
            )

        }

      };


      const response =
        await requestWithRetry(
          API_URL,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(
                payload
              )

          }
        );


      removeTypingIndicator(
        typingId
      );


      let data =
        null;


      try {

        data =
          await response.json();

      } catch (error) {

        console.warn(
          error
        );

      }


      if (
        !response.ok
      ) {

        const err =
          new Error(
            (
              data &&
              (
                data.error ||
                data.message
              )
            ) ||
            `HTTP ${response.status}`
          );


        err.status =
          response.status;


        throw err;

      }


      const aiText =
        normalizeAIResponse(
          data
        );


      if (!aiText) {

        throw new Error(
          "EMPTY_AI_RESPONSE"
        );

      }


      addMessage(
        "assistant",
        aiText
      );


      conversation.push({

        role:
          "assistant",

        content:
          aiText,

        timestamp:
          new Date().toISOString()

      });


      saveConversation();


      registerActivity(
        "ai"
      );


    } catch (error) {

      removeTypingIndicator(
        typingId
      );


      addMessage(
        "assistant",
        getFriendlyAIError(
          error,
          error.status || null
        ),
        {
          isError:
            true
        }
      );

    } finally {

      isSendingMessage =
        false;

    }

  }


  /* =========================================================
     56 — FAVORITES
  ========================================================== */

  function toggleFavorite(
    text,
    button = null
  ) {

    const cleanText =
      stripHTML(
        String(text)
      ).trim();


    if (!cleanText) {

      return;

    }


    const existingIndex =
      favorites.findIndex(
        item =>
          item &&
          item.text ===
            cleanText
      );


    if (
      existingIndex >= 0
    ) {

      favorites.splice(
        existingIndex,
        1
      );


      if (button) {

        button.classList.remove(
          "active"
        );


        button.innerHTML =
          "<span>☆</span>";

      }


      showToast(
        "Removed from favorites."
      );

    } else {

      favorites.push({

        id:
          createUniqueId(
            "favorite"
          ),

        text:
          cleanText,

        createdAt:
          new Date().toISOString()

      });


      if (button) {

        button.classList.add(
          "active"
        );


        button.innerHTML =
          "<span>★</span>";

      }


      showToast(
        "Saved to favorites ⭐"
      );

    }


    writeLocalStorage(
      FAVORITES_STORAGE_KEY,
      favorites
    );


    emitLifeOSEvent(
      "favorite_changed",
      {

        text:
          cleanText,

        active:
          existingIndex < 0

      }
    );

  }


  /* =========================================================
     57 — SAVE CONVERSATION
  ========================================================== */

  function saveConversation() {

    if (
      !settings.autoSave
    ) {

      return;

    }


    const data = {

      id:
        currentConversationId ||
        createUniqueId(
          "chat"
        ),

      updatedAt:
        new Date().toISOString(),

      messages:
        conversation.slice(
          -100
        )

    };


    currentConversationId =
      data.id;


    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          data
        )
      );

    } catch (error) {

      console.warn(
        "Could not save conversation:",
        error
      );

    }

  }


  /* =========================================================
     58 — LOAD CONVERSATION
  ========================================================== */

  function loadConversation() {

    if (!chatArea) {

      return;

    }


    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (!saved) {

        return;

      }


      const data =
        JSON.parse(
          saved
        );


      if (
        !data ||
        !Array.isArray(
          data.messages
        )
      ) {

        return;

      }


      currentConversationId =
        data.id ||
        createUniqueId(
          "chat"
        );


      conversation =
        data.messages
          .filter(
            item =>
              item &&
              (
                item.role ===
                  "user" ||
                item.role ===
                  "assistant"
              ) &&
              typeof item.content ===
                "string"
          )
          .slice(
            -100
          );


      /*
        Restore the UI.
      */

      conversation.forEach(
        item => {

          addMessage(
            item.role,
            item.content
          );

        }
      );


      console.log(
        `💾 Restored ${conversation.length} messages.`
      );

    } catch (error) {

      console.warn(
        "Could not load conversation:",
        error
      );

    }

  }


  /* =========================================================
     59 — NEW CHAT
  ========================================================== */

  function startNewChat() {

    if (
      isSendingMessage
    ) {

      showToast(
        "Please wait for the current response."
      );


      return;

    }


    const hasMessages =
      conversation.length > 0;


    if (hasMessages) {

      const confirmed =
        window.confirm(
          "Start a new chat?"
        );


      if (!confirmed) {

        return;

      }

    }


    conversation =
      [];


    currentConversationId =
      createUniqueId(
        "chat"
      );


    try {

      localStorage.removeItem(
        STORAGE_KEY
      );

    } catch (error) {

      console.log(
        error
      );

    }


    if (chatArea) {

      chatArea.innerHTML =
        "";

    }


    if (messageInput) {

      messageInput.value =
        "";


      messageInput.style.height =
        "auto";

    }


    showToast(
      "New chat started ✨"
    );


    emitLifeOSEvent(
      "new_chat",
      {}
    );

  }
  /* =========================================================
     60 — CHAT HISTORY HELPERS
  ========================================================== */

  function getConversationTitle() {

    const firstUserMessage =
      conversation.find(
        item =>
          item &&
          item.role === "user"
      );


    if (
      !firstUserMessage ||
      !firstUserMessage.content
    ) {

      return "New Chat";

    }


    const title =
      stripHTML(
        firstUserMessage.content
      )
        .replace(
          /\s+/g,
          " "
        )
        .trim();


    if (
      title.length <= 45
    ) {

      return title;

    }


    return (
      title.substring(
        0,
        45
      ).trim() +
      "…"
    );

  }


  /* =========================================================
     61 — CHAT HISTORY OBJECT
  ========================================================== */

  function buildConversationRecord() {

    return {

      id:
        currentConversationId ||
        createUniqueId(
          "chat"
        ),

      title:
        getConversationTitle(),

      mode:
        currentMode,

      messages:
        conversation.slice(
          -100
        ),

      createdAt:
        conversation[0] &&
        conversation[0].timestamp
          ? conversation[0].timestamp
          : new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };

  }


  /* =========================================================
     62 — CHAT HISTORY STORAGE
  ========================================================== */

  function getSavedChats() {

    try {

      const saved =
        localStorage.getItem(
          "emogigs_chat_history_v2"
        );


      if (!saved) {

        return [];

      }


      const parsed =
        JSON.parse(
          saved
        );


      return Array.isArray(
        parsed
      )
        ? parsed
        : [];

    } catch (error) {

      console.warn(
        "Could not load chat history:",
        error
      );


      return [];

    }

  }


  function saveChatToHistory() {

    if (
      !conversation.length
    ) {

      return;

    }


    const chats =
      getSavedChats();


    const record =
      buildConversationRecord();


    const existingIndex =
      chats.findIndex(
        chat =>
          chat &&
          chat.id ===
            record.id
      );


    if (
      existingIndex >= 0
    ) {

      chats[
        existingIndex
      ] = record;

    } else {

      chats.unshift(
        record
      );

    }


    /*
      Keep local history manageable.
    */

    const limited =
      chats.slice(
        0,
        50
      );


    writeLocalStorage(
      "emogigs_chat_history_v2",
      limited
    );

  }


  /* =========================================================
     63 — DELETE SAVED CHAT
  ========================================================== */

  function deleteSavedChat(
    chatId
  ) {

    if (!chatId) {

      return false;

    }


    const chats =
      getSavedChats();


    const filtered =
      chats.filter(
        chat =>
          chat &&
          chat.id !==
            chatId
      );


    writeLocalStorage(
      "emogigs_chat_history_v2",
      filtered
    );


    return true;

  }


  /* =========================================================
     64 — LOAD SAVED CHAT
  ========================================================== */

  function loadSavedChat(
    chatId
  ) {

    const chats =
      getSavedChats();


    const chat =
      chats.find(
        item =>
          item &&
          item.id ===
            chatId
      );


    if (
      !chat ||
      !Array.isArray(
        chat.messages
      )
    ) {

      showToast(
        "Chat could not be found."
      );


      return false;

    }


    conversation =
      chat.messages
        .filter(
          item =>
            item &&
            (
              item.role === "user" ||
              item.role === "assistant"
            ) &&
            typeof item.content ===
              "string"
        )
        .slice(
          -100
        );


    currentConversationId =
      chat.id;


    if (
      chat.mode
    ) {

      currentMode =
        chat.mode;


      updateModeState();

    }


    if (chatArea) {

      chatArea.innerHTML =
        "";

    }


    conversation.forEach(
      item => {

        addMessage(
          item.role,
          item.content
        );

      }
    );


    saveConversation();


    showToast(
      "Chat restored ✓"
    );


    emitLifeOSEvent(
      "chat_loaded",
      {
        chatId
      }
    );


    return true;

  }


  /* =========================================================
     65 — DELETE CURRENT CHAT
  ========================================================== */

  function clearCurrentChat() {

    conversation =
      [];


    currentConversationId =
      createUniqueId(
        "chat"
      );


    if (chatArea) {

      chatArea.innerHTML =
        "";

    }


    try {

      localStorage.removeItem(
        STORAGE_KEY
      );

    } catch (error) {

      console.log(
        error
      );

    }


    showToast(
      "Current chat cleared."
    );

  }


  /* =========================================================
     66 — SEARCH CHAT HISTORY
  ========================================================== */

  function searchChatHistory(
    query
  ) {

    const cleanQuery =
      String(
        query || ""
      )
        .trim()
        .toLowerCase();


    const chats =
      getSavedChats();


    if (!cleanQuery) {

      return chats;

    }


    return chats.filter(
      chat => {

        const title =
          String(
            chat.title || ""
          )
            .toLowerCase();


        const messages =
          Array.isArray(
            chat.messages
          )
            ? chat.messages
                .map(
                  item =>
                    String(
                      item.content ||
                      ""
                    )
                )
                .join(" ")
                .toLowerCase()
            : "";


        return (
          title.includes(
            cleanQuery
          ) ||
          messages.includes(
            cleanQuery
          )
        );

      }
    );

  }


  /* =========================================================
     67 — GOALS SYSTEM
  ========================================================== */

  function createGoal(
    title,
    description = "",
    targetDate = null
  ) {

    const cleanTitle =
      String(
        title || ""
      )
        .trim();


    if (!cleanTitle) {

      return null;

    }


    const goal = {

      id:
        createUniqueId(
          "goal"
        ),

      title:
        cleanTitle,

      description:
        String(
          description || ""
        ).trim(),

      targetDate:
        targetDate || null,

      completed:
        false,

      progress:
        0,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };


    userGoals.push(
      goal
    );


    if (
      userGoals.length >
      100
    ) {

      userGoals =
        userGoals.slice(
          -100
        );

    }


    writeLocalStorage(
      GOALS_STORAGE_KEY,
      userGoals
    );


    emitLifeOSEvent(
      "goal_created",
      {
        goal
      }
    );


    return goal;

  }


  /* =========================================================
     68 — UPDATE GOAL
  ========================================================== */

  function updateGoal(
    goalId,
    updates = {}
  ) {

    const goal =
      userGoals.find(
        item =>
          item &&
          item.id ===
            goalId
      );


    if (!goal) {

      return false;

    }


    Object.assign(
      goal,
      updates,
      {
        updatedAt:
          new Date().toISOString()
      }
    );


    if (
      goal.completed
    ) {

      goal.progress =
        100;

    }


    goal.progress =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            goal.progress || 0
          )
        )
      );


    writeLocalStorage(
      GOALS_STORAGE_KEY,
      userGoals
    );


    emitLifeOSEvent(
      "goal_updated",
      {
        goal
      }
    );


    return true;

  }


  /* =========================================================
     69 — COMPLETE GOAL
  ========================================================== */

  function completeGoal(
    goalId
  ) {

    return updateGoal(
      goalId,
      {
        completed:
          true,

        progress:
          100
      }
    );

  }


  /* =========================================================
     70 — DELETE GOAL
  ========================================================== */

  function deleteGoal(
    goalId
  ) {

    const before =
      userGoals.length;


    userGoals =
      userGoals.filter(
        goal =>
          goal &&
          goal.id !==
            goalId
      );


    if (
      userGoals.length ===
      before
    ) {

      return false;

    }


    writeLocalStorage(
      GOALS_STORAGE_KEY,
      userGoals
    );


    emitLifeOSEvent(
      "goal_deleted",
      {
        goalId
      }
    );


    return true;

  }


  /* =========================================================
     71 — GET GOALS
  ========================================================== */

  function getGoals(
    includeCompleted = true
  ) {

    if (
      includeCompleted
    ) {

      return [
        ...userGoals
      ];

    }


    return userGoals.filter(
      goal =>
        goal &&
        !goal.completed
    );

  }


  /* =========================================================
     72 — MEMORY DETECTION
  ========================================================== */

  function detectUserMemory(
    text
  ) {

    if (
      !text ||
      typeof text !== "string"
    ) {

      return;

    }


    const clean =
      text.trim();


    if (
      clean.length <
      5
    ) {

      return;

    }


    /*
      We only store simple,
      user-provided preference/profile
      signals locally.

      This is a foundation, not a claim
      that the AI understands everything
      about the user.
    */


    const memoryPatterns = [

      {
        regex:
          /\bmy name is\s+([a-zA-Z][a-zA-Z\s'-]{1,30})/i,

        category:
          "profile",

        build:
          match =>
            `User's name is ${match[1].trim()}.`

      },


      {
        regex:
          /আমার নাম\s+([^\n।,!]{2,30})/i,

        category:
          "profile",

        build:
          match =>
            `ব্যবহারকারীর নাম ${match[1].trim()}।`

      },


      {
        regex:
          /\bi (?:like|love|prefer)\s+(.{2,80})$/i,

        category:
          "preference",

        build:
          match =>
            `User likes or prefers ${match[1].trim()}.`

      },


      {
        regex:
          /আমি\s+(.{2,80})\s+(?:পছন্দ করি|ভালোবাসি)/i,

        category:
          "preference",

        build:
          match =>
            `ব্যবহারকারী ${match[1].trim()} পছন্দ করেন।`

      }

    ];


    for (
      const pattern of
      memoryPatterns
    ) {

      const match =
        clean.match(
          pattern.regex
        );


      if (
        match &&
        typeof pattern.build ===
          "function"
      ) {

        rememberLocally(
          pattern.build(
            match
          ),
          pattern.category
        );


        break;

      }

    }

  }


  /* =========================================================
     73 — GET MEMORY CONTEXT
  ========================================================== */

  function buildMemoryContext() {

    const memories =
      getLocalMemory()
        .slice(
          -20
        );


    if (
      !memories.length
    ) {

      return "";

    }


    return memories
      .map(
        item =>
          `- ${item.text}`
      )
      .join(
        "\n"
      );

  }


  /* =========================================================
     74 — SETTINGS
  ========================================================== */

  function updateSetting(
    key,
    value
  ) {

    if (
      !Object.prototype.hasOwnProperty.call(
        settings,
        key
      )
    ) {

      return false;

    }


    settings[key] =
      value;


    writeLocalStorage(
      SETTINGS_STORAGE_KEY,
      settings
    );


    emitLifeOSEvent(
      "setting_changed",
      {
        key,
        value
      }
    );


    return true;

  }


  function getSetting(
    key
  ) {

    return settings[key];

  }


  /* =========================================================
     75 — FOCUS MODE
  ========================================================== */

  function toggleFocusMode(
    force = null
  ) {

    if (
      typeof force ===
      "boolean"
    ) {

      focusMode =
        force;

    } else {

      focusMode =
        !focusMode;

    }


    document.body.classList.toggle(
      "emogigs-focus-mode",
      focusMode
    );


    const focusButtons =
      document.querySelectorAll(
        "[data-focus-toggle]"
      );


    focusButtons.forEach(
      button => {

        button.classList.toggle(
          "active",
          focusMode
        );

      }
    );


    showToast(
      focusMode
        ? "Focus mode enabled 🎯"
        : "Focus mode disabled"
    );


    emitLifeOSEvent(
      "focus_mode_changed",
      {
        enabled:
          focusMode
      }
    );


    return focusMode;

  }


  /* =========================================================
     76 — MOBILE TOUCH FEEDBACK
  ========================================================== */

  function setupTouchFeedback() {

    document.addEventListener(
      "touchstart",
      event => {

        const target =
          event.target.closest(
            "button, .quick-card, .mode-chip, a"
          );


        if (!target) {

          return;

        }


        target.classList.add(
          "emogigs-touch-active"
        );


        setTimeout(
          () => {

            target.classList.remove(
              "emogigs-touch-active"
            );

          },
          160
        );

      },
      {
        passive:
          true
      }
    );

  }


  /* =========================================================
     77 — PERSONALIZED HERO
  ========================================================== */

  function updatePersonalizedHero() {

    const account =
      getEmogigsAccount();


    if (!account) {

      return;

    }


    const possibleGreeting =
      document.querySelector(
        "[data-emogigs-greeting]"
      );


    if (
      possibleGreeting
    ) {

      possibleGreeting.textContent =
        `Hello, ${account.name}`;

    }


    const possibleName =
      document.querySelector(
        "[data-emogigs-user-name]"
      );


    if (
      possibleName
    ) {

      possibleName.textContent =
        account.name;

    }

  }


  /* =========================================================
     78 — CHAT EXPORT
  ========================================================== */

  function exportConversation() {

    if (
      !conversation.length
    ) {

      showToast(
        "There is no conversation to export."
      );


      return;

    }


    const lines = [];


    lines.push(
      "EMOGIGS AI"
    );


    lines.push(
      `Mode: ${currentMode}`
    );


    lines.push(
      `Exported: ${new Date().toLocaleString()}`
    );


    lines.push(
      ""
    );


    conversation.forEach(
      item => {

        const role =
          item.role === "user"
            ? "You"
            : "Emogigs AI";


        lines.push(
          `${role}:`
        );


        lines.push(
          stripHTML(
            item.content
          )
        );


        lines.push(
          ""
        );

      }
    );


    const content =
      lines.join(
        "\n"
      );


    const blob =
      new Blob(
        [content],
        {
          type:
            "text/plain;charset=utf-8"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      `emogigs-chat-${new Date()
        .toISOString()
        .slice(
          0,
          10
        )}.txt`;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    setTimeout(
      () => {

        URL.revokeObjectURL(
          url
        );

      },
      1000
    );


    showToast(
      "Conversation exported ✓"
    );


    emitLifeOSEvent(
      "conversation_exported",
      {}
    );

  }


  /* =========================================================
     79 — EXPORT BUTTONS
  ========================================================== */

  function setupExportButtons() {

    const buttons =
      document.querySelectorAll(
        [
          "#exportChatBtn",
          "[data-export-chat]",
          "[data-action='export-chat']"
        ].join(",")
      );


    buttons.forEach(
      button => {

        if (
          button.dataset.emogigsExportBound ===
          "true"
        ) {

          return;

        }


        button.dataset.emogigsExportBound =
          "true";


        button.addEventListener(
          "click",
          event => {

            event.preventDefault();

            exportConversation();

          }
        );

      }
    );

  }


  /* =========================================================
     80 — SETTINGS BUTTONS
  ========================================================== */

  function setupFocusButtons() {

    const buttons =
      document.querySelectorAll(
        "[data-focus-toggle]"
      );


    buttons.forEach(
      button => {

        if (
          button.dataset.emogigsFocusBound ===
          "true"
        ) {

          return;

        }


        button.dataset.emogigsFocusBound =
          "true";


        button.addEventListener(
          "click",
          () => {

            toggleFocusMode();

          }
        );

      }
    );

  }


  /* =========================================================
     81 — LIFE OS INITIALIZATION
  ========================================================== */

  function initializeLifeOS() {

    setupTouchFeedback();

    setupExportButtons();

    setupFocusButtons();

    updatePersonalizedHero();

    updateAccountButton();

    updateActivityUI();


    /*
      Save current conversation to
      the searchable local history.
    */

    if (
      conversation.length
    ) {

      saveChatToHistory();

    }


    console.log(
      "🧠 Emogigs AI Life OS systems ready."
    );

  }


  /* =========================================================
     82 — INITIALIZATION HOOK
  ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeLifeOS,
      {
        once:
          true
      }
    );

  } else {

    initializeLifeOS();

  }


  /* =========================================================
     83 — SAVE HISTORY WHEN PAGE CLOSES
  ========================================================== */

  window.addEventListener(
    "beforeunload",
    () => {

      if (
        conversation.length &&
        settings.autoSave
      ) {

        saveConversation();

        saveChatToHistory();

      }


      releaseMicrophone();

    }
  );


  /* =========================================================
     84 — VISIBILITY CHANGE
  ========================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden
      ) {

        if (
          conversation.length &&
          settings.autoSave
        ) {

          saveConversation();

          saveChatToHistory();

        }

      }

    }
  );


  /* =========================================================
     85 — EXPOSE SAFE PUBLIC API
  ========================================================== */

  window.EmogigsAI = {

    sendMessage,

    sendMessageAdvanced,

    startNewChat,

    clearCurrentChat,

    regenerateLastResponse,

    exportConversation,

    speakText,

    stopSpeaking,

    toggleVoiceInput,

    createGoal,

    updateGoal,

    completeGoal,

    deleteGoal,

    getGoals,

    getLocalMemory,

    rememberLocally,

    toggleFocusMode,

    searchChatHistory,

    loadSavedChat,

    deleteSavedChat,

    getEmogigsAccount,

    openAccountModal,

    closeAccountModal

  };


  console.log(
    "🌟 EmogigsAI public API ready."
  );

})();