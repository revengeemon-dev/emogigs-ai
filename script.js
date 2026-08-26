/* =========================================================
   EMOGIGS AI
   STEP 18E — PROFESSIONAL UI
========================================================= */


/* =========================================================
   ROOT
========================================================= */

:root {

  --bg:
    #09090d;

  --bg-soft:
    #0d0d12;

  --surface:
    #111118;

  --surface-2:
    #15151d;

  --surface-3:
    #1a1a23;

  --border:
    rgba(255, 255, 255, 0.08);

  --border-strong:
    rgba(255, 255, 255, 0.13);

  --text:
    #f5f5f7;

  --text-soft:
    #c4c4cc;

  --text-muted:
    #858591;

  --accent:
    #a78bfa;

  --accent-strong:
    #8b5cf6;

  --accent-soft:
    rgba(139, 92, 246, 0.12);

  --success:
    #48d597;

  --danger:
    #ff6b6b;

  --shadow:
    0 12px 40px rgba(0, 0, 0, 0.35);

  --radius-sm:
    10px;

  --radius-md:
    16px;

  --radius-lg:
    22px;

  --nav-height:
    76px;

  --header-height:
    70px;

}


/* =========================================================
   RESET
========================================================= */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}


html {
  width: 100%;
  min-height: 100%;
  background: var(--bg);
  color-scheme: dark;
}


body {

  width: 100%;
  min-height: 100vh;

  background:
    radial-gradient(
      circle at 50% -20%,
      rgba(139, 92, 246, 0.10),
      transparent 35%
    ),
    var(--bg);

  color: var(--text);

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;

  -webkit-font-smoothing:
    antialiased;

  text-rendering:
    optimizeLegibility;

  overflow-x:
    hidden;
}


button,
textarea,
select,
input {
  font: inherit;
}


button {
  border: 0;
  outline: none;
  cursor: pointer;
}


textarea {
  outline: none;
}


button:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline:
    2px solid
    rgba(167, 139, 250, 0.55);

  outline-offset:
    2px;
}


/* =========================================================
   APP
========================================================= */

#app {

  width: 100%;
  min-height: 100vh;

  position: relative;

  background:
    linear-gradient(
      180deg,
      rgba(255,255,255,0.015),
      transparent 20%
    );
}


/* =========================================================
   SCREEN
========================================================= */

.screen {

  display: none;

  width: 100%;
  min-height: 100vh;

  padding-bottom:
    var(--nav-height);

}


.screen.active {
  display: block;
}


/* =========================================================
   HEADER
========================================================= */

.top-header,
.chat-header {

  height:
    var(--header-height);

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  padding:
    0 22px;

  border-bottom:
    1px solid var(--border);

  background:
    rgba(9, 9, 13, 0.86);

  backdrop-filter:
    blur(18px);

  -webkit-backdrop-filter:
    blur(18px);

  position:
    sticky;

  top:
    0;

  z-index:
    50;

}


.brand-area {

  display:
    flex;

  align-items:
    center;

  gap:
    11px;

}


.brand-mark,
.chat-brand-mark {

  width:
    39px;

  height:
    39px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    12px;

  background:
    linear-gradient(
      145deg,
      #a78bfa,
      #7c3aed
    );

  color:
    white;

  font-size:
    21px;

  box-shadow:
    0 8px 24px
    rgba(124, 58, 237, 0.22);

}


.brand-name {

  font-size:
    17px;

  font-weight:
    700;

  letter-spacing:
    -0.35px;

}


.brand-name span {
  color:
    var(--accent);
}


.brand-status,
.chat-brand-status {

  display:
    flex;

  align-items:
    center;

  gap:
    6px;

  margin-top:
    2px;

  color:
    var(--text-muted);

  font-size:
    11px;

}


.status-dot {

  width:
    6px;

  height:
    6px;

  border-radius:
    50%;

  background:
    var(--success);

  box-shadow:
    0 0 8px
    rgba(72, 213, 151, 0.45);

}


.header-action {

  width:
    42px;

  height:
    42px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border:
    1px solid
    rgba(167, 139, 250, 0.18);

  border-radius:
    13px;

  background:
    rgba(167, 139, 250, 0.06);

  color:
    var(--text);

  font-size:
    25px;

  font-weight:
    300;

  transition:
    0.2s ease;

}


.header-action:hover {
  background:
    var(--accent-soft);

  border-color:
    rgba(167, 139, 250, 0.30);
}


.header-action:active {
  transform:
    scale(0.95);
}


/* =========================================================
   HOME
========================================================= */

.home-content {

  width:
    min(100%, 860px);

  margin:
    0 auto;

  padding:
    58px 20px 42px;

}


.home-hero {

  text-align:
    center;

  max-width:
    650px;

  margin:
    0 auto 34px;

}


.hero-eyebrow,
.page-eyebrow,
.section-label {

  color:
    var(--accent);

  font-size:
    10px;

  font-weight:
    700;

  letter-spacing:
    1.8px;

}


.home-hero h1 {

  margin-top:
    12px;

  font-size:
    clamp(32px, 7vw, 54px);

  line-height:
    1.08;

  letter-spacing:
    -1.8px;

  font-weight:
    700;

}


.home-hero h1 span {
  color:
    var(--accent);
}


.home-hero p {

  margin-top:
    14px;

  color:
    var(--text-muted);

  font-size:
    15px;

  line-height:
    1.65;

}


/* =========================================================
   COMPOSER
========================================================= */

.home-composer,
.chat-composer {

  width:
    100%;

  display:
    flex;

  align-items:
    flex-end;

  gap:
    8px;

  padding:
    9px;

  border:
    1px solid var(--border-strong);

  border-radius:
    18px;

  background:
    rgba(18, 18, 25, 0.94);

  box-shadow:
    var(--shadow);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

}


.home-composer:focus-within,
.chat-composer:focus-within {

  border-color:
    rgba(167, 139, 250, 0.32);

  box-shadow:
    0 14px 50px
    rgba(0, 0, 0, 0.42);

}


.home-composer textarea,
.chat-composer textarea {

  flex:
    1;

  min-width:
    0;

  max-height:
    130px;

  resize:
    none;

  overflow-y:
    auto;

  border:
    0;

  background:
    transparent;

  color:
    var(--text);

  padding:
    10px 3px;

  font-size:
    15px;

  line-height:
    1.5;

}


.home-composer textarea::placeholder,
.chat-composer textarea::placeholder {
  color:
    #6f6f7a;
}


.composer-plus,
.composer-mic,
.composer-send {

  flex:
    0 0 auto;

  width:
    40px;

  height:
    40px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    12px;

  transition:
    0.18s ease;

}


.composer-plus {

  background:
    transparent;

  color:
    #b9b9c2;

  font-size:
    25px;

  font-weight:
    300;

}


.composer-plus:hover {

  background:
    rgba(255,255,255,0.06);

  color:
    white;

}


.composer-mic {

  background:
    transparent;

  color:
    #a9a9b4;

  font-size:
    19px;

}


.composer-mic:hover {

  background:
    rgba(255,255,255,0.06);

  color:
    white;

}


.composer-mic.listening {

  color:
    #ff7b7b;

  background:
    rgba(255, 107, 107, 0.10);

  animation:
    micPulse 1.2s infinite;
}


@keyframes micPulse {

  0% {
    box-shadow:
      0 0 0 0
      rgba(255, 107, 107, 0.20);
  }

  70% {
    box-shadow:
      0 0 0 9px
      rgba(255, 107, 107, 0);
  }

  100% {
    box-shadow:
      0 0 0 0
      rgba(255, 107, 107, 0);
  }

}


.composer-send {

  background:
    var(--text);

  color:
    #0a0a0d;

  font-size:
    23px;

  font-weight:
    700;

}


.composer-send:hover {
  transform:
    translateY(-1px);

}


.composer-send:active {
  transform:
    scale(0.94);
}


.composer-send:disabled {

  opacity:
    0.4;

  cursor:
    not-allowed;
}


/* =========================================================
   QUICK SECTION
========================================================= */

.quick-section {

  margin-top:
    42px;

}


.quick-grid {

  display:
    grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap:
    10px;

  margin-top:
    14px;

}


.quick-card {

  display:
    flex;

  align-items:
    center;

  gap:
    13px;

  min-height:
    72px;

  padding:
    13px;

  text-align:
    left;

  border:
    1px solid var(--border);

  border-radius:
    15px;

  background:
    rgba(255,255,255,0.025);

  color:
    var(--text);

  transition:
    0.2s ease;

}


.quick-card:hover {

  background:
    rgba(255,255,255,0.045);

  border-color:
    var(--border-strong);

  transform:
    translateY(-1px);

}


.quick-icon {

  width:
    38px;

  height:
    38px;

  flex:
    0 0 auto;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    11px;

  background:
    rgba(167, 139, 250, 0.08);

  color:
    var(--accent);

  font-size:
    16px;

  font-weight:
    600;

}


.quick-card span:last-child {

  min-width:
    0;

}


.quick-card strong {

  display:
    block;

  font-size:
    13px;

  font-weight:
    600;

}


.quick-card small {

  display:
    block;

  margin-top:
    4px;

  color:
    var(--text-muted);

  font-size:
    11px;

  line-height:
    1.3;

}


/* =========================================================
   RECENT
========================================================= */

.recent-section {

  margin-top:
    42px;

}


.section-heading {

  display:
    flex;

  align-items:
    flex-end;

  justify-content:
    space-between;

  gap:
    15px;

  margin-bottom:
    14px;

}


.section-heading h2 {

  margin-top:
    5px;

  font-size:
    18px;

  font-weight:
    600;

  letter-spacing:
    -0.3px;

}


.text-button {

  color:
    var(--accent);

  background:
    transparent;

  font-size:
    12px;

  white-space:
    nowrap;

}


.recent-list {

  display:
    flex;

  flex-direction:
    column;

  gap:
    7px;

}


.recent-item {

  width:
    100%;

  display:
    flex;

  align-items:
    center;

  gap:
    12px;

  min-height:
    58px;

  padding:
    10px 12px;

  border:
    1px solid var(--border);

  border-radius:
    13px;

  background:
    rgba(255,255,255,0.018);

  color:
    var(--text);

  text-align:
    left;

  transition:
    0.18s ease;

}


.recent-item:hover {

  background:
    rgba(255,255,255,0.04);

}


.recent-icon {

  width:
    34px;

  height:
    34px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    9px;

  background:
    rgba(167, 139, 250, 0.07);

  color:
    var(--accent);

}


.recent-title {

  flex:
    1;

  min-width:
    0;

  overflow:
    hidden;

  white-space:
    nowrap;

  text-overflow:
    ellipsis;

  font-size:
    13px;

}


.recent-time {

  color:
    var(--text-muted);

  font-size:
    10px;

}


/* =========================================================
   CHAT SCREEN
========================================================= */

.chat-screen {

  display:
    none;

  min-height:
    100vh;

  padding-bottom:
    155px;

}


.chat-screen.active {
  display:
    block;
}


.chat-header {

  position:
    sticky;

  top:
    0;

}


.icon-button {

  width:
    40px;

  height:
    40px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border:
    1px solid var(--border);

  border-radius:
    12px;

  background:
    rgba(255,255,255,0.025);

  color:
    var(--text);

  font-size:
    25px;

  transition:
    0.18s ease;

}


.icon-button:hover {

  background:
    rgba(255,255,255,0.06);

}


.chat-brand {

  display:
    flex;

  align-items:
    center;

  gap:
    9px;

}


.chat-brand-mark {

  width:
    34px;

  height:
    34px;

  border-radius:
    10px;

  font-size:
    18px;

}


.chat-brand-name {

  font-size:
    14px;

  font-weight:
    650;

}


.chat-brand-status {

  font-size:
    10px;

}


.chat-messages {

  width:
    min(100%, 860px);

  margin:
    0 auto;

  padding:
    25px 18px 25px;

}


/* =========================================================
   MESSAGE
========================================================= */

.chat-message {

  width:
    100%;

  display:
    flex;

  margin:
    0 0 28px;

}


.chat-message.user {

  justify-content:
    flex-end;

}


.chat-message.ai {

  align-items:
    flex-start;

  gap:
    10px;

}


.message-ai-avatar {

  width:
    34px;

  height:
    34px;

  flex:
    0 0 auto;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    10px;

  background:
    rgba(139, 92, 246, 0.14);

  color:
    var(--accent);

  font-size:
    17px;

}


.ai-message-wrap {

  min-width:
    0;

  max-width:
    min(78%, 680px);

}


.ai-bubble {

  padding:
    14px 16px;

  border:
    1px solid var(--border);

  border-radius:
    5px 17px 17px 17px;

  background:
    rgba(255,255,255,0.025);

  color:
    #e9e9ed;

  font-size:
    14px;

  line-height:
    1.72;

  white-space:
    pre-wrap;

  overflow-wrap:
    anywhere;

}


.user-bubble {

  max-width:
    min(78%, 620px);

  padding:
    12px 15px;

  border:
    1px solid
    rgba(167, 139, 250, 0.24);

  border-radius:
    18px 18px 5px 18px;

  background:
    rgba(139, 92, 246, 0.16);

  color:
    #f4f2ff;

  font-size:
    14px;

  line-height:
    1.6;

  white-space:
    pre-wrap;

  overflow-wrap:
    anywhere;

}


/* =========================================================
   MESSAGE ACTIONS
========================================================= */

.message-actions {

  display:
    flex;

  align-items:
    center;

  gap:
    3px;

  margin-top:
    7px;

  padding-left:
    1px;

}


.message-action {

  width:
    31px;

  height:
    30px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    8px;

  background:
    transparent;

  color:
    #777783;

  font-size:
    16px;

  transition:
    0.16s ease;

}


.message-action:hover {

  color:
    var(--text);

  background:
    rgba(255,255,255,0.06);

}


.message-action.voice-action-button {

  font-size:
    16px;

}


.message-action.voice-action-button.speaking {

  color:
    var(--accent);

  background:
    rgba(139, 92, 246, 0.10);

  animation:
    voiceButtonPulse 1s infinite;
}


@keyframes voiceButtonPulse {

  0% {
    box-shadow:
      0 0 0 0
      rgba(139,92,246,0.18);
  }

  70% {
    box-shadow:
      0 0 0 7px
      rgba(139,92,246,0);
  }

  100% {
    box-shadow:
      0 0 0 0
      rgba(139,92,246,0);
  }

}


/* =========================================================
   THINKING
========================================================= */

.thinking {

  display:
    flex;

  align-items:
    center;

  gap:
    5px;

  height:
    18px;

}


.thinking span {

  width:
    5px;

  height:
    5px;

  border-radius:
    50%;

  background:
    #9a9aa4;

  animation:
    thinking 1.2s infinite ease-in-out;

}


.thinking span:nth-child(2) {
  animation-delay:
    0.15s;
}


.thinking span:nth-child(3) {
  animation-delay:
    0.30s;
}


@keyframes thinking {

  0%,
  60%,
  100% {
    transform:
      translateY(0);

    opacity:
      0.35;
  }

  30% {
    transform:
      translateY(-4px);

    opacity:
      1;
  }

}


/* =========================================================
   CHAT COMPOSER
========================================================= */

.chat-composer-wrap {

  position:
    fixed;

  left:
    0;

  right:
    0;

  bottom:
    var(--nav-height);

  z-index:
    40;

  padding:
    12px 16px 9px;

  background:
    linear-gradient(
      180deg,
      transparent,
      rgba(9,9,13,0.94) 28%
    );

}


.chat-composer {

  width:
    min(100%, 830px);

  margin:
    0 auto;

}


.composer-hint {

  width:
    min(100%, 830px);

  margin:
    7px auto 0;

  text-align:
    center;

  color:
    #5d5d68;

  font-size:
    9px;

}


/* =========================================================
   PAGE HEADERS
========================================================= */

.page-header {

  min-height:
    var(--header-height);

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  padding:
    20px;

  border-bottom:
    1px solid var(--border);

}


.page-header h1 {

  margin-top:
    5px;

  font-size:
    28px;

  letter-spacing:
    -0.8px;

}


.page-content {

  width:
    min(100%, 860px);

  margin:
    0 auto;

  padding:
    25px 18px 35px;

}


/* =========================================================
   HISTORY
========================================================= */

.history-list {

  display:
    flex;

  flex-direction:
    column;

  gap:
    8px;

}


.history-item {

  display:
    flex;

  align-items:
    center;

  gap:
    12px;

  min-height:
    66px;

  padding:
    10px 11px;

  border:
    1px solid var(--border);

  border-radius:
    14px;

  background:
    rgba(255,255,255,0.02);

  cursor:
    pointer;

  transition:
    0.18s ease;

}


.history-item:hover {

  background:
    rgba(255,255,255,0.045);

  border-color:
    var(--border-strong);

}


.history-icon {

  width:
    38px;

  height:
    38px;

  flex:
    0 0 auto;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    10px;

  background:
    rgba(167,139,250,0.08);

  color:
    var(--accent);

}


.history-info {

  flex:
    1;

  min-width:
    0;

}


.history-title {

  overflow:
    hidden;

  white-space:
    nowrap;

  text-overflow:
    ellipsis;

  font-size:
    13px;

  font-weight:
    600;

}


.history-preview {

  margin-top:
    4px;

  overflow:
    hidden;

  white-space:
    nowrap;

  text-overflow:
    ellipsis;

  color:
    var(--text-muted);

  font-size:
    11px;

}


.history-delete {

  width:
    34px;

  height:
    34px;

  flex:
    0 0 auto;

  border-radius:
    9px;

  background:
    transparent;

  color:
    #666670;

  font-size:
    15px;

  transition:
    0.18s ease;

}


.history-delete:hover {

  color:
    var(--danger);

  background:
    rgba(255,107,107,0.08);

}


/* =========================================================
   EMPTY STATE
========================================================= */

.empty-state {

  width:
    100%;

  padding:
    45px 20px;

  text-align:
    center;

  color:
    var(--text-muted);

  font-size:
    13px;

}


.empty-icon {

  margin-bottom:
    12px;

  font-size:
    28px;

  opacity:
    0.7;

}


/* =========================================================
   PROFILE
========================================================= */

.profile-card {

  display:
    flex;

  align-items:
    center;

  gap:
    15px;

  padding:
    20px;

  border:
    1px solid var(--border);

  border-radius:
    18px;

  background:
    rgba(255,255,255,0.025);

}


.profile-mark {

  width:
    52px;

  height:
    52px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    15px;

  background:
    linear-gradient(
      145deg,
      #a78bfa,
      #7c3aed
    );

  font-size:
    24px;

}


.profile-card h2 {

  font-size:
    17px;

}


.profile-card p {

  margin-top:
    4px;

  color:
    var(--text-muted);

  font-size:
    12px;

}


/* =========================================================
   SETTINGS
========================================================= */

.settings-card {

  margin-top:
    14px;

  border:
    1px solid var(--border);

  border-radius:
    18px;

  background:
    rgba(255,255,255,0.02);

  overflow:
    hidden;

}


.settings-card-header {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    15px;

  padding:
    18px;

}


.settings-card-header h2 {

  margin-top:
    5px;

  font-size:
    17px;

}


.settings-card-header p {

  margin-top:
    5px;

  color:
    var(--text-muted);

  font-size:
    11px;

  line-height:
    1.5;

}


.settings-toggle {

  width:
    38px;

  height:
    38px;

  flex:
    0 0 auto;

  border:
    1px solid var(--border);

  border-radius:
    10px;

  background:
    rgba(255,255,255,0.03);

  color:
    var(--text-soft);

}


.voice-settings-panel {

  display:
    none;

  border-top:
    1px solid var(--border);

}


.voice-settings-panel.show {

  display:
    block;

}


.setting-row {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    15px;

  padding:
    15px 18px;

  border-bottom:
    1px solid var(--border);

}


.setting-row:last-child {
  border-bottom:
    0;
}


.setting-row-column {

  align-items:
    flex-start;

  flex-direction:
    column;

}


.setting-info {

  min-width:
    0;

}


.setting-info strong {

  display:
    block;

  font-size:
    13px;

  font-weight:
    600;

}


.setting-info span {

  display:
    block;

  margin-top:
    4px;

  color:
    var(--text-muted);

  font-size:
    10px;

  line-height:
    1.4;

}


.setting-select {

  min-width:
    100px;

  padding:
    8px 10px;

  border:
    1px solid var(--border-strong);

  border-radius:
    9px;

  background:
    var(--surface-2);

  color:
    var(--text);

  font-size:
    11px;

}


.range-wrapper {

  width:
    100%;

  display:
    flex;

  align-items:
    center;

  gap:
    12px;

}


.voice-range {

  flex:
    1;

  accent-color:
    var(--accent);

}


.range-value {

  width:
    42px;

  color:
    var(--accent);

  font-size:
    11px;

  text-align:
    right;

}


.voice-status-card {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    10px;

  margin:
    15px 18px;

  padding:
    11px;

  border:
    1px solid var(--border);

  border-radius:
    11px;

  background:
    rgba(255,255,255,0.02);

}


.voice-status {

  color:
    var(--text-muted);

  font-size:
    11px;

}


.voice-status.active {

  color:
    var(--accent);

}


.voice-test-button {

  padding:
    7px 10px;

  border-radius:
    8px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size:
    10px;

}


/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

.bottom-nav {

  position:
    fixed;

  left:
    0;

  right:
    0;

  bottom:
    0;

  height:
    var(--nav-height);

  z-index:
    100;

  display:
    grid;

  grid-template-columns:
    repeat(5, 1fr);

  align-items:
    center;

  padding:
    7px 8px
    max(7px, env(safe-area-inset-bottom));

  border-top:
    1px solid var(--border);

  background:
    rgba(10,10,14,0.94);

  backdrop-filter:
    blur(20px);

  -webkit-backdrop-filter:
    blur(20px);

}


.nav-btn {

  position:
    relative;

  height:
    58px;

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  gap:
    4px;

  background:
    transparent;

  color:
    #62626d;

  transition:
    0.18s ease;

}


.nav-icon {

  font-size:
    18px;

  line-height:
    1;

}


.nav-label {

  font-size:
    9px;

  font-weight:
    500;

}


.nav-btn.active {

  color:
    var(--text);

}


.nav-btn.active .nav-icon {

  color:
    var(--accent);

}


.nav-btn.active::after {

  content:
    "";

  position:
    absolute;

  bottom:
    2px;

  width:
    4px;

  height:
    4px;

  border-radius:
    50%;

  background:
    var(--accent);

  box-shadow:
    0 0 8px
    rgba(167,139,250,0.45);

}


.nav-new {

  color:
    #777782;

}


.nav-new-icon {

  width:
    34px;

  height:
    34px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  margin-bottom:
    1px;

  border:
    1px solid
    rgba(167,139,250,0.25);

  border-radius:
    11px;

  background:
    rgba(167,139,250,0.08);

  color:
    var(--accent);

  font-size:
    16px;

}


.nav-new.active .nav-new-icon {

  background:
    rgba(167,139,250,0.14);

  border-color:
    rgba(167,139,250,0.4);

}


/* =========================================================
   TOAST
========================================================= */

.toast {

  position:
    fixed;

  left:
    50%;

  bottom:
    calc(var(--nav-height) + 18px);

  z-index:
    200;

  max-width:
    calc(100% - 40px);

  padding:
    10px 14px;

  border:
    1px solid var(--border-strong);

  border-radius:
    10px;

  background:
    rgba(25,25,31,0.96);

  color:
    var(--text);

  font-size:
    11px;

  box-shadow:
    var(--shadow);

  opacity:
    0;

  pointer-events:
    none;

  transform:
    translate(-50%, 10px);

  transition:
    0.22s ease;

}


.toast.show {

  opacity:
    1;

  transform:
    translate(-50%, 0);

}


/* =========================================================
   SCROLLBAR
========================================================= */

::-webkit-scrollbar {
  width:
    5px;

  height:
    5px;
}


::-webkit-scrollbar-track {
  background:
    transparent;
}


::-webkit-scrollbar-thumb {

  background:
    rgba(255,255,255,0.10);

  border-radius:
    10px;

}


::-webkit-scrollbar-thumb:hover {

  background:
    rgba(255,255,255,0.18);

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {

  .top-header,
  .chat-header {

    padding:
      0 15px;

  }


  .home-content {

    padding:
      42px 14px 35px;

  }


  .home-hero {

    margin-bottom:
      28px;

  }


  .home-hero h1 {

    font-size:
      34px;

  }


  .home-hero p {

    font-size:
      13px;

  }


  .quick-grid {

    grid-template-columns:
      1fr;

  }


  .quick-card {

    min-height:
      62px;

  }


  .chat-messages {

    padding:
      20px 12px 20px;

  }


  .ai-message-wrap,
  .user-bubble {

    max-width:
      84%;

  }


  .ai-bubble,
  .user-bubble {

    font-size:
      13px;

  }


  .chat-composer-wrap {

    padding:
      10px 10px 7px;

  }


  .composer-hint {

    font-size:
      8px;

  }


  .page-content {

    padding:
      20px 13px 30px;

  }

}


/* =========================================================
   VERY SMALL DEVICES
========================================================= */

@media (max-width: 360px) {

  .brand-name {

    font-size:
      15px;

  }


  .brand-mark {

    width:
      35px;

    height:
      35px;

  }


  .composer-plus,
  .composer-mic,
  .composer-send {

    width:
      36px;

    height:
      36px;

  }


  .home-composer,
  .chat-composer {

    padding:
      7px;

  }


  .nav-label {

    font-size:
      8px;

  }

}


/* =========================================================
   SAFE AREA
========================================================= */

@supports (padding-bottom: env(safe-area-inset-bottom)) {

  .bottom-nav {

    padding-bottom:
      calc(
        7px +
        env(safe-area-inset-bottom)
      );

    height:
      calc(
        var(--nav-height) +
        env(safe-area-inset-bottom)
      );

  }


  .chat-screen {

    padding-bottom:
      calc(
        155px +
        env(safe-area-inset-bottom)
      );

  }

}