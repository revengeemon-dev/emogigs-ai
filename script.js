/* =========================================================
   EMOGIGS AI
   STEP 18D — PRODUCTION APP ENGINE
   Conversation + AI Chat + Voice Engine
========================================================= */

let isSending = false;

const STORAGE_KEY =
  "emogigs_conversations_v2";

let conversations = [];
let currentConversationId = null;


/* =========================================================
   STORAGE
========================================================= */

function loadConversations() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (saved) {

      conversations =
        JSON.parse(saved);

      if (!Array.isArray(conversations)) {
        conversations = [];
      }

    }

  } catch (error) {

    console.error(
      "Emogigs AI: Could not load conversations.",
      error
    );

    conversations = [];

  }

}


function saveConversations() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        conversations
      )
    );

  } catch (error) {

    console.error(
      "Emogigs AI: Could not save conversations.",
      error
    );

  }

}


/* =========================================================
   ID
========================================================= */

function createId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2)
  );

}


/* =========================================================
   CURRENT CONVERSATION
========================================================= */

function getCurrentConversation() {

  return conversations.find(
    conversation =>
      conversation.id ===
      currentConversationId
  );

}


function createConversation() {

  const conversation = {

    id: createId(),

    title: "New conversation",

    createdAt: Date.now(),

    updatedAt: Date.now(),

    messages: []

  };


  conversations.unshift(
    conversation
  );


  currentConversationId =
    conversation.id;


  saveConversations();


  return conversation;

}


/* =========================================================
   GET OR CREATE CHAT
========================================================= */

function ensureConversation() {

  let conversation =
    getCurrentConversation();


  if (!conversation) {

    conversation =
      createConversation();

  }


  return conversation;

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addConversationMessage(
  role,
  content
) {

  const conversation =
    ensureConversation();


  conversation.messages.push({

    role: role,

    content: content,

    timestamp: Date.now()

  });


  conversation.updatedAt =
    Date.now();


  /*
    Automatically create a useful title
    from the first user message.
  */

  if (
    role === "user" &&
    conversation.title ===
      "New conversation"
  ) {

    conversation.title =
      content.length > 42
        ? content.substring(0, 42) + "..."
        : content;

  }


  saveConversations();

}


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showScreen(
  screenId
) {

  const screens =
    document.querySelectorAll(
      ".screen"
    );


  screens.forEach(
    screen => {

      screen.classList.remove(
        "active"
      );

    }
  );


  const target =
    document.getElementById(
      screenId
    );


  if (target) {

    target.classList.add(
      "active"
    );

  }


  const navButtons =
    document.querySelectorAll(
      ".nav-btn"
    );


  navButtons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.screen ===
          screenId
      );

    }
  );


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });


  if (
    screenId ===
    "historyScreen"
  ) {

    renderHistory();

  }


  if (
    screenId ===
    "homeScreen"
  ) {

    renderRecentChats();

  }

}


/* =========================================================
   OPEN CHAT
========================================================= */

function openChat(
  conversationId
) {

  const conversation =
    conversations.find(
      item =>
        item.id ===
        conversationId
    );


  if (!conversation) {
    return;
  }


  currentConversationId =
    conversationId;


  stopSpeaking();


  showScreen(
    "chatScreen"
  );


  renderCurrentChat();

}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

  stopSpeaking();


  createConversation();


  renderCurrentChat();


  showScreen(
    "chatScreen"
  );


  setTimeout(
    () => {

      const input =
        document.getElementById(
          "chatInput"
        );


      if (input) {

        input.focus();

      }

    },
    100
  );

}


/* =========================================================
   RENDER CURRENT CHAT
========================================================= */

function renderCurrentChat() {

  const container =
    document.getElementById(
      "chatMessages"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  const conversation =
    getCurrentConversation();


  if (
    !conversation ||
    !Array.isArray(
      conversation.messages
    ) ||
    conversation.messages.length === 0
  ) {

    renderChatWelcome();

    return;

  }


  conversation.messages.forEach(
    message => {

      renderMessage(
        message.role,
        message.content
      );

    }
  );


  scrollChatToBottom();

}


/* =========================================================
   CHAT WELCOME
========================================================= */

function renderChatWelcome() {

  const container =
    document.getElementById(
      "chatMessages"
    );


  if (!container) {
    return;
  }


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "chat-message ai";


  const avatar =
    document.createElement(
      "div"
    );


  avatar.className =
    "message-ai-avatar";


  avatar.textContent =
    "✦";


  const messageWrap =
    document.createElement(
      "div"
    );


  messageWrap.className =
    "ai-message-wrap";


  const bubble =
    document.createElement(
      "div"
    );


  bubble.className =
    "ai-bubble";


  bubble.textContent =
    "Hello! I'm Emogigs AI. ✨\n\n" +
    "I can help you learn, plan, work, " +
    "create and grow. Tell me what you " +
    "want to achieve, and we'll take it " +
    "step by step.";


  messageWrap.appendChild(
    bubble
  );


  wrapper.appendChild(
    avatar
  );


  wrapper.appendChild(
    messageWrap
  );


  container.appendChild(
    wrapper
  );

}


/* =========================================================
   RENDER MESSAGE
========================================================= */

function renderMessage(
  role,
  content
) {

  const container =
    document.getElementById(
      "chatMessages"
    );


  if (!container) {
    return;
  }


  const wrapper =
    document.createElement(
      "div"
    );


  /* =======================================================
     USER MESSAGE
  ======================================================= */

  if (role === "user") {

    wrapper.className =
      "chat-message user";


    const bubble =
      document.createElement(
        "div"
      );


    bubble.className =
      "user-bubble";


    bubble.textContent =
      content;


    wrapper.appendChild(
      bubble
    );


  }

  /* =======================================================
     AI MESSAGE
  ======================================================= */

  else {

    wrapper.className =
      "chat-message ai";


    const avatar =
      document.createElement(
        "div"
      );


    avatar.className =
      "message-ai-avatar";


    avatar.textContent =
      "✦";


    const messageWrap =
      document.createElement(
        "div"
      );


    messageWrap.className =
      "ai-message-wrap";


    const bubble =
      document.createElement(
        "div"
      );


    bubble.className =
      "ai-bubble";


    bubble.textContent =
      content;


    /* =====================================================
       MESSAGE ACTIONS
    ===================================================== */

    const actions =
      document.createElement(
        "div"
      );


    actions.className =
      "message-actions";


    /* COPY */

    const copyButton =
      createActionButton(
        "⧉",
        "Copy"
      );


    copyButton.onclick =
      () => {

        copyText(
          content
        );

      };


    /* LIKE */

    const likeButton =
      createActionButton(
        "♡",
        "Like"
      );


    likeButton.onclick =
      () => {

        likeButton.textContent =
          "♥";


        showToast(
          "Thanks for your feedback."
        );

      };


    /* DISLIKE */

    const dislikeButton =
      createActionButton(
        "♧",
        "Dislike"
      );


    dislikeButton.onclick =
      () => {

        showToast(
          "Feedback recorded."
        );

      };


    /* SHARE */

    const shareButton =
      createActionButton(
        "↗",
        "Share"
      );


    shareButton.onclick =
      () => {

        shareText(
          content
        );

      };


    /* VOICE */

    const voiceButton =
      createVoiceButton(
        content
      );


    actions.appendChild(
      copyButton
    );


    actions.appendChild(
      likeButton
    );


    actions.appendChild(
      dislikeButton
    );


    actions.appendChild(
      shareButton
    );


    actions.appendChild(
      voiceButton
    );


    messageWrap.appendChild(
      bubble
    );


    messageWrap.appendChild(
      actions
    );


    wrapper.appendChild(
      avatar
    );


    wrapper.appendChild(
      messageWrap
    );

  }


  container.appendChild(
    wrapper
  );

}


/* =========================================================
   ACTION BUTTON
========================================================= */

function createActionButton(
  icon,
  label
) {

  const button =
    document.createElement(
      "button"
    );


  button.className =
    "message-action";


  button.textContent =
    icon;


  button.title =
    label;


  button.type =
    "button";


  return button;

}


/* =========================================================
   THINKING
========================================================= */

function showThinking() {

  const container =
    document.getElementById(
      "chatMessages"
    );


  if (!container) {
    return null;
  }


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "chat-message ai";


  const avatar =
    document.createElement(
      "div"
    );


  avatar.className =
    "message-ai-avatar";


  avatar.textContent =
    "✦";


  const messageWrap =
    document.createElement(
      "div"
    );


  messageWrap.className =
    "ai-message-wrap";


  const bubble =
    document.createElement(
      "div"
    );


  bubble.className =
    "ai-bubble";


  const thinking =
    document.createElement(
      "div"
    );


  thinking.className =
    "thinking";


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    const dot =
      document.createElement(
        "span"
      );


    thinking.appendChild(
      dot
    );

  }


  bubble.appendChild(
    thinking
  );


  messageWrap.appendChild(
    bubble
  );


  wrapper.appendChild(
    avatar
  );


  wrapper.appendChild(
    messageWrap
  );


  container.appendChild(
    wrapper
  );


  scrollChatToBottom();


  return wrapper;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage(
  customText = null
) {

  if (isSending) {
    return;
  }


  const chatInput =
    document.getElementById(
      "chatInput"
    );


  const homeInput =
    document.getElementById(
      "homeInput"
    );


  let text =
    customText !== null
      ? String(customText).trim()
      : chatInput
        ? chatInput.value.trim()
        : "";


  if (!text) {
    return;
  }


  isSending = true;


  ensureConversation();


  showScreen(
    "chatScreen"
  );


  addConversationMessage(
    "user",
    text
  );


  if (chatInput) {
    chatInput.value = "";
  }


  if (homeInput) {
    homeInput.value = "";
  }


  renderCurrentChat();


  const thinkingElement =
    showThinking();


  const sendButton =
    document.getElementById(
      "chatSend"
    );


  if (sendButton) {

    sendButton.disabled =
      true;

  }


  try {

    console.log(
      "Emogigs AI: Sending request..."
    );


    const res =
      await fetch(
        "/api/chat",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              message: text

            })

        }
      );


    console.log(
      "Emogigs AI:",
      res.status
    );


    let data;


    try {

      data =
        await res.json();

    } catch (jsonError) {

      throw new Error(
        "Invalid server response."
      );

    }


    if (!res.ok) {

      throw new Error(
        data.error ||
        "Server returned an error."
      );

    }


    const reply =
      data.reply ||
      "I couldn't generate a response.";


    if (thinkingElement) {

      thinkingElement.remove();

    }


    addConversationMessage(
      "assistant",
      reply
    );


    renderCurrentChat();


    /*
      Automatically speak the real AI response.
    */

    autoSpeakResponse(
      reply
    );


    scrollChatToBottom();


  } catch (error) {

    console.error(
      "EMOGIGS AI ERROR:",
      error
    );


    if (thinkingElement) {

      thinkingElement.remove();

    }


    const errorMessage =
      "I'm sorry, I couldn't connect " +
      "to Emogigs AI right now. " +
      "Please try again in a moment.";


    addConversationMessage(
      "assistant",
      errorMessage
    );


    renderCurrentChat();


    showToast(
      "Could not connect to Emogigs AI."
    );

  } finally {

    isSending =
      false;


    if (sendButton) {

      sendButton.disabled =
        false;

    }

  }

}


/* =========================================================
   SCROLL
========================================================= */

function scrollChatToBottom() {

  const container =
    document.getElementById(
      "chatMessages"
    );


  if (!container) {
    return;
  }


  setTimeout(
    () => {

      container.scrollTop =
        container.scrollHeight;


      window.scrollTo({

        top:
          document.body.scrollHeight,

        behavior:
          "smooth"

      });

    },
    50
  );

}


/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

  const list =
    document.getElementById(
      "historyList"
    );


  if (!list) {
    return;
  }


  list.innerHTML =
    "";


  if (
    conversations.length ===
    0
  ) {

    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <div>No conversations yet.</div>
      </div>
    `;

    return;

  }


  conversations
    .slice()
    .sort(
      (a, b) =>
        b.updatedAt -
        a.updatedAt
    )
    .forEach(
      conversation => {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "history-item";


        item.onclick =
          event => {

            if (
              event.target.closest(
                ".history-delete"
              )
            ) {

              return;

            }


            openChat(
              conversation.id
            );

          };


        const icon =
          document.createElement(
            "div"
          );


        icon.className =
          "history-icon";


        icon.textContent =
          "▣";


        const info =
          document.createElement(
            "div"
          );


        info.className =
          "history-info";


        const title =
          document.createElement(
            "div"
          );


        title.className =
          "history-title";


        title.textContent =
          conversation.title;


        const preview =
          document.createElement(
            "div"
          );


        preview.className =
          "history-preview";


        const lastMessage =
          conversation.messages[
            conversation.messages.length - 1
          ];


        preview.textContent =
          lastMessage
            ? lastMessage.content
            : "Empty conversation";


        info.appendChild(
          title
        );


        info.appendChild(
          preview
        );


        const deleteButton =
          document.createElement(
            "button"
          );


        deleteButton.className =
          "history-delete";


        deleteButton.textContent =
          "🗑";


        deleteButton.type =
          "button";


        deleteButton.onclick =
          event => {

            event.stopPropagation();


            deleteConversation(
              conversation.id
            );

          };


        item.appendChild(
          icon
        );


        item.appendChild(
          info
        );


        item.appendChild(
          deleteButton
        );


        list.appendChild(
          item
        );

      }
    );

}


/* =========================================================
   RECENT CHATS
========================================================= */

function renderRecentChats() {

  const list =
    document.getElementById(
      "recentChats"
    );


  if (!list) {
    return;
  }


  list.innerHTML =
    "";


  const recent =
    conversations
      .slice()
      .sort(
        (a, b) =>
          b.updatedAt -
          a.updatedAt
      )
      .slice(
        0,
        4
      );


  if (
    recent.length ===
    0
  ) {

    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✨</div>
        <div>Your recent chats will appear here.</div>
      </div>
    `;

    return;

  }


  recent.forEach(
    conversation => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "recent-item";


      button.type =
        "button";


      button.onclick =
        () =>
          openChat(
            conversation.id
          );


      button.innerHTML = `
        <div class="recent-icon">▣</div>
        <div class="recent-title">
          ${escapeHTML(
            conversation.title
          )}
        </div>
        <div class="recent-time">
          ${formatTime(
            conversation.updatedAt
          )}
        </div>
      `;


      list.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   DELETE CONVERSATION
========================================================= */

function deleteConversation(
  conversationId
) {

  stopSpeaking();


  conversations =
    conversations.filter(
      conversation =>
        conversation.id !==
        conversationId
    );


  if (
    currentConversationId ===
    conversationId
  ) {

    currentConversationId =
      null;


    if (
      conversations.length ===
      0
    ) {

      createConversation();

    } else {

      currentConversationId =
        conversations[0].id;

    }

  }


  saveConversations();


  renderHistory();


  renderRecentChats();


  showToast(
    "Conversation deleted."
  );

}


/* =========================================================
   TEMPLATE
========================================================= */

function useTemplate(
  text
) {

  startNewChat();


  setTimeout(
    () => {

      const input =
        document.getElementById(
          "chatInput"
        );


      if (input) {

        input.value =
          text;


        input.focus();


        autoResize(
          input
        );

      }

    },
    100
  );

}


/* =========================================================
   COPY
========================================================= */

async function copyText(
  text
) {

  try {

    if (
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {

      await navigator.clipboard.writeText(
        text
      );

    } else {

      const textarea =
        document.createElement(
          "textarea"
        );


      textarea.value =
        text;


      textarea.style.position =
        "fixed";


      textarea.style.opacity =
        "0";


      document.body.appendChild(
        textarea
      );


      textarea.select();


      document.execCommand(
        "copy"
      );


      textarea.remove();

    }


    showToast(
      "Response copied."
    );


  } catch (error) {

    console.error(
      "Copy error:",
      error
    );


    showToast(
      "Copy is not available."
    );

  }

}


/* =========================================================
   SHARE
========================================================= */

async function shareText(
  text
) {

  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          "Emogigs AI",

        text:
          text

      });

    } else {

      await copyText(
        text
      );


      showToast(
        "Response copied for sharing."
      );

    }

  } catch (error) {

    console.log(
      "Share cancelled."
    );

  }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(
  message
) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) {
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
      2200
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  text
) {

  return String(text)

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
   TIME
========================================================= */

function formatTime(
  timestamp
) {

  const date =
    new Date(
      timestamp
    );


  const now =
    new Date();


  const difference =
    now.getTime() -
    date.getTime();


  const minutes =
    Math.floor(
      difference /
      60000
    );


  if (minutes < 1) {

    return "now";

  }


  if (minutes < 60) {

    return `${minutes}m`;

  }


  const hours =
    Math.floor(
      minutes /
      60
    );


  if (hours < 24) {

    return `${hours}h`;

  }


  const days =
    Math.floor(
      hours /
      24
    );


  if (days < 7) {

    return `${days}d`;

  }


  return date.toLocaleDateString();

}


/* =========================================================
   AUTO RESIZE
========================================================= */

function autoResize(
  textarea
) {

  if (!textarea) {
    return;
  }


  textarea.style.height =
    "auto";


  textarea.style.height =
    Math.min(
      textarea.scrollHeight,
      130
    ) + "px";

}


/* =========================================================
   EMOGIGS AI
   STEP 18D — VOICE ENGINE
========================================================= */

const VOICE_STORAGE_KEY =
  "emogigs_voice_settings_v2";


let voiceSettings = {

  gender:
    "natural",

  language:
    "auto",

  rate:
    1,

  autoSpeak:
    true,

  conversation:
    false

};


let availableVoices = [];


/*
  Current speech state
*/

let currentSpeech = null;

let speechChunks = [];

let speechChunkIndex = 0;

let currentSpeechButton = null;

let speechSessionId = 0;


/*
  Voice recognition
*/

let speechRecognition = null;

let isVoiceListening = false;


/* =========================================================
   LOAD VOICE SETTINGS
========================================================= */

function loadVoiceSettings() {

  try {

    const saved =
      localStorage.getItem(
        VOICE_STORAGE_KEY
      );


    if (saved) {

      const parsed =
        JSON.parse(
          saved
        );


      if (
        parsed &&
        typeof parsed ===
          "object"
      ) {

        voiceSettings = {

          ...voiceSettings,

          ...parsed

        };

      }

    }

  } catch (error) {

    console.error(
      "Emogigs AI: Could not load voice settings.",
      error
    );

  }

}


/* =========================================================
   SAVE VOICE SETTINGS
========================================================= */

function saveVoiceSettings() {

  try {

    localStorage.setItem(

      VOICE_STORAGE_KEY,

      JSON.stringify(
        voiceSettings
      )

    );

  } catch (error) {

    console.error(
      "Emogigs AI: Could not save voice settings.",
      error
    );

  }

}


/* =========================================================
   LOAD BROWSER VOICES
========================================================= */

function loadAvailableVoices() {

  if (
    !(
      "speechSynthesis" in
      window
    )
  ) {

    console.warn(
      "Speech synthesis is not supported."
    );


    availableVoices =
      [];


    return;

  }


  availableVoices =
    window.speechSynthesis
      .getVoices();


  console.log(
    "Emogigs AI voices loaded:",
    availableVoices.length
  );

}


/* =========================================================
   GET LANGUAGE CODE
========================================================= */

function getLanguageCode() {

  if (
    voiceSettings.language ===
    "auto"
  ) {

    return null;

  }


  return voiceSettings.language;

}


/* =========================================================
   DETECT TEXT LANGUAGE
========================================================= */

function detectTextLanguage(
  text
) {

  const value =
    String(text || "");


  /*
    Bengali Unicode range:
    U+0980 — U+09FF
  */

  const bengaliMatches =
    value.match(
      /[\u0980-\u09FF]/g
    );


  const englishMatches =
    value.match(
      /[A-Za-z]/g
    );


  const bengaliCount =
    bengaliMatches
      ? bengaliMatches.length
      : 0;


  const englishCount =
    englishMatches
      ? englishMatches.length
      : 0;


  if (
    bengaliCount >
    englishCount
  ) {

    return "bn";

  }


  return "en";

}


/* =========================================================
   GET SPEECH LANGUAGE
========================================================= */

function getSpeechLanguage(
  text
) {

  const configured =
    getLanguageCode();


  if (configured) {

    return configured;

  }


  /*
    Auto language mode.
    Browser speech synthesis cannot
    truly auto-detect every language,
    so we detect Bengali vs English
    from the response text.
  */

  const detected =
    detectTextLanguage(
      text
    );


  if (
    detected ===
    "bn"
  ) {

    return "bn-BD";

  }


  return "en-US";

}


/* =========================================================
   FIND BEST VOICE
========================================================= */

function findBestVoice(
  text = ""
) {

  if (
    !availableVoices.length &&
    "speechSynthesis" in window
  ) {

    availableVoices =
      window.speechSynthesis
        .getVoices();

  }


  if (
    !availableVoices.length
  ) {

    return null;

  }


  const language =
    getSpeechLanguage(
      text
    );


  const languagePrefix =
    language
      .toLowerCase()
      .split("-")[0];


  let voices =
    availableVoices.slice();


  /*
    First try exact language.
  */

  let languageVoices =
    voices.filter(
      voice =>
        voice.lang
          .toLowerCase()
          ===
          language.toLowerCase()
    );


  /*
    Then try language prefix.
  */

  if (
    languageVoices.length ===
    0
  ) {

    languageVoices =
      voices.filter(
        voice =>
          voice.lang
            .toLowerCase()
            .startsWith(
              languagePrefix
            )
      );

  }


  if (
    languageVoices.length
  ) {

    voices =
      languageVoices;

  }


  /*
    Female voice preference
  */

  if (
    voiceSettings.gender ===
    "female"
  ) {

    const femaleVoice =
      voices.find(
        voice => {

          const name =
            voice.name
              .toLowerCase();


          return (

            name.includes(
              "female"
            ) ||

            name.includes(
              "woman"
            ) ||

            name.includes(
              "zira"
            ) ||

            name.includes(
              "samantha"
            ) ||

            name.includes(
              "susan"
            ) ||

            name.includes(
              "karen"
            ) ||

            name.includes(
              "victoria"
            ) ||

            name.includes(
              "google uk english female"
            ) ||

            name.includes(
              "google us english"
            )

          );

        }
      );


    if (femaleVoice) {

      return femaleVoice;

    }

  }


  /*
    Male voice preference
  */

  if (
    voiceSettings.gender ===
    "male"
  ) {

    const maleVoice =
      voices.find(
        voice => {

          const name =
            voice.name
              .toLowerCase();


          return (

            name.includes(
              "male"
            ) ||

            name.includes(
              "man"
            ) ||

            name.includes(
              "david"
            ) ||

            name.includes(
              "daniel"
            ) ||

            name.includes(
              "alex"
            ) ||

            name.includes(
              "george"
            ) ||

            name.includes(
              "mark"
            ) ||

            name.includes(
              "google uk english male"
            )

          );

        }
      );


    if (maleVoice) {

      return maleVoice;

    }

  }


  /*
    Natural/default voice
  */

  const defaultVoice =
    voices.find(
      voice =>
        voice.default
    );


  if (defaultVoice) {

    return defaultVoice;

  }


  return (
    voices[0] ||
    null
  );

}


/* =========================================================
   SPLIT TEXT FOR ANDROID
========================================================= */

function splitSpeechText(
  text,
  maxLength = 180
) {

  const clean =
    String(text || "")
      .trim();


  if (!clean) {

    return [];

  }


  if (
    clean.length <=
    maxLength
  ) {

    return [clean];

  }


  /*
    Split by sentences first.
  */

  const sentences =
    clean.split(
      /(?<=[.!?।！？])\s+/u
    );


  const chunks = [];

  let current = "";


  sentences.forEach(
    sentence => {

      sentence =
        sentence.trim();


      if (!sentence) {
        return;
      }


      if (
        (
          current.length +
          sentence.length +
          1
        ) <=
        maxLength
      ) {

        current =
          current
            ? current +
              " " +
              sentence
            : sentence;

      } else {

        if (current) {

          chunks.push(
            current
          );

        }


        /*
          Very long sentence.
        */

        if (
          sentence.length >
          maxLength
        ) {

          for (
            let i = 0;
            i < sentence.length;
            i += maxLength
          ) {

            chunks.push(
              sentence.substring(
                i,
                i + maxLength
              )
            );

          }


          current = "";

        } else {

          current =
            sentence;

        }

      }

    }
  );


  if (current) {

    chunks.push(
      current
    );

  }


  return chunks;

}


/* =========================================================
   RESET VOICE BUTTONS
========================================================= */

function resetVoiceButtons() {

  document
    .querySelectorAll(
      ".voice-action-button.speaking"
    )
    .forEach(
      button => {

        button.classList.remove(
          "speaking"
        );

      }
    );

}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

  /*
    Invalidate current speech session.
  */

  speechSessionId++;


  if (
    "speechSynthesis" in
    window
  ) {

    window.speechSynthesis.cancel();

  }


  currentSpeech =
    null;


  speechChunks =
    [];


  speechChunkIndex =
    0;


  currentSpeechButton =
    null;


  resetVoiceButtons();

}


/* =========================================================
   SPEAK NEXT CHUNK
========================================================= */

function speakNextChunk(
  sessionId
) {

  /*
    Session is no longer active.
  */

  if (
    sessionId !==
    speechSessionId
  ) {

    return;

  }


  if (
    speechChunkIndex >=
    speechChunks.length
  ) {

    currentSpeech =
      null;


    resetVoiceButtons();


    return;

  }


  const text =
    speechChunks[
      speechChunkIndex
    ];


  const utterance =
    new SpeechSynthesisUtterance(
      text
    );


  const voice =
    findBestVoice(
      text
    );


  const language =
    getSpeechLanguage(
      text
    );


  if (voice) {

    utterance.voice =
      voice;


    utterance.lang =
      voice.lang;

  } else {

    utterance.lang =
      language;

  }


  utterance.rate =
    Number(
      voiceSettings.rate
    ) || 1;


  utterance.pitch =
    1;


  utterance.volume =
    1;


  currentSpeech =
    utterance;


  utterance.onstart =
    () => {

      if (
        sessionId !==
        speechSessionId
      ) {

        return;

      }


      console.log(
        "Emogigs AI: Voice started."
      );


      if (
        currentSpeechButton
      ) {

        currentSpeechButton.classList.add(
          "speaking"
        );

      }

    };


  utterance.onend =
    () => {

      if (
        sessionId !==
        speechSessionId
      ) {

        return;

      }


      speechChunkIndex++;


      currentSpeech =
        null;


      /*
        Small delay between chunks
        improves Android stability.
      */

      setTimeout(
        () => {

          speakNextChunk(
            sessionId
          );

        },
        40
      );

    };


  utterance.onerror =
    error => {

      if (
        sessionId !==
        speechSessionId
      ) {

        return;

      }


      console.error(
        "Emogigs AI voice error:",
        error
      );


      currentSpeech =
        null;


      resetVoiceButtons();


      /*
        Ignore normal cancellation.
      */

      if (
        error &&
        error.error ===
          "canceled"
      ) {

        return;

      }


      if (
        error &&
        error.error ===
          "interrupted"
      ) {

        return;

      }


      showToast(
        "Voice playback could not continue."
      );

    };


  window.speechSynthesis.speak(
    utterance
  );

}


/* =========================================================
   SPEAK TEXT
   PRODUCTION VERSION
========================================================= */

function speakText(
  text,
  button = null
) {

  if (
    !text ||
    !String(text).trim()
  ) {

    return;

  }


  if (
    !(
      "speechSynthesis" in
      window
    )
  ) {

    showToast(
      "Voice playback is not supported on this browser."
    );


    return;

  }


  /*
    Stop previous speech.
  */

  stopSpeaking();


  /*
    Remember button.
  */

  currentSpeechButton =
    button;


  /*
    Create new session.
  */

  const sessionId =
    speechSessionId;


  /*
    Split long response.
  */

  speechChunks =
    splitSpeechText(
      text
    );


  speechChunkIndex =
    0;


  if (
    speechChunks.length ===
    0
  ) {

    return;

  }


  /*
    Refresh voices.
  */

  loadAvailableVoices();


  /*
    Android may load voices
    asynchronously.
  */

  const startSpeech =
    () => {

      if (
        sessionId !==
        speechSessionId
      ) {

        return;

      }


      loadAvailableVoices();


      speakNextChunk(
        sessionId
      );

    };


  const voices =
    window.speechSynthesis
      .getVoices();


  if (
    voices &&
    voices.length > 0
  ) {

    startSpeech();

  } else {

    /*
      Wait for Android voices.
    */

    let started =
      false;


    const startOnce =
      () => {

        if (started) {
          return;
        }


        started =
          true;


        window.speechSynthesis
          .removeEventListener(
            "voiceschanged",
            startOnce
          );


        startSpeech();

      };


    window.speechSynthesis
      .addEventListener(
        "voiceschanged",
        startOnce
      );


    /*
      Fallback.
    */

    setTimeout(
      () => {

        startOnce();

      },
      600
    );

  }

}


/* =========================================================
   TOGGLE SPEECH
   REAL AI RESPONSE
========================================================= */

function toggleSpeech(
  text,
  button
) {

  console.log(
    "Emogigs AI: Voice button clicked."
  );


  /*
    If this exact button is currently
    speaking, stop it.
  */

  if (
    currentSpeech &&
    currentSpeechButton ===
      button
  ) {

    stopSpeaking();


    showToast(
      "Voice stopped."
    );


    return;

  }


  /*
    Otherwise speak the actual
    AI response.
  */

  speakText(
    text,
    button
  );

}


/* =========================================================
   UPDATE VOICE RATE DISPLAY
========================================================= */

function updateVoiceRateDisplay() {

  const rateInput =
    document.getElementById(
      "voiceRate"
    );


  const rateValue =
    document.getElementById(
      "voiceRateValue"
    );


  if (
    rateInput &&
    rateValue
  ) {

    rateValue.textContent =
      Number(
        rateInput.value
      ).toFixed(2) +
      "×";

  }

}


/* =========================================================
   APPLY VOICE SETTINGS TO UI
========================================================= */

function applyVoiceSettingsToUI() {

  const gender =
    document.getElementById(
      "voiceGender"
    );


  const language =
    document.getElementById(
      "voiceLanguage"
    );


  const rate =
    document.getElementById(
      "voiceRate"
    );


  const autoSpeak =
    document.getElementById(
      "voiceAutoSpeak"
    );


  const conversation =
    document.getElementById(
      "voiceConversation"
    );


  if (gender) {

    gender.value =
      voiceSettings.gender;

  }


  if (language) {

    language.value =
      voiceSettings.language;

  }


  if (rate) {

    rate.value =
      voiceSettings.rate;

  }


  if (autoSpeak) {

    autoSpeak.value =
      voiceSettings.autoSpeak
        ? "on"
        : "off";

  }


  if (conversation) {

    conversation.value =
      voiceSettings.conversation
        ? "on"
        : "off";

  }


  updateVoiceRateDisplay();

}


/* =========================================================
   VOICE SETTINGS EVENTS
========================================================= */

function initializeVoiceSettings() {

  const panel =
    document.getElementById(
      "voiceSettingsPanel"
    );


  if (!panel) {

    console.warn(
      "Voice settings panel not found."
    );


    return;

  }


  const gender =
    document.getElementById(
      "voiceGender"
    );


  const language =
    document.getElementById(
      "voiceLanguage"
    );


  const rate =
    document.getElementById(
      "voiceRate"
    );


  const autoSpeak =
    document.getElementById(
      "voiceAutoSpeak"
    );


  const conversation =
    document.getElementById(
      "voiceConversation"
    );


  if (gender) {

    gender.addEventListener(
      "change",
      () => {

        voiceSettings.gender =
          gender.value;


        saveVoiceSettings();


        stopSpeaking();

      }
    );

  }


  if (language) {

    language.addEventListener(
      "change",
      () => {

        voiceSettings.language =
          language.value;


        saveVoiceSettings();


        stopSpeaking();


        /*
          Recreate recognition
          with new language.
        */

        initializeSpeechRecognition();

      }
    );

  }


  if (rate) {

    rate.addEventListener(
      "input",
      () => {

        voiceSettings.rate =
          Number(
            rate.value
          );


        updateVoiceRateDisplay();


        saveVoiceSettings();

      }
    );

  }


  if (autoSpeak) {

    autoSpeak.addEventListener(
      "change",
      () => {

        voiceSettings.autoSpeak =
          autoSpeak.value ===
          "on";


        saveVoiceSettings();

      }
    );

  }


  if (conversation) {

    conversation.addEventListener(
      "change",
      () => {

        voiceSettings.conversation =
          conversation.value ===
          "on";


        saveVoiceSettings();

      }
    );

  }


  applyVoiceSettingsToUI();

}


/* =========================================================
   VOICE SETTINGS PANEL TOGGLE
========================================================= */

function toggleVoiceSettingsPanel() {

  const panel =
    document.getElementById(
      "voiceSettingsPanel"
    );


  if (!panel) {

    showToast(
      "Voice settings are not available."
    );


    return;

  }


  panel.classList.toggle(
    "show"
  );

}


/* =========================================================
   SPEECH RECOGNITION
   FINAL VERSION
========================================================= */

function initializeSpeechRecognition() {

  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!Recognition) {

    console.warn(
      "Emogigs AI: Speech recognition is not supported."
    );


    speechRecognition =
      null;


    return;

  }


  /*
    Stop old recognition instance.
  */

  if (
    speechRecognition
  ) {

    try {

      speechRecognition.abort();

    } catch (error) {

      console.log(
        "Old recognition instance closed."
      );

    }

  }


  speechRecognition =
    new Recognition();


  speechRecognition.continuous =
    false;


  speechRecognition.interimResults =
    false;


  speechRecognition.maxAlternatives =
    1;


  /*
    Recognition language.
  */

  if (
    voiceSettings.language &&
    voiceSettings.language !==
      "auto"
  ) {

    speechRecognition.lang =
      voiceSettings.language;

  } else {

    /*
      Web Speech API cannot truly
      auto-detect multiple languages
      during one recognition session.
      
      English is used as the safe
      browser fallback.
    */

    speechRecognition.lang =
      "en-US";

  }


  /* =======================================================
     START
  ======================================================= */

  speechRecognition.onstart =
    () => {

      console.log(
        "Emogigs AI: 🎙️ Voice Assistant is listening."
      );


      isVoiceListening =
        true;


      updateVoiceListeningUI(
        true
      );


      showToast(
        "🎙️ Listening..."
      );

    };


  /* =======================================================
     RESULT
  ======================================================= */

  speechRecognition.onresult =
    event => {

      console.log(
        "Emogigs AI: Voice result received."
      );


      let transcript =
        "";


      for (
        let i =
          event.resultIndex;

        i <
          event.results.length;

        i++
      ) {

        if (
          event.results[i]
            .isFinal
        ) {

          transcript +=
            event.results[i][0]
              .transcript;

        }

      }


      transcript =
        transcript.trim();


      console.log(
        "Emogigs AI: Voice transcript:",
        transcript
      );


      if (!transcript) {

        showToast(
          "I couldn't hear anything. Please try again."
        );


        return;

      }


      /*
        Put recognized text
        into chat input.
      */

      const input =
        document.getElementById(
          "chatInput"
        );


      if (input) {

        input.value =
          transcript;


        autoResize(
          input
        );

      }


      /*
        Send to Emogigs AI.
      */

      sendMessage(
        transcript
      );

    };


  /* =======================================================
     ERROR
  ======================================================= */

  speechRecognition.onerror =
    event => {

      console.error(
        "Emogigs AI Voice Recognition Error:",
        event.error,
        event
      );


      isVoiceListening =
        false;


      updateVoiceListeningUI(
        false
      );


      if (
        event.error ===
        "not-allowed"
      ) {

        showToast(
          "🎙️ Microphone permission was denied. Please allow microphone access."
        );


        return;

      }


      if (
        event.error ===
        "audio-capture"
      ) {

        showToast(
          "🎙️ Microphone could not be accessed."
        );


        return;

      }


      if (
        event.error ===
        "no-speech"
      ) {

        showToast(
          "🎙️ I didn't hear anything. Please try again."
        );


        return;

      }


      if (
        event.error ===
        "network"
      ) {

        showToast(
          "Voice recognition network error. Please try again."
        );


        return;

      }


      if (
        event.error ===
        "aborted"
      ) {

        return;

      }


      showToast(
        "Voice Assistant could not start. Please try again."
      );

    };


  /* =======================================================
     END
  ======================================================= */

  speechRecognition.onend =
    () => {

      console.log(
        "Emogigs AI: 🎙️ Voice Assistant stopped."
      );


      isVoiceListening =
        false;


      updateVoiceListeningUI(
        false
      );

    };


  console.log(
    "Emogigs AI: Voice Assistant initialized successfully."
  );

}


/* =========================================================
   START VOICE INPUT
========================================================= */

function startVoiceInput() {

  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!Recognition) {

    showToast(
      "Voice input is not supported on this browser."
    );


    console.error(
      "Emogigs AI: Speech Recognition is not supported."
    );


    return;

  }


  if (!speechRecognition) {

    initializeSpeechRecognition();

  }


  if (!speechRecognition) {

    showToast(
      "Could not start the voice assistant."
    );


    return;

  }


  /*
    Toggle listening.
  */

  if (isVoiceListening) {

    try {

      speechRecognition.stop();

    } catch (error) {

      console.error(
        "Emogigs AI: Could not stop voice recognition.",
        error
      );

    }


    return;

  }


  /*
    Stop AI speech before microphone.
  */

  stopSpeaking();


  /*
    Set recognition language.
  */

  if (
    voiceSettings.language &&
    voiceSettings.language !==
      "auto"
  ) {

    speechRecognition.lang =
      voiceSettings.language;

  } else {

    speechRecognition.lang =
      "en-US";

  }


  /*
    Start microphone.
  */

  try {

    speechRecognition.start();


    console.log(
      "Emogigs AI: Voice Assistant starting..."
    );


  } catch (error) {

    console.error(
      "Emogigs AI: Could not start voice recognition:",
      error
    );


    if (
      error.name ===
      "InvalidStateError"
    ) {

      showToast(
        "Voice Assistant is already listening."
      );


      return;

    }


    showToast(
      "Please allow microphone access and try again."
    );

  }

}


/* =========================================================
   VOICE LISTENING UI
========================================================= */

function updateVoiceListeningUI(
  listening
) {

  document
    .querySelectorAll(
      ".voice-mic-button"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "listening",
          listening
        );

      }
    );


  document
    .querySelectorAll(
      ".voice-status"
    )
    .forEach(
      status => {

        status.classList.toggle(
          "active",
          listening
        );


        status.textContent =
          listening
            ? "🎙️ Listening..."
            : "Voice ready";

      }
    );

}


/* =========================================================
   VOICE ACTION BUTTON
========================================================= */

function createVoiceButton(
  text
) {

  const button =
    createActionButton(
      "🔊",
      "Listen to response"
    );


  button.classList.add(
    "voice-action-button"
  );


  button.type =
    "button";


  button.onclick =
    () => {

      toggleSpeech(
        text,
        button
      );

    };


  return button;

}


/* =========================================================
   AUTO SPEAK AI RESPONSE
========================================================= */

function autoSpeakResponse(
  text
) {

  if (
    !voiceSettings.autoSpeak
  ) {

    return;

  }


  setTimeout(
    () => {

      speakText(
        text
      );

    },
    250
  );

}


/* =========================================================
   VOICE SUPPORT CHECK
========================================================= */

function checkVoiceSupport() {

  const speech =
    "speechSynthesis" in
    window;


  const recognition =
    !!(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    );


  console.log(
    "Emogigs AI Voice Support:",
    {

      speechSynthesis:
        speech,

      speechRecognition:
        recognition

    }
  );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "Emogigs AI Step 18D frontend loaded."
    );


    /* =================================================
       VOICE INITIALIZATION
    ================================================= */

    loadVoiceSettings();


    loadAvailableVoices();


    if (
      "speechSynthesis" in
      window
    ) {

      /*
        Android / Chrome voice loading.
      */

      window.speechSynthesis
        .addEventListener(
          "voiceschanged",
          loadAvailableVoices
        );

    }


    initializeVoiceSettings();


    initializeSpeechRecognition();


    checkVoiceSupport();


    /* =================================================
       CONVERSATION STORAGE
    ================================================= */

    loadConversations();


    if (
      conversations.length ===
      0
    ) {

      createConversation();

    }


    if (
      !currentConversationId ||
      !conversations.some(
        conversation =>
          conversation.id ===
          currentConversationId
      )
    ) {

      currentConversationId =
        conversations[0].id;

    }


    renderRecentChats();


    /* =================================================
       NAVIGATION
    ================================================= */

    document
      .querySelectorAll(
        ".nav-btn"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const screen =
                button.dataset.screen;


              showScreen(
                screen
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-screen]"
      )
      .forEach(
        button => {

          if (
            !button.classList.contains(
              "nav-btn"
            )
          ) {

            button.addEventListener(
              "click",
              () => {

                showScreen(
                  button.dataset.screen
                );

              }
            );

          }

        }
      );


    /* =================================================
       NEW CHAT
    ================================================= */

    const newChatButton =
      document.getElementById(
        "headerNewChat"
      );


    if (newChatButton) {

      newChatButton.addEventListener(
        "click",
        startNewChat
      );

    }


    /* =================================================
       CHAT BACK
    ================================================= */

    const chatBack =
      document.getElementById(
        "chatBack"
      );


    if (chatBack) {

      chatBack.addEventListener(
        "click",
        () => {

          stopSpeaking();


          showScreen(
            "homeScreen"
          );

        }
      );

    }


    /* =================================================
       CHAT SEND
    ================================================= */

    const chatSend =
      document.getElementById(
        "chatSend"
      );


    const chatInput =
      document.getElementById(
        "chatInput"
      );


    if (chatSend) {

      chatSend.addEventListener(
        "click",
        () =>
          sendMessage()
      );

    }


    if (chatInput) {

      chatInput.addEventListener(
        "input",
        () =>
          autoResize(
            chatInput
          )
      );


      chatInput.addEventListener(
        "keydown",
        event => {

          if (
            event.key ===
              "Enter" &&
            !event.shiftKey
          ) {

            event.preventDefault();


            sendMessage();

          }

        }
      );

    }


    /* =================================================
       HOME SEND
    ================================================= */

    const homeSend =
      document.getElementById(
        "homeSend"
      );


    const homeInput =
      document.getElementById(
        "homeInput"
      );


    if (homeSend) {

      homeSend.addEventListener(
        "click",
        () => {

          const text =
            homeInput
              ? homeInput.value.trim()
              : "";


          if (text) {

            sendMessage(
              text
            );

          }

        }
      );

    }


    if (homeInput) {

      homeInput.addEventListener(
        "input",
        () =>
          autoResize(
            homeInput
          )
      );


      homeInput.addEventListener(
        "keydown",
        event => {

          if (
            event.key ===
              "Enter" &&
            !event.shiftKey
          ) {

            event.preventDefault();


            const text =
              homeInput.value.trim();


            if (text) {

              sendMessage(
                text
              );

            }

          }

        }
      );

    }


    /* =================================================
       QUICK TOOLS + TEMPLATES
    ================================================= */

    document
      .querySelectorAll(
        "[data-template]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              useTemplate(
                button.dataset.template
              );

            }
          );

        }
      );


    /* =================================================
       INITIAL CHAT
    ================================================= */

    renderCurrentChat();


    console.log(
      "Emogigs AI: Step 18D ready."
    );

  }
);