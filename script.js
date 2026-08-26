/* =========================================================
   EMOGIGS AI
   FINAL PRODUCTION FRONTEND
   Chat + History + Voice + Speech Recognition
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

let isSending = false;

let conversations = [];

let currentConversationId = null;

let toastTimer = null;


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY =
  "emogigs_conversations_v3";

const VOICE_STORAGE_KEY =
  "emogigs_voice_settings_v3";


/* =========================================================
   VOICE STATE
========================================================= */

let voiceSettings = {

  gender: "natural",

  language: "auto",

  rate: 1,

  autoSpeak: true,

  conversation: false

};


let availableVoices = [];

let currentSpeech = null;

let currentSpeechButton = null;

let speechChunks = [];

let speechChunkIndex = 0;

let speechSessionId = 0;

let speechRecognition = null;

let isVoiceListening = false;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


function initializeApp() {

  console.log(
    "Emogigs AI: Final frontend loading..."
  );


  loadConversations();

  loadVoiceSettings();


  if (
    conversations.length === 0
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


  loadAvailableVoices();

  initializeVoiceSettings();

  initializeSpeechRecognition();

  initializeNavigation();

  initializeHome();

  initializeChat();

  initializeVoiceControls();

  renderRecentChats();

  renderCurrentChat();

  checkVoiceSupport();


  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis
      .addEventListener(
        "voiceschanged",
        loadAvailableVoices
      );

  }


  console.log(
    "Emogigs AI: Final frontend ready."
  );

}


/* =========================================================
   ID
========================================================= */

function createId() {

  return (
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 10)
  );

}


/* =========================================================
   CONVERSATIONS
========================================================= */

function loadConversations() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {

      conversations = [];

      return;

    }


    const parsed =
      JSON.parse(saved);


    conversations =
      Array.isArray(parsed)
        ? parsed
        : [];


    conversations =
      conversations.filter(
        conversation =>
          conversation &&
          typeof conversation.id ===
            "string" &&
          Array.isArray(
            conversation.messages
          )
      );

  } catch (error) {

    console.error(
      "Emogigs AI: Conversation load error:",
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
      "Emogigs AI: Conversation save error:",
      error
    );

  }

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

    title:
      "New conversation",

    createdAt:
      Date.now(),

    updatedAt:
      Date.now(),

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
   MESSAGE STORAGE
========================================================= */

function addConversationMessage(
  role,
  content
) {

  const conversation =
    ensureConversation();


  const message = {

    role,

    content:
      String(content),

    timestamp:
      Date.now()

  };


  conversation.messages.push(
    message
  );


  conversation.updatedAt =
    Date.now();


  if (
    role === "user" &&
    conversation.title ===
      "New conversation"
  ) {

    const clean =
      String(content)
        .replace(/\s+/g, " ")
        .trim();


    conversation.title =
      clean.length > 48
        ? clean.substring(0, 48) + "..."
        : clean;

  }


  saveConversations();

}


/* =========================================================
   NAVIGATION
========================================================= */

function showScreen(
  screenId
) {

  document
    .querySelectorAll(
      ".screen"
    )
    .forEach(
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


  document
    .querySelectorAll(
      ".nav-btn"
    )
    .forEach(
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


function initializeNavigation() {

  document
    .querySelectorAll(
      ".nav-btn"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            showScreen(
              button.dataset.screen
            );

          }
        );

      }
    );

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


  container.innerHTML =
    "";


  const conversation =
    getCurrentConversation();


  if (
    !conversation ||
    !Array.isArray(
      conversation.messages
    ) ||
    conversation.messages.length ===
      0
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
   WELCOME
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
    "I can help you learn, plan, " +
    "work, create and grow.\n\n" +
    "Tell me what you want to achieve " +
    "and we'll take it step by step.";


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


  } else {

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


  button.type =
    "button";


  button.className =
    "message-action";


  button.textContent =
    icon;


  button.title =
    label;


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


  let text;


  if (customText !== null) {

    text =
      String(
        customText
      ).trim();

  } else if (chatInput) {

    text =
      chatInput.value.trim();

  } else {

    text = "";

  }


  if (!text) {

    return;

  }


  isSending =
    true;


  ensureConversation();


  showScreen(
    "chatScreen"
  );


  addConversationMessage(
    "user",
    text
  );


  if (chatInput) {

    chatInput.value =
      "";


    autoResize(
      chatInput
    );

  }


  if (homeInput) {

    homeInput.value =
      "";


    autoResize(
      homeInput
    );

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
      "Emogigs AI: Request starting..."
    );


    const response =
      await fetch(
        "/api/chat",
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              message:
                text

            })

        }
      );


    let data = null;


    try {

      data =
        await response.json();

    } catch (error) {

      throw new Error(
        "The server returned an invalid response."
      );

    }


    if (!response.ok) {

      throw new Error(
        data?.error ||
        `Server error: ${response.status}`
      );

    }


    const reply =
      extractReply(
        data
      );


    if (
      thinkingElement
    ) {

      thinkingElement.remove();

    }


    addConversationMessage(
      "assistant",
      reply
    );


    renderCurrentChat();


    autoSpeakResponse(
      reply
    );


    scrollChatToBottom();


    console.log(
      "Emogigs AI: Response received."
    );


  } catch (error) {

    console.error(
      "Emogigs AI ERROR:",
      error
    );


    if (
      thinkingElement
    ) {

      thinkingElement.remove();

    }


    const message =
      createFriendlyErrorMessage(
        error
      );


    addConversationMessage(
      "assistant",
      message
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
   RESPONSE PARSER
========================================================= */

function extractReply(
  data
) {

  if (!data) {

    return "I couldn't generate a response.";

  }


  if (
    typeof data.reply ===
    "string" &&
    data.reply.trim()
  ) {

    return data.reply.trim();

  }


  if (
    typeof data.message ===
    "string" &&
    data.message.trim()
  ) {

    return data.message.trim();

  }


  if (
    typeof data.content ===
    "string" &&
    data.content.trim()
  ) {

    return data.content.trim();

  }


  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    typeof data.choices[0].message.content ===
      "string"
  ) {

    return data.choices[0]
      .message
      .content
      .trim();

  }


  return (
    "I received the server response, " +
    "but couldn't find the AI message."
  );

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function createFriendlyErrorMessage(
  error
) {

  const message =
    String(
      error?.message ||
      ""
    );


  if (
    message.toLowerCase()
      .includes("failed to fetch")
  ) {

    return (
      "I'm sorry, I couldn't connect " +
      "to the Emogigs AI server right now.\n\n" +
      "Please check your internet connection " +
      "and try again."
    );

  }


  return (
    "I'm sorry, something went wrong " +
    "while connecting to Emogigs AI.\n\n" +
    "Please try again in a moment."
  );

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


  requestAnimationFrame(
    () => {

      container.scrollTop =
        container.scrollHeight;

    }
  );

}


/* =========================================================
   HOME
========================================================= */

function initializeHome() {

  const send =
    document.getElementById(
      "homeSend"
    );


  const input =
    document.getElementById(
      "homeInput"
    );


  if (send) {

    send.addEventListener(
      "click",
      () => {

        sendMessage(
          input
            ? input.value
            : ""
        );

      }
    );

  }


  if (input) {

    input.addEventListener(
      "input",
      () =>
        autoResize(
          input
        )
    );


    input.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
            "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();


          sendMessage(
            input.value
          );

        }

      }
    );

  }


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

}


/* =========================================================
   CHAT
========================================================= */

function initializeChat() {

  const newChat =
    document.getElementById(
      "headerNewChat"
    );


  if (newChat) {

    newChat.addEventListener(
      "click",
      startNewChat
    );

  }


  const back =
    document.getElementById(
      "chatBack"
    );


  if (back) {

    back.addEventListener(
      "click",
      () => {

        stopSpeaking();

        showScreen(
          "homeScreen"
        );

      }
    );

  }


  const send =
    document.getElementById(
      "chatSend"
    );


  const input =
    document.getElementById(
      "chatInput"
    );


  if (send) {

    send.addEventListener(
      "click",
      () =>
        sendMessage()
    );

  }


  if (input) {

    input.addEventListener(
      "input",
      () =>
        autoResize(
          input
        )
    );


    input.addEventListener(
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


      if (!input) {

        return;

      }


      input.value =
        text;


      autoResize(
        input
      );


      input.focus();

    },
    120
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


  const sorted =
    conversations
      .slice()
      .sort(
        (a, b) =>
          b.updatedAt -
          a.updatedAt
      );


  if (
    sorted.length ===
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


  sorted.forEach(
    conversation => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "history-item";


      item.addEventListener(
        "click",
        () =>
          openChat(
            conversation.id
          )
      );


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
        conversation.title ||
        "New conversation";


      const preview =
        document.createElement(
          "div"
        );


      preview.className =
        "history-preview";


      const messages =
        Array.isArray(
          conversation.messages
        )
          ? conversation.messages
          : [];


      const last =
        messages[
          messages.length - 1
        ];


      preview.textContent =
        last
          ? last.content
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


      deleteButton.type =
        "button";


      deleteButton.className =
        "history-delete";


      deleteButton.textContent =
        "🗑";


      deleteButton.title =
        "Delete conversation";


      deleteButton.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          deleteConversation(
            conversation.id
          );

        }
      );


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
        5
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


      button.type =
        "button";


      button.className =
        "recent-item";


      button.addEventListener(
        "click",
        () =>
          openChat(
            conversation.id
          )
      );


      const icon =
        document.createElement(
          "div"
        );


      icon.className =
        "recent-icon";


      icon.textContent =
        "▣";


      const title =
        document.createElement(
          "div"
        );


      title.className =
        "recent-title";


      title.textContent =
        conversation.title ||
        "New conversation";


      const time =
        document.createElement(
          "div"
        );


      time.className =
        "recent-time";


      time.textContent =
        formatTime(
          conversation.updatedAt
        );


      button.appendChild(
        icon
      );


      button.appendChild(
        title
      );


      button.appendChild(
        time
      );


      list.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   DELETE
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


      textarea.focus();

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
      2400
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
    Math.max(
      0,
      now.getTime() -
      date.getTime()
    );


  const minutes =
    Math.floor(
      difference /
      60000
    );


  if (
    minutes < 1
  ) {

    return "now";

  }


  if (
    minutes < 60
  ) {

    return `${minutes}m`;

  }


  const hours =
    Math.floor(
      minutes /
      60
    );


  if (
    hours < 24
  ) {

    return `${hours}h`;

  }


  const days =
    Math.floor(
      hours /
      24
    );


  if (
    days < 7
  ) {

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
   VOICE SETTINGS
========================================================= */

function loadVoiceSettings() {

  try {

    const saved =
      localStorage.getItem(
        VOICE_STORAGE_KEY
      );


    if (!saved) {

      return;

    }


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

  } catch (error) {

    console.error(
      "Voice settings load error:",
      error
    );

  }

}


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
      "Voice settings save error:",
      error
    );

  }

}


/* =========================================================
   VOICE UI
========================================================= */

function initializeVoiceSettings() {

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

    language.value =
      voiceSettings.language;


    language.addEventListener(
      "change",
      () => {

        voiceSettings.language =
          language.value;


        saveVoiceSettings();

        stopSpeaking();

        initializeSpeechRecognition();

      }
    );

  }


  if (rate) {

    rate.value =
      voiceSettings.rate;


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

    autoSpeak.value =
      voiceSettings.autoSpeak
        ? "on"
        : "off";


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

    conversation.value =
      voiceSettings.conversation
        ? "on"
        : "off";


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


  updateVoiceRateDisplay();

}


function updateVoiceRateDisplay() {

  const rate =
    document.getElementById(
      "voiceRate"
    );


  const display =
    document.getElementById(
      "voiceRateValue"
    );


  if (
    rate &&
    display
  ) {

    display.textContent =
      Number(
        rate.value
      ).toFixed(2) +
      "×";

  }

}


/* =========================================================
   VOICE SETTINGS BUTTON
========================================================= */

function initializeVoiceControls() {

  const settingsButton =
    document.getElementById(
      "voiceSettingsButton"
    );


  if (settingsButton) {

    settingsButton.addEventListener(
      "click",
      toggleVoiceSettingsPanel
    );

  }


  const micButton =
    document.getElementById(
      "voiceMicButton"
    );


  if (micButton) {

    micButton.addEventListener(
      "click",
      startVoiceInput
    );

  }

}


function toggleVoiceSettingsPanel() {

  const panel =
    document.getElementById(
      "voiceSettingsPanel"
    );


  if (!panel) {

    return;

  }


  panel.classList.toggle(
    "show"
  );

}


/* =========================================================
   LOAD VOICES
========================================================= */

function loadAvailableVoices() {

  if (
    !(
      "speechSynthesis" in
      window
    )
  ) {

    availableVoices = [];

    return;

  }


  availableVoices =
    window.speechSynthesis
      .getVoices();

}


/* =========================================================
   LANGUAGE
========================================================= */

function detectTextLanguage(
  text
) {

  const value =
    String(text || "");


  const bengali =
    value.match(
      /[\u0980-\u09FF]/g
    );


  const english =
    value.match(
      /[A-Za-z]/g
    );


  const bengaliCount =
    bengali
      ? bengali.length
      : 0;


  const englishCount =
    english
      ? english.length
      : 0;


  return (
    bengaliCount >
    englishCount
  )
    ? "bn"
    : "en";

}


function getSpeechLanguage(
  text
) {

  if (
    voiceSettings.language !==
    "auto"
  ) {

    return voiceSettings.language;

  }


  return detectTextLanguage(
    text
  ) === "bn"
    ? "bn-BD"
    : "en-US";

}


/* =========================================================
   BEST VOICE
========================================================= */

function findBestVoice(
  text
) {

  if (
    !availableVoices.length
  ) {

    loadAvailableVoices();

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


  const prefix =
    language
      .toLowerCase()
      .split("-")[0];


  let voices =
    availableVoices.filter(
      voice =>
        voice.lang
          .toLowerCase()
          .startsWith(
            prefix
          )
    );


  if (
    voices.length ===
    0
  ) {

    voices =
      availableVoices.slice();

  }


  if (
    voiceSettings.gender ===
    "female"
  ) {

    const female =
      voices.find(
        voice =>
          /female|woman|zira|samantha|susan|karen|victoria/i
            .test(
              voice.name
            )
      );


    if (female) {

      return female;

    }

  }


  if (
    voiceSettings.gender ===
    "male"
  ) {

    const male =
      voices.find(
        voice =>
          /male|man|david|daniel|alex|george|mark/i
            .test(
              voice.name
            )
      );


    if (male) {

      return male;

    }

  }


  const preferred =
    voices.find(
      voice =>
        voice.default
    );


  return (
    preferred ||
    voices[0] ||
    availableVoices[0] ||
    null
  );

}


/* =========================================================
   SPLIT SPEECH
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


  const sentences =
    clean.split(
      /(?<=[.!?।！？])\s+/u
    );


  const chunks = [];

  let current = "";


  for (
    const sentenceRaw of
    sentences
  ) {

    const sentence =
      sentenceRaw.trim();


    if (!sentence) {

      continue;

    }


    if (
      current.length +
      sentence.length +
      1 <=
      maxLength
    ) {

      current =
        current
          ? current +
            " " +
            sentence
          : sentence;

      continue;

    }


    if (current) {

      chunks.push(
        current
      );

    }


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

  speechSessionId++;


  if (
    "speechSynthesis" in
    window
  ) {

    window.speechSynthesis.cancel();

  }


  currentSpeech =
    null;


  currentSpeechButton =
    null;


  speechChunks =
    [];


  speechChunkIndex =
    0;


  resetVoiceButtons();

}


/* =========================================================
   SPEAK NEXT CHUNK
========================================================= */

function speakNextChunk(
  sessionId
) {

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


  if (voice) {

    utterance.voice =
      voice;

    utterance.lang =
      voice.lang;

  } else {

    utterance.lang =
      getSpeechLanguage(
        text
      );

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


      setTimeout(
        () =>
          speakNextChunk(
            sessionId
          ),
        50
      );

    };


  utterance.onerror =
    event => {

      if (
        sessionId !==
        speechSessionId
      ) {

        return;

      }


      console.error(
        "Speech error:",
        event
      );


      currentSpeech =
        null;


      resetVoiceButtons();


      if (
        event &&
        (
          event.error ===
            "canceled" ||
          event.error ===
            "interrupted"
        )
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
      "Voice playback is not supported."
    );


    return;

  }


  stopSpeaking();


  currentSpeechButton =
    button;


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


  loadAvailableVoices();


  const sessionId =
    speechSessionId;


  const start =
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


  if (
    availableVoices.length
  ) {

    start();

    return;

  }


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


      start();

    };


  window.speechSynthesis
    .addEventListener(
      "voiceschanged",
      startOnce
    );


  setTimeout(
    startOnce,
    700
  );

}


/* =========================================================
   TOGGLE SPEECH
========================================================= */

function toggleSpeech(
  text,
  button
) {

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


  speakText(
    text,
    button
  );

}


/* =========================================================
   CREATE VOICE BUTTON
========================================================= */

function createVoiceButton(
  text
) {

  const button =
    createActionButton(
      "🔊",
      "Listen"
    );


  button.classList.add(
    "voice-action-button"
  );


  button.addEventListener(
    "click",
    () => {

      toggleSpeech(
        text,
        button
      );

    }
  );


  return button;

}


/* =========================================================
   AUTO SPEAK
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

      if (!isSending) {

        speakText(
          text
        );

      }

    },
    300
  );

}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function initializeSpeechRecognition() {

  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!Recognition) {

    speechRecognition =
      null;


    return;

  }


  if (
    speechRecognition
  ) {

    try {

      speechRecognition.abort();

    } catch (error) {

      console.log(
        "Previous recognition closed."
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


  speechRecognition.lang =
    voiceSettings.language !==
      "auto"
      ? voiceSettings.language
      : "en-US";


  speechRecognition.onstart =
    () => {

      isVoiceListening =
        true;


      updateVoiceListeningUI(
        true
      );


      showToast(
        "🎙️ Listening..."
      );

    };


  speechRecognition.onresult =
    event => {

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


      if (!transcript) {

        showToast(
          "I couldn't hear anything."
        );


        return;

      }


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


      sendMessage(
        transcript
      );

    };


  speechRecognition.onerror =
    event => {

      console.error(
        "Voice recognition error:",
        event.error
      );


      isVoiceListening =
        false;


      updateVoiceListeningUI(
        false
      );


      switch (
        event.error
      ) {

        case "not-allowed":

          showToast(
            "🎙️ Microphone permission was denied."
          );

          break;


        case "audio-capture":

          showToast(
            "🎙️ Microphone could not be accessed."
          );

          break;


        case "no-speech":

          showToast(
            "🎙️ I didn't hear anything."
          );

          break;


        case "network":

          showToast(
            "Voice recognition network error."
          );

          break;


        case "aborted":

          break;


        default:

          showToast(
            "Voice Assistant could not start."
          );

      }

    };


  speechRecognition.onend =
    () => {

      isVoiceListening =
        false;


      updateVoiceListeningUI(
        false
      );

    };

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


    return;

  }


  if (!speechRecognition) {

    initializeSpeechRecognition();

  }


  if (!speechRecognition) {

    return;

  }


  if (
    isVoiceListening
  ) {

    try {

      speechRecognition.stop();

    } catch (error) {

      console.error(
        error
      );

    }


    return;

  }


  stopSpeaking();


  speechRecognition.lang =
    voiceSettings.language !==
      "auto"
      ? voiceSettings.language
      : "en-US";


  try {

    speechRecognition.start();

  } catch (error) {

    console.error(
      "Recognition start error:",
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
      "Please allow microphone access."
    );

  }

}


/* =========================================================
   VOICE UI
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


  const status =
    document.getElementById(
      "voiceStatus"
    );


  if (status) {

    status.textContent =
      listening
        ? "🎙️ Listening..."
        : "Voice ready";


    status.classList.toggle(
      "active",
      listening
    );

  }

}


/* =========================================================
   VOICE SUPPORT
========================================================= */

function checkVoiceSupport() {

  const synthesis =
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
        synthesis,

      speechRecognition:
        recognition
    }
  );

}