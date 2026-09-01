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
  ========================================================= */

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


    /*
      Bengali is the default language
      because your main UI is Bengali-friendly.

      The browser can still recognize
      English words depending on the device.
    */

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

        /*
          Ctrl/Cmd + K
          → focus chat input
        */

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


        /*
          Escape
          → stop voice
          → stop speaking
        */

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


    /*
      Prevent exact duplicates.
    */

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


    /*
      Keep memory lightweight.
    */

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

    /*
      If the HTML already contains
      any of these elements, update them.

      New UI elements will be created
      in PART 2.
    */

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
     PART 1 END
     ─────────────────────────────────────────────────────────

     DO NOT ADD `})();` HERE.

     PART 2 will continue from this point.

     PART 2 will contain:
     💬 Complete AI Chat Engine
     🧠 Context + Memory Integration
     ✨ Smart Suggestions
     ⭐ Favorites
     📊 Advanced Activity
     🎯 Goals Foundation
     ⚡ Focus Mode Foundation
     🔎 Search Foundation
     📤 Export Foundation
     🔊 Complete TTS
     📋 Copy
     ↻ Regenerate

     PART 3 will contain:
     🎨 Advanced Life OS UI
     ⚙️ Settings
     🧠 Memory Manager
     🎯 Goal Manager
     📊 Dashboard
     🔎 Search UI
     ⭐ Favorites UI
     📤 Export UI
     ⚡ Focus Mode UI
     📱 Mobile optimization
     🛡️ Error handling
     🚀 Final initialization
     ========================================================= */
/* =========================================================
   EMOGIGS AI — PART 2/3
   ADVANCED AI ENGINE + VOICE + CHAT SYSTEM
   ========================================================= */


/* =========================================================
   SMART MODE CONFIGURATION
========================================================= */

const EMOGIGS_MODES = {

  General: {
    label: "General",
    icon: "✦",
    instruction:
      "You are Emogigs AI, a helpful, intelligent and creative AI assistant."
  },

  Study: {
    label: "Study",
    icon: "📚",
    instruction:
      "Act as an expert study assistant. Explain difficult topics simply, clearly and step by step."
  },

  Career: {
    label: "Career",
    icon: "💼",
    instruction:
      "Act as a practical career assistant. Help with jobs, skills, CVs, interviews and career planning."
  },

  Creative: {
    label: "Creative",
    icon: "🎨",
    instruction:
      "Act as a highly creative assistant. Generate original ideas, concepts, stories, names and innovative solutions."
  },

  Coding: {
    label: "Coding",
    icon: "💻",
    instruction:
      "Act as an expert programming assistant. Provide clean, practical and beginner-friendly technical solutions."
  },

  Life: {
    label: "Life",
    icon: "🌱",
    instruction:
      "Act as a practical life assistant. Give thoughtful, realistic and useful guidance."
  },

  Business: {
    label: "Business",
    icon: "🚀",
    instruction:
      "Act as a business and entrepreneurship assistant. Focus on practical opportunities, strategy and execution."
  }

};


/* =========================================================
   SMART MODE DETECTION
========================================================= */

function detectSmartMode(text) {

  if (!text) {
    return "General";
  }

  const value =
    text.toLowerCase();

  const keywordGroups = {

    Study: [
      "study",
      "exam",
      "learn",
      "lesson",
      "school",
      "college",
      "university",
      "math",
      "physics",
      "chemistry",
      "biology",
      "পড়াশোনা",
      "পরীক্ষা",
      "শিখতে",
      "গণিত"
    ],

    Career: [
      "job",
      "career",
      "cv",
      "resume",
      "interview",
      "freelance",
      "freelancing",
      "চাকরি",
      "ক্যারিয়ার",
      "সিভি",
      "ফ্রিল্যান্স"
    ],

    Coding: [
      "code",
      "coding",
      "javascript",
      "html",
      "css",
      "python",
      "api",
      "bug",
      "programming",
      "কোড",
      "প্রোগ্রামিং",
      "ওয়েবসাইট",
      "অ্যাপ"
    ],

    Creative: [
      "idea",
      "creative",
      "story",
      "design",
      "name",
      "logo",
      "concept",
      "idea",
      "ক্রিয়েটিভ",
      "আইডিয়া",
      "গল্প",
      "ডিজাইন"
    ],

    Business: [
      "business",
      "startup",
      "company",
      "marketing",
      "sell",
      "profit",
      "ব্যবসা",
      "স্টার্টআপ",
      "মার্কেটিং",
      "লাভ"
    ],

    Life: [
      "life",
      "motivation",
      "habit",
      "goal",
      "relationship",
      "mindset",
      "জীবন",
      "মোটিভেশন",
      "অভ্যাস",
      "লক্ষ্য",
      "মানসিকতা"
    ]

  };


  let bestMode = "General";

  let highestScore = 0;


  Object.keys(keywordGroups)
    .forEach(mode => {

      let score = 0;


      keywordGroups[mode]
        .forEach(keyword => {

          if (value.includes(keyword)) {
            score++;
          }

        });


      if (score > highestScore) {

        highestScore = score;

        bestMode = mode;

      }

    });


  return bestMode;

}


/* =========================================================
   APPLY SMART MODE
========================================================= */

function applySmartMode(text) {

  const detected =
    detectSmartMode(text);


  /*
    Only automatically change mode
    when the user is currently using General.
  */

  if (
    currentMode === "General" &&
    detected !== "General"
  ) {

    currentMode =
      detected;


    const modes =
      document.querySelectorAll(
        ".mode-chip"
      );


    modes.forEach(button => {

      const buttonMode =
        button.dataset.mode;


      if (
        buttonMode === detected
      ) {

        modes.forEach(item => {

          item.classList.remove(
            "active"
          );

        });


        button.classList.add(
          "active"
        );

      }

    });

  }


  return currentMode;

}


/* =========================================================
   BUILD AI CONTEXT
========================================================= */

function buildAIContext(
  userMessage
) {

  const account =
    getEmogigsAccount();


  const modeData =
    EMOGIGS_MODES[
      currentMode
    ] ||
    EMOGIGS_MODES.General;


  const context = {

    app:
      "Emogigs AI",

    product:
      "AI Life OS",

    mode:
      currentMode,

    modeInstruction:
      modeData.instruction,

    user:
      account
        ? {
            name: account.name,
            username: account.username
          }
        : null,

    currentMessage:
      userMessage,

    history:
      conversation.slice(-12)

  };


  return context;

}


/* =========================================================
   SMART PERSONALIZATION
========================================================= */

function getPersonalizedGreeting() {

  const account =
    getEmogigsAccount();


  if (!account) {

    return "Hello! I'm Emogigs AI. How can I help you today?";

  }


  return (
    `Hello ${account.name}! 👋 ` +
    `I'm Emogigs AI. What would you like to do today?`
  );

}


/* =========================================================
   CHAT INPUT HELPERS
========================================================= */

function focusMessageInput() {

  if (!messageInput) {
    return;
  }


  try {

    messageInput.focus();

  } catch (error) {

    console.log(
      "Input focus failed:",
      error
    );

  }

}


/* =========================================================
   INSERT TEXT INTO INPUT
========================================================= */

function insertIntoInput(text) {

  if (!messageInput) {
    return;
  }


  const current =
    messageInput.value.trim();


  messageInput.value =
    current
      ? current + " " + text
      : text;


  messageInput.dispatchEvent(
    new Event(
      "input",
      {
        bubbles: true
      }
    )
  );


  focusMessageInput();

}


/* =========================================================
   CLEAR INPUT
========================================================= */

function clearMessageInput() {

  if (!messageInput) {
    return;
  }


  messageInput.value = "";

  messageInput.style.height =
    "auto";

}


/* =========================================================
   AI REQUEST BUILDER
========================================================= */

function buildAIRequest(
  userMessage
) {

  const context =
    buildAIContext(
      userMessage
    );


  return {

    message:
      userMessage,

    prompt:
      userMessage,

    mode:
      currentMode,

    context:
      context,

    history:
      conversation.slice(-12)

  };

}


/* =========================================================
   SEND MESSAGE — ADVANCED WRAPPER
========================================================= */

async function sendToEmogigsAI(
  userMessage
) {

  const payload =
    buildAIRequest(
      userMessage
    );


  const controller =
    new AbortController();


  const timeout =
    setTimeout(() => {

      controller.abort();

    }, 45000);


  try {

    const response =
      await fetch(
        API_URL,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body:
            JSON.stringify(
              payload
            ),

          signal:
            controller.signal

        }
      );


    clearTimeout(timeout);


    if (!response.ok) {

      let serverMessage = "";


      try {

        const errorData =
          await response.json();


        serverMessage =
          extractAnswer(
            errorData
          );

      } catch (_) {

        serverMessage = "";

      }


      throw new Error(
        serverMessage ||
        `Server error ${response.status}`
      );

    }


    const data =
      await response.json();


    return data;

  } catch (error) {

    clearTimeout(timeout);

    throw error;

  }

}


/* =========================================================
   SAFE AI RESPONSE
========================================================= */

function normalizeAIResponse(
  data
) {

  let answer =
    extractAnswer(
      data
    );


  if (!answer) {

    return "";

  }


  answer =
    String(answer)
      .trim();


  /*
    Remove accidental API wrappers.
  */

  if (
    answer.startsWith("```") &&
    answer.endsWith("```")
  ) {

    answer =
      answer
        .replace(/^```[a-zA-Z]*\n?/, "")
        .replace(/\n?```$/, "")
        .trim();

  }


  return answer;

}


/* =========================================================
   ERROR MESSAGE GENERATOR
========================================================= */

function getFriendlyAIError(
  error
) {

  if (!error) {

    return (
      "Sorry, something went wrong. " +
      "Please try again."
    );

  }


  if (
    error.name ===
    "AbortError"
  ) {

    return (
      "Emogigs AI is taking too long to respond. " +
      "Please check your internet connection and try again."
    );

  }


  const message =
    String(
      error.message || ""
    ).toLowerCase();


  if (
    message.includes("failed to fetch") ||
    message.includes("network")
  ) {

    return (
      "I couldn't reach Emogigs AI. " +
      "Please check your internet connection."
    );

  }


  if (
    message.includes("401") ||
    message.includes("403")
  ) {

    return (
      "Emogigs AI authorization failed. " +
      "Please check the server configuration."
    );

  }


  if (
    message.includes("404")
  ) {

    return (
      "The Emogigs AI service endpoint could not be found."
    );

  }


  if (
    message.includes("429")
  ) {

    return (
      "Emogigs AI is currently busy. " +
      "Please wait a moment and try again."
    );

  }


  if (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503")
  ) {

    return (
      "Emogigs AI server is temporarily unavailable. " +
      "Please try again in a moment."
    );

  }


  return (
    "Sorry, I couldn't connect to Emogigs AI right now. " +
    "Please try again."
  );

}


/* =========================================================
   RETRY SYSTEM
========================================================= */

let retryCount = 0;

const MAX_RETRIES = 2;


async function requestWithRetry(
  userMessage
) {

  retryCount = 0;


  while (
    retryCount <= MAX_RETRIES
  ) {

    try {

      return await sendToEmogigsAI(
        userMessage
      );

    } catch (error) {

      retryCount++;


      if (
        retryCount >
        MAX_RETRIES
      ) {

        throw error;

      }


      await new Promise(
        resolve => {

          setTimeout(
            resolve,
            700 * retryCount
          );

        }
      );

    }

  }

}


/* =========================================================
   IMPROVED MESSAGE SENDING
========================================================= */

async function sendMessageAdvanced() {

  if (!messageInput) {
    return;
  }


  const text =
    messageInput.value.trim();


  if (!text) {
    return;
  }


  stopSpeaking();


  /*
    Automatically understand
    the user's intent.
  */

  applySmartMode(
    text
  );


  /*
    Stop voice recognition
    before sending.
  */

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


  /*
    Switch UI into chat mode.
  */

  if (hero) {

    hero.style.display =
      "none";

  }


  if (quickTools) {

    quickTools.style.display =
      "none";

  }


  if (chatArea) {

    chatArea.classList.add(
      "visible"
    );

  }


  const empty =
    document.getElementById(
      "emptyChat"
    );


  if (empty) {
    empty.remove();
  }


  /*
    Add user message.
  */

  addMessage(
    "user",
    text
  );


  conversation.push({

    role:
      "user",

    content:
      text,

    mode:
      currentMode,

    timestamp:
      new Date().toISOString()

  });


  saveConversation();


  clearMessageInput();


  /*
    Show typing animation.
  */

  const typingId =
    addTyping();


  try {

    const data =
      await requestWithRetry(
        text
      );


    removeTyping(
      typingId
    );


    const answer =
      normalizeAIResponse(
        data
      );


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

      role:
        "assistant",

      content:
        answer,

      mode:
        currentMode,

      timestamp:
        new Date().toISOString()

    });


    saveConversation();


  } catch (error) {

    console.error(
      "Emogigs AI request failed:",
      error
    );


    removeTyping(
      typingId
    );


    const friendlyError =
      getFriendlyAIError(
        error
      );


    addMessage(
      "assistant",
      friendlyError
    );

  }

}


/* =========================================================
   SMART QUICK ACTIONS
========================================================= */

const EMOGIGS_QUICK_ACTIONS = {

  summarize:
    "Summarize this clearly and give me the most important points.",

  explain:
    "Explain this in a very simple way with examples.",

  improve:
    "Improve this and make it clearer, smarter and more professional.",

  translate:
    "Translate this into natural English while keeping the original meaning.",

  ideas:
    "Give me 10 creative and practical ideas about this.",

  plan:
    "Create a practical step-by-step action plan for this.",

  analyze:
    "Analyze this deeply and explain the important advantages, disadvantages and risks."

};


/* =========================================================
   RUN QUICK ACTION
========================================================= */

function runQuickAction(
  action
) {

  const instruction =
    EMOGIGS_QUICK_ACTIONS[
      action
    ];


  if (!instruction) {

    return;

  }


  if (!messageInput) {

    return;

  }


  const current =
    messageInput.value.trim();


  if (!current) {

    insertIntoInput(
      instruction
    );

    return;

  }


  messageInput.value =
    `${instruction}\n\n${current}`;


  messageInput.dispatchEvent(
    new Event(
      "input",
      {
        bubbles: true
      }
    )
  );


  sendMessageAdvanced();

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
      Ctrl/Cmd + K
      Focus chat input.
    */

    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {

      event.preventDefault();

      focusMessageInput();

    }


    /*
      Escape stops speaking.
    */

    if (
      event.key === "Escape"
    ) {

      if (
        "speechSynthesis" in window &&
        window.speechSynthesis.speaking
      ) {

        stopSpeaking();

      }

    }

  }
);


/* =========================================================
   MOBILE TOUCH FEEDBACK
========================================================= */

function setupMobileInteractions() {

  const interactive =
    document.querySelectorAll(
      "button, .quick-card, .mode-chip"
    );


  interactive.forEach(element => {

    element.addEventListener(
      "touchstart",
      () => {

        element.classList.add(
          "emogigs-touching"
        );

      },
      {
        passive: true
      }
    );


    element.addEventListener(
      "touchend",
      () => {

        setTimeout(() => {

          element.classList.remove(
            "emogigs-touching"
          );

        }, 100);

      },
      {
        passive: true
      }
    );

  });

}


/* =========================================================
   MOBILE INTERACTION CSS
========================================================= */

function injectMobileInteractionStyles() {

  if (
    document.getElementById(
      "emogigsMobileStyles"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "emogigsMobileStyles";


  style.textContent = `

    .emogigs-touching {
      transform: scale(.97);
      opacity: .86;
    }

    button,
    .quick-card,
    .mode-chip {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    textarea,
    input,
    button {
      font-family: inherit;
    }

  `;


  document.head.appendChild(
    style
  );

}


/* =========================================================
   CHAT SEARCH
========================================================= */

function searchConversation(
  query
) {

  const value =
    String(query || "")
      .trim()
      .toLowerCase();


  if (!value) {

    return [];

  }


  return conversation.filter(
    item => {

      return (
        typeof item.content === "string" &&
        item.content
          .toLowerCase()
          .includes(value)
      );

    }
  );

}


/* =========================================================
   GET LAST USER MESSAGE
========================================================= */

function getLastUserMessage() {

  for (
    let i = conversation.length - 1;
    i >= 0;
    i--
  ) {

    if (
      conversation[i].role ===
      "user"
    ) {

      return conversation[i];

    }

  }


  return null;

}


/* =========================================================
   GET LAST ASSISTANT MESSAGE
========================================================= */

function getLastAssistantMessage() {

  for (
    let i = conversation.length - 1;
    i >= 0;
    i--
  ) {

    if (
      conversation[i].role ===
      "assistant"
    ) {

      return conversation[i];

    }

  }


  return null;

}


/* =========================================================
   IMPROVED REGENERATE
========================================================= */

async function regenerateLastAnswerAdvanced() {

  const lastUser =
    getLastUserMessage();


  if (!lastUser) {

    showToast(
      "There is no previous message to regenerate."
    );

    return;

  }


  /*
    Remove the last assistant
    bubble from the UI.
  */

  const assistantMessages =
    chatArea
      ? chatArea.querySelectorAll(
          ".message.assistant"
        )
      : [];


  if (
    assistantMessages.length
  ) {

    const last =
      assistantMessages[
        assistantMessages.length - 1
      ];


    if (
      !last.classList.contains(
        "typing"
      )
    ) {

      last.remove();

    }

  }


  /*
    Remove previous assistant
    message from conversation.
  */

  if (
    conversation.length &&
    conversation[
      conversation.length - 1
    ].role === "assistant"
  ) {

    conversation.pop();

  }


  saveConversation();


  /*
    Put original user text back.
  */

  if (messageInput) {

    messageInput.value =
      lastUser.content;

  }


  await sendMessageAdvanced();

}


/* =========================================================
   COPY MESSAGE WITH FALLBACK
========================================================= */

async function copyMessageText(
  text
) {

  if (!text) {

    return false;

  }


  try {

    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {

      await navigator.clipboard.writeText(
        text
      );

      return true;

    }

  } catch (error) {

    console.log(
      "Clipboard API failed:",
      error
    );

  }


  try {

    const textarea =
      document.createElement(
        "textarea"
      );


    textarea.value =
      text;


    textarea.style.position =
      "fixed";

    textarea.style.left =
      "-9999px";


    document.body.appendChild(
      textarea
    );


    textarea.focus();

    textarea.select();


    const success =
      document.execCommand(
        "copy"
      );


    textarea.remove();


    return success;

  } catch (error) {

    console.error(
      "Copy fallback failed:",
      error
    );


    return false;

  }

}


/* =========================================================
   CHAT EXPORT
========================================================= */

function exportConversation() {

  if (
    !conversation.length
  ) {

    showToast(
      "There is no conversation to export."
    );

    return;

  }


  let output =
    "EMOGIGS AI\n";

  output +=
    "====================\n\n";


  conversation.forEach(
    item => {

      const role =
        item.role === "user"
          ? "You"
          : "Emogigs AI";


      output +=
        `${role}:\n`;

      output +=
        `${item.content}\n\n`;

    }
  );


  const blob =
    new Blob(
      [output],
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
    `emogigs-chat-${Date.now()}.txt`;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  setTimeout(() => {

    URL.revokeObjectURL(
      url
    );

  }, 1000);


  showToast(
    "Conversation exported ✓"
  );

}


/* =========================================================
   CHAT STATISTICS
========================================================= */

function getConversationStats() {

  const total =
    conversation.length;


  let userMessages = 0;

  let aiMessages = 0;


  conversation.forEach(
    item => {

      if (
        item.role === "user"
      ) {

        userMessages++;

      }


      if (
        item.role === "assistant"
      ) {

        aiMessages++;

      }

    }
  );


  return {

    total,
    userMessages,
    aiMessages

  };

}


/* =========================================================
   SMART WELCOME
========================================================= */

function showSmartWelcome() {

  if (
    conversation.length
  ) {

    return;

  }


  const account =
    getEmogigsAccount();


  const empty =
    document.getElementById(
      "emptyChat"
    );


  if (!empty) {

    return;

  }


  const strong =
    empty.querySelector(
      "strong"
    );


  if (strong) {

    strong.textContent =
      account
        ? `Welcome back, ${account.name} 👋`
        : "Emogigs AI is ready";
        
  }

}


/* =========================================================
   INITIALIZE ADVANCED ENGINE
========================================================= */

function initializeAdvancedEngine() {

  injectMobileInteractionStyles();

  setupMobileInteractions();

  showSmartWelcome();


  console.log(
    "Emogigs AI Advanced Engine initialized."
  );

}


/* =========================================================
   ADVANCED DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeAdvancedEngine();

  }
);


/* =========================================================
   OVERRIDE STANDARD SEND
========================================================= */

(function patchSendButton() {

  if (!sendBtn) {
    return;
  }


  /*
    Prevent duplicate listeners
    from triggering two AI requests.

    The original setupButtons()
    listener still exists, so we use
    a capture listener and stop it.
  */

  sendBtn.addEventListener(
    "click",
    event => {

      event.preventDefault();

      event.stopImmediatePropagation();

      sendMessageAdvanced();

    },
    true
  );

})();


/* =========================================================
   OVERRIDE ENTER KEY
========================================================= */

(function patchEnterKey() {

  if (!messageInput) {
    return;
  }


  messageInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        event.stopImmediatePropagation();

        sendMessageAdvanced();

      }

    },
    true
  );

})();


/* =========================================================
   QUICK ACTION EVENT BINDING
========================================================= */

function setupAdvancedQuickActions() {

  const buttons =
    document.querySelectorAll(
      "[data-ai-action]"
    );


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();


          const action =
            button.dataset.aiAction;


          runQuickAction(
            action
          );

        }
      );

    }
  );

}


/* =========================================================
   ADVANCED READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupAdvancedQuickActions();

  }
);