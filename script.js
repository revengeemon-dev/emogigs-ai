/* =========================================================
   EMOGIGS AI
   STEP 17 — PROFESSIONAL APP ENGINE
========================================================= */

let isSending = false;

const STORAGE_KEY = "emogigs_conversations_v2";

let conversations = [];
let currentConversationId = null;


/* =========================================================
   STORAGE
========================================================= */

function loadConversations() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {
      conversations = JSON.parse(saved);
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
      JSON.stringify(conversations)
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
    Math.random().toString(36).slice(2)
  );
}


/* =========================================================
   CURRENT CONVERSATION
========================================================= */

function getCurrentConversation() {

  return conversations.find(
    conversation =>
      conversation.id === currentConversationId
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

  conversations.unshift(conversation);

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

    role,

    content,

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

function showScreen(screenId) {

  const screens =
    document.querySelectorAll(".screen");

  screens.forEach(screen => {

    screen.classList.remove("active");

  });


  const target =
    document.getElementById(screenId);

  if (target) {
    target.classList.add("active");
  }


  const navButtons =
    document.querySelectorAll(".nav-btn");

  navButtons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.screen === screenId
    );

  });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (screenId === "historyScreen") {
    renderHistory();
  }


  if (screenId === "homeScreen") {
    renderRecentChats();
  }
}


/* =========================================================
   OPEN CHAT
========================================================= */

function openChat(conversationId) {

  const conversation =
    conversations.find(
      item =>
        item.id === conversationId
    );

  if (!conversation) {
    return;
  }

  currentConversationId =
    conversationId;

  showScreen("chatScreen");

  renderCurrentChat();
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

  createConversation();

  renderCurrentChat();

  showScreen("chatScreen");

  setTimeout(() => {

    const input =
      document.getElementById("chatInput");

    if (input) {
      input.focus();
    }

  }, 100);
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
    document.createElement("div");

  wrapper.className =
    "chat-message ai";


  const avatar =
    document.createElement("div");

  avatar.className =
    "message-ai-avatar";

  avatar.textContent = "✦";


  const messageWrap =
    document.createElement("div");

  messageWrap.className =
    "ai-message-wrap";


  const bubble =
    document.createElement("div");

  bubble.className =
    "ai-bubble";

  bubble.textContent =
    "Hello! I'm Emogigs AI. ✨\n\n" +
    "I can help you learn, plan, work, " +
    "create and grow. Tell me what you " +
    "want to achieve, and we'll take it " +
    "step by step.";


  messageWrap.appendChild(bubble);

  wrapper.appendChild(avatar);

  wrapper.appendChild(messageWrap);

  container.appendChild(wrapper);
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
    document.createElement("div");


  if (role === "user") {

    wrapper.className =
      "chat-message user";


    const bubble =
      document.createElement("div");

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
      document.createElement("div");

    avatar.className =
      "message-ai-avatar";

    avatar.textContent = "✦";


    const messageWrap =
      document.createElement("div");

    messageWrap.className =
      "ai-message-wrap";


    const bubble =
      document.createElement("div");

    bubble.className =
      "ai-bubble";

    bubble.textContent =
      content;


    const actions =
      document.createElement("div");

    actions.className =
      "message-actions";


    const copyButton =
      createActionButton(
        "⧉",
        "Copy"
      );

    copyButton.onclick =
      () => copyText(content);


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


    const shareButton =
      createActionButton(
        "↗",
        "Share"
      );
const voiceButton =
  createVoiceButton(
    content
  );

    shareButton.onclick =
      () => shareText(content);


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
    document.createElement("div");

  wrapper.className =
    "chat-message ai";


  const avatar =
    document.createElement("div");

  avatar.className =
    "message-ai-avatar";

  avatar.textContent =
    "✦";


  const messageWrap =
    document.createElement("div");

  messageWrap.className =
    "ai-message-wrap";


  const bubble =
    document.createElement("div");

  bubble.className =
    "ai-bubble";


  const thinking =
    document.createElement("div");

  thinking.className =
    "thinking";


  for (let i = 0; i < 3; i++) {

    const dot =
      document.createElement(
        "span"
      );

    thinking.appendChild(dot);
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
      ? customText
      : chatInput
        ? chatInput.value.trim()
        : "";


  if (!text) {
    return;
  }


  isSending = true;


  /*
    Make sure we have a conversation
  */

  ensureConversation();


  /*
    Switch to chat screen
  */

  showScreen(
    "chatScreen"
  );


  /*
    Add user message
  */

  addConversationMessage(
    "user",
    text
  );


  /*
    Clear inputs
  */

  if (chatInput) {
    chatInput.value = "";
  }

  if (homeInput) {
    homeInput.value = "";
  }


  renderCurrentChat();


  /*
    Show AI thinking
  */

  const thinkingElement =
    showThinking();


  const sendButton =
    document.getElementById(
      "chatSend"
    );

  if (sendButton) {
    sendButton.disabled = true;
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


    const data =
      await res.json();


    if (!res.ok) {

      throw new Error(
        data.error ||
        "Server returned an error."
      );
    }


    const reply =
      data.reply ||
      "I couldn't generate a response.";


    /*
      Remove thinking
    */

    if (thinkingElement) {
      thinkingElement.remove();
    }


    /*
      Save AI response
    */

    addConversationMessage(
      "assistant",
      reply
    );


    /*
      Render actual response
    */

    renderCurrentChat();


    /*
      Keep chat at bottom
    */

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
  reply
);


/*
  Render actual response
*/

renderCurrentChat();


/*
  Automatically speak AI response
*/

autoSpeakResponse(
  reply
);


  } finally {

    isSending = false;


    if (sendButton) {
      sendButton.disabled = false;
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


  list.innerHTML = "";


  if (
    conversations.length === 0
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
      (a,b) =>
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


        info.appendChild(title);

        info.appendChild(preview);


        const deleteButton =
          document.createElement(
            "button"
          );

        deleteButton.className =
          "history-delete";

        deleteButton.textContent =
          "🗑";


        deleteButton.onclick =
          event => {

            event.stopPropagation();

            deleteConversation(
              conversation.id
            );
          };


        item.appendChild(icon);

        item.appendChild(info);

        item.appendChild(
          deleteButton
        );


        list.appendChild(item);
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


  list.innerHTML = "";


  const recent =
    conversations
      .slice()
      .sort(
        (a,b) =>
          b.updatedAt -
          a.updatedAt
      )
      .slice(0,4);


  if (recent.length === 0) {

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


      button.onclick =
        () => openChat(
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

    createConversation();
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

function useTemplate(text) {

  startNewChat();

  setTimeout(() => {

    const input =
      document.getElementById(
        "chatInput"
      );

    if (input) {

      input.value =
        text;

      input.focus();
    }

  }, 100);
}


/* =========================================================
   COPY
========================================================= */

async function copyText(text) {

  try {

    await navigator.clipboard.writeText(
      text
    );

    showToast(
      "Response copied."
    );

  } catch (error) {

    showToast(
      "Copy is not available."
    );
  }
}


/* =========================================================
   SHARE
========================================================= */

async function shareText(text) {

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

      await copyText(text);

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

function showToast(message) {

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
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2200);
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

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

function formatTime(timestamp) {

  const date =
    new Date(timestamp);

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
      minutes / 60
    );


  if (hours < 24) {
    return `${hours}h`;
  }


  const days =
    Math.floor(
      hours / 24
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

  textarea.style.height =
    "auto";

  textarea.style.height =
    Math.min(
      textarea.scrollHeight,
      130
    ) + "px";
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
/* =========================================================
   EMOGIGS AI — STEP 18C
   VOICE ENGINE
========================================================= */

const VOICE_STORAGE_KEY =
  "emogigs_voice_settings_v1";


let voiceSettings = {

  gender: "natural",

  language: "auto",

  rate: 1,

  autoSpeak: true,

  conversation: false

};


let availableVoices = [];

let currentSpeech = null;

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
        JSON.parse(saved);

      voiceSettings = {
        ...voiceSettings,
        ...parsed
      };

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
    !("speechSynthesis" in window)
  ) {

    console.warn(
      "Speech synthesis is not supported."
    );

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
   VOICE LANGUAGE MATCH
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
   FIND BEST VOICE
========================================================= */

function findBestVoice() {

  if (
    !availableVoices.length
  ) {

    return null;

  }


  const language =
    getLanguageCode();


  let voices =
    availableVoices.slice();


  /*
    Language filter
  */

  if (language) {

    const languagePrefix =
      language
        .toLowerCase()
        .split("-")[0];


    const languageVoices =
      voices.filter(
        voice =>
          voice.lang
            .toLowerCase()
            .startsWith(
              languagePrefix
            )
      );


    if (
      languageVoices.length
    ) {

      voices =
        languageVoices;

    }

  }


  /*
    Gender preference
    Browser voice names are not
    guaranteed to contain gender.
    Therefore this is a best-effort
    selection.
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
            name.includes("female") ||
            name.includes("woman") ||
            name.includes("zira") ||
            name.includes("samantha") ||
            name.includes("susan") ||
            name.includes("karen") ||
            name.includes("victoria") ||
            name.includes("google uk english female")
          );

        }
      );


    if (femaleVoice) {

      return femaleVoice;

    }

  }


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
            name.includes("male") ||
            name.includes("man") ||
            name.includes("david") ||
            name.includes("daniel") ||
            name.includes("alex") ||
            name.includes("george") ||
            name.includes("mark") ||
            name.includes("google uk english male")
          );

        }
      );


    if (maleVoice) {

      return maleVoice;

    }

  }


  /*
    Natural / default voice
  */

  return (
    voices.find(
      voice =>
        voice.default
    ) ||
    voices[0] ||
    null
  );

}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis.cancel();

  }


  currentSpeech =
    null;


  document
    .querySelectorAll(
      ".voice-action-button.speaking"
    )
    .forEach(button => {

      button.classList.remove(
        "speaking"
      );

    });

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
    !text.trim()
  ) {

    return;

  }


  if (
    !("speechSynthesis" in window)
  ) {

    showToast(
      "Voice playback is not supported on this browser."
    );

    return;

  }


  /*
    Stop previous speech
  */

  stopSpeaking();


  const utterance =
    new SpeechSynthesisUtterance(
      text
    );


  const voice =
    findBestVoice();


  if (voice) {

    utterance.voice =
      voice;

    utterance.lang =
      voice.lang;

  } else {

    const language =
      getLanguageCode();

    if (language) {

      utterance.lang =
        language;

    }

  }


  utterance.rate =
    Number(
      voiceSettings.rate
    );


  utterance.pitch =
    1;


  utterance.volume =
    1;


  currentSpeech =
    utterance;


  if (button) {

    button.classList.add(
      "speaking"
    );

  }


  utterance.onstart =
    () => {

      if (button) {

        button.classList.add(
          "speaking"
        );

      }

    };


  utterance.onend =
    () => {

      currentSpeech =
        null;

      if (button) {

        button.classList.remove(
          "speaking"
        );

      }

    };


  utterance.onerror =
    error => {

      console.error(
        "Emogigs AI voice error:",
        error
      );

      currentSpeech =
        null;

      if (button) {

        button.classList.remove(
          "speaking"
        );

      }

    };


  window.speechSynthesis.speak(
    utterance
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
    currentSpeech
  ) {

    stopSpeaking();

    return;

  }


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
      ).toFixed(2) + "×";

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
          autoSpeak.value === "on";

        saveVoiceSettings();

      }
    );

  }


  if (conversation) {

    conversation.addEventListener(
      "change",
      () => {

        voiceSettings.conversation =
          conversation.value === "on";

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
========================================================= */

function initializeSpeechRecognition() {

  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!Recognition) {

    console.warn(
      "Speech recognition is not supported."
    );

    return;

  }


  speechRecognition =
    new Recognition();


  speechRecognition.continuous =
    false;

  speechRecognition.interimResults =
    false;

  speechRecognition.lang =
    voiceSettings.language ===
    "auto"
      ? "en-US"
      : voiceSettings.language;


  speechRecognition.onstart =
    () => {

      isVoiceListening =
        true;

      updateVoiceListeningUI(
        true
      );

    };


  speechRecognition.onresult =
    event => {

      const transcript =
        event.results[
          event.results.length - 1
        ][0].transcript;


      console.log(
        "Voice input:",
        transcript
      );


      const input =
        document.getElementById(
          "chatInput"
        );


      if (input) {

        input.value =
          transcript;

        autoResize(input);

      }


      /*
        Automatically send the
        recognized voice message.
      */

      sendMessage(
        transcript
      );

    };


  speechRecognition.onerror =
    error => {

      console.error(
        "Voice recognition error:",
        error
      );

      isVoiceListening =
        false;

      updateVoiceListeningUI(
        false
      );

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

  if (!speechRecognition) {

    initializeSpeechRecognition();

  }


  if (!speechRecognition) {

    showToast(
      "Microphone voice input is not supported on this browser."
    );

    return;

  }


  if (isVoiceListening) {

    speechRecognition.stop();

    return;

  }


  stopSpeaking();


  speechRecognition.lang =
    voiceSettings.language ===
    "auto"
      ? "en-US"
      : voiceSettings.language;


  try {

    speechRecognition.start();

  } catch (error) {

    console.error(
      "Could not start voice recognition:",
      error
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
    .forEach(button => {

      button.classList.toggle(
        "listening",
        listening
      );

    });


  document
    .querySelectorAll(
      ".voice-status"
    )
    .forEach(status => {

      status.classList.toggle(
        "active",
        listening
      );


      status.textContent =
        listening
          ? "🎙️ Listening..."
          : "Voice ready";

    });

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


  /*
    Small delay makes the UI feel
    more natural after the response
    appears.
  */

  setTimeout(
    () => {

      speakText(text);

    },
    250
  );

}


/* =========================================================
   VOICE SUPPORT CHECK
========================================================= */

function checkVoiceSupport() {

  const speech =
    "speechSynthesis" in window;

  const recognition =
    !!(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    );


  console.log(
    "Emogigs AI Voice Support:",
    {
      speechSynthesis: speech,
      speechRecognition: recognition
    }
  );

}
  "DOMContentLoaded",
  () => {

    console.log(
      "Emogigs AI Step 17 frontend loaded."
    );


    loadConversations();


    /*
      Start with a conversation
      if none exists.
    */

    if (
      conversations.length === 0
    ) {

      createConversation();
    }


    currentConversationId =
      conversations[0].id;


    renderRecentChats();


    /* =================================================
       NAVIGATION
    ================================================= */

    document
      .querySelectorAll(
        ".nav-btn"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const screen =
              button.dataset.screen;

            showScreen(screen);

          }
        );

      });


    document
      .querySelectorAll(
        "[data-screen]"
      )
      .forEach(button => {

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

      });


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
        () => sendMessage()
      );
    }


    if (chatInput) {

      chatInput.addEventListener(
        "input",
        () => autoResize(
          chatInput
        )
      );


      chatInput.addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter" &&
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
            homeInput.value.trim();

          if (text) {
            sendMessage(text);
          }

        }
      );
    }


    if (homeInput) {

      homeInput.addEventListener(
        "input",
        () => autoResize(
          homeInput
        )
      );


      homeInput.addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {

            event.preventDefault();

            const text =
              homeInput.value.trim();

            if (text) {
              sendMessage(text);
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
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            useTemplate(
              button.dataset.template
            );

          }
        );

      });


    /*
      Render initial chat
    */

    renderCurrentChat();

  }
);