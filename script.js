/* =========================================================
   EMOGIGS AI
   Mobile AI Life OS
   CHAT + VOICE INPUT + READ ALOUD
   ACCOUNT / EMOGIGS ID SYSTEM
   ========================================================= */

(() => {

  "use strict";

  /* =========================================================
     CONFIG
  ========================================================== */

  const API_URL = "/api/chat";

  const STORAGE_KEY = "emogigs_ai_chat_v2";

  const ACCOUNT_STORAGE_KEY = "emogigs_user_account_v1";

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

    setupAccountSystem();

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
     ACCOUNT / EMOGIGS ID SYSTEM
  ========================================================== */

  function setupAccountSystem() {

    /*
      Supports all of these possible account buttons:

      #accountBtn
      #accountButton
      .account-btn
      .account-button
      [data-action="account"]
      [data-account]
    */

    const accountButtons =
      document.querySelectorAll(
        "#accountBtn, #accountButton, .account-btn, .account-button, [data-action='account'], [data-account]"
      );


    if (!accountButtons.length) {

      console.log(
        "Emogigs Account button was not found."
      );

      return;

    }


    accountButtons.forEach(button => {

      /*
        Remove accidental old inline behavior
        only through our event handling.
      */

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();

          event.stopPropagation();

          openAccountModal();

        }
      );

    });


    console.log(
      "Emogigs Account system initialized."
    );

  }


  /* =========================================================
     ACCOUNT MODAL
  ========================================================== */

  function openAccountModal() {

    let modal =
      document.getElementById(
        "emogigsAccountModal"
      );


    /*
      If modal already exists,
      simply show it.
    */

    if (!modal) {

      modal =
        createAccountModal();

    }


    updateAccountModal();


    modal.classList.add("show");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "emogigs-modal-open"
    );

  }


  /* =========================================================
     CREATE ACCOUNT MODAL
  ========================================================== */

  function createAccountModal() {

    const modal =
      document.createElement("div");


    modal.id =
      "emogigsAccountModal";


    modal.className =
      "emogigs-account-modal";


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    modal.innerHTML = `

      <div class="emogigs-account-backdrop"
           data-close-account="true">
      </div>

      <div class="emogigs-account-dialog"
           role="dialog"
           aria-modal="true"
           aria-labelledby="emogigsAccountTitle">

        <button
          type="button"
          class="emogigs-account-close"
          id="emogigsAccountClose"
          aria-label="Close">
          ×
        </button>

        <div class="emogigs-account-icon">
          ✦
        </div>

        <div class="emogigs-account-content">

          <h2 id="emogigsAccountTitle">
            Create Emogigs ID
          </h2>

          <p class="emogigs-account-subtitle">
            Create your free Emogigs ID to personalize
            your AI Life OS experience.
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

              <input
                type="text"
                id="emogigsUsername"
                name="username"
                placeholder="Choose your Emogigs ID"
                maxlength="20"
                autocomplete="username"
                required>

              <small>
                3–20 characters. Letters, numbers and underscore.
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


    /*
      Close button
    */

    const closeBtn =
      document.getElementById(
        "emogigsAccountClose"
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
      document.getElementById(
        "emogigsAccountForm"
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
      Continue button
    */

    const continueBtn =
      document.getElementById(
        "emogigsContinueBtn"
      );


    if (continueBtn) {

      continueBtn.addEventListener(
        "click",
        closeAccountModal
      );

    }


    /*
      Remove account button
    */

    const deleteBtn =
      document.getElementById(
        "emogigsDeleteAccountBtn"
      );


    if (deleteBtn) {

      deleteBtn.addEventListener(
        "click",
        removeEmogigsID
      );

    }


    /*
      Username formatting
    */

    const usernameInput =
      document.getElementById(
        "emogigsUsername"
      );


    if (usernameInput) {

      usernameInput.addEventListener(
        "input",
        () => {

          usernameInput.value =
            usernameInput.value
              .replace(/\s+/g, "")
              .replace(/[^a-zA-Z0-9_]/g, "")
              .slice(0, 20);

        }
      );

    }


    /*
      ESC key
    */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          modal.classList.contains("show")
        ) {

          closeAccountModal();

        }

      }
    );


    /*
      Modal CSS
      Added dynamically so no HTML/CSS change
      is required for the modal to appear.
    */

    injectAccountModalStyles();


    return modal;

  }


  /* =========================================================
     UPDATE ACCOUNT MODAL
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

          <div class="emogigs-profile-card">

            <div class="emogigs-profile-avatar">
              ${escapeHTML(
                getInitials(account.name)
              )}
            </div>

            <div class="emogigs-profile-info">

              <strong>
                ${escapeHTML(account.name)}
              </strong>

              <span>
                @${escapeHTML(account.username)}
              </span>

            </div>

          </div>

          <div class="emogigs-id-success">
            ✓ Emogigs ID is active
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
     CREATE EMOGIGS ID
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


    if (!nameInput || !usernameInput) {

      return;

    }


    const name =
      nameInput.value.trim();


    const username =
      usernameInput.value
        .trim()
        .toLowerCase();


    if (name.length < 2) {

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

      name: name,

      username: username,

      createdAt:
        new Date().toISOString()

    };


    try {

      localStorage.setItem(
        ACCOUNT_STORAGE_KEY,
        JSON.stringify(account)
      );

    } catch (error) {

      console.error(
        "Could not save Emogigs ID:",
        error
      );

      showToast(
        "Could not save Emogigs ID on this device."
      );

      return;

    }


    updateAccountModal();


    showToast(
      `Welcome to Emogigs, ${name}!`
    );


    updateAccountButton();

  }


  /* =========================================================
     GET ACCOUNT
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

      console.log(
        "Could not read Emogigs ID:",
        error
      );

      return null;

    }

  }


  /* =========================================================
     REMOVE ACCOUNT
  ========================================================== */

  function removeEmogigsID() {

    const confirmed =
      window.confirm(
        "Remove your Emogigs ID from this device?"
      );


    if (!confirmed) {

      return;

    }


    localStorage.removeItem(
      ACCOUNT_STORAGE_KEY
    );


    updateAccountModal();

    updateAccountButton();


    showToast(
      "Emogigs ID removed from this device."
    );

  }


  /* =========================================================
     UPDATE ACCOUNT BUTTON
  ========================================================== */

  function updateAccountButton() {

    const account =
      getEmogigsAccount();


    const buttons =
      document.querySelectorAll(
        "#accountBtn, #accountButton, .account-btn, .account-button, [data-action='account'], [data-account]"
      );


    buttons.forEach(button => {

      if (!account) {

        return;

      }


      /*
        Do not destroy the existing icon/design.
        Only update useful accessibility information.
      */

      button.setAttribute(
        "data-emogigs-user",
        account.username
      );


      button.setAttribute(
        "title",
        `Emogigs ID: @${account.username}`
      );

    });

  }


  /* =========================================================
     INITIAL ACCOUNT STATE
  ========================================================== */

  function initializeAccountState() {

    const account =
      getEmogigsAccount();


    if (account) {

      updateAccountButton();

    }

  }


  /* =========================================================
     INITIAL ACCOUNT STATE AFTER DOM LOAD
  ========================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      initializeAccountState();

    }
  );


  /* =========================================================
     ACCOUNT MODAL CLOSE
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
     ESCAPE HTML
  ========================================================== */

  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* =========================================================
     GET INITIALS
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


    if (words.length === 1) {

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
     ACCOUNT MODAL CSS
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
      document.createElement("style");


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
          opacity .2s ease,
          visibility .2s ease;
      }


      .emogigs-account-modal.show {
        opacity: 1;
        visibility: visible;
      }


      .emogigs-account-backdrop {
        position: absolute;
        inset: 0;

        background:
          rgba(0, 0, 0, .62);

        backdrop-filter:
          blur(7px);

        -webkit-backdrop-filter:
          blur(7px);
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
            #151525,
            #0d0d18
          );

        border:
          1px solid rgba(
            255,
            255,
            255,
            .12
          );

        border-radius: 24px;

        padding: 28px 22px 22px;

        box-shadow:
          0 25px 80px
          rgba(0,0,0,.45);

        transform:
          translateY(18px)
          scale(.97);

        transition:
          transform .22s ease;
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

        margin: 0 auto 14px;

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
          0 10px 30px
          rgba(
            124,
            92,
            255,
            .28
          );
      }


      .emogigs-account-content {
        text-align: center;
      }


      .emogigs-account-content h2 {
        margin:
          0 0 8px;

        color: white;

        font-size: 24px;

        font-weight: 700;
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

        font-weight: 600;
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
            .75
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
          0 10px 25px
          rgba(
            124,
            92,
            255,
            .22
          );
      }


      .emogigs-create-id-btn:active,
      .emogigs-continue-btn:active {
        transform: scale(.98);
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

        font-weight: 700;
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

        color: #75e6a5;

        font-size: 13px;
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

        padding: 15px 5px 4px;

        font-size: 12px;

        cursor: pointer;
      }


      @media (max-width: 480px) {

        .emogigs-account-modal {
          padding: 12px;
          align-items: flex-end;
        }

        .emogigs-account-dialog {
          width: 100%;
          border-radius: 24px 24px 18px 18px;
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


    if (!SpeechRecognition) {

      console.log(
        "SpeechRecognition is not supported."
      );

      return;

    }


    recognition =
      new SpeechRecognition();


    recognition.lang = "bn-BD";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;


    recognition.onstart = () => {

      console.log(
        "Emogigs voice recognition started."
      );

      voiceStarting = false;

      isListening = true;

      if (micBtn) {

        micBtn.classList.add("listening");

        micBtn.textContent = "⏹";

        micBtn.setAttribute(
          "aria-label",
          "Stop voice input"
        );

      }


      if (voiceStatus) {

        voiceStatus.classList.add("show");

      }


      if (voiceStatusText) {

        voiceStatusText.textContent =
          "Listening... speak now";

      }

    };


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


        if (voiceStatusText) {

          voiceStatusText.textContent =
            "Voice captured ✓";

        }


        setTimeout(() => {

          if (!isListening && voiceStatus) {

            voiceStatus.classList.remove(
              "show"
            );

          }

        }, 700);

      }

      else if (interimText.trim()) {

        if (voiceStatusText) {

          voiceStatusText.textContent =
            "Listening: " +
            interimText.trim();

        }

      }

    };


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
     RELEASE MICROPHONE
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


    voiceStarting = true;


    try {

      if (voiceStatus) {

        voiceStatus.classList.add("show");

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


      if (
        error &&
        error.name === "NotFoundError"
      ) {

        showToast(
          "No microphone was found on this device."
        );

        return;

      }


      if (
        error &&
        error.name === "NotReadableError"
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


    addMessage(
      "user",
      text
    );


    conversation.push({

      role: "user",

      content: text

    });


    saveConversation();


    messageInput.value = "";

    messageInput.style.height = "auto";


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


    const actions =
      document.createElement("div");


    actions.className =
      "message-actions";


    if (
      role === "assistant"
    ) {

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


    if (hero) {

      hero.style.display =
        "block";

    }


    if (quickTools) {

      quickTools.style.display =
        "block";

    }


    if (modeRow) {

      modeRow.style.display =
        "flex";

    }


    if (messageInput) {

      messageInput.value = "";

      messageInput.style.height =
        "auto";

    }


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