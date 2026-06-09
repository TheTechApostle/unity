/* ============================================================
   UNITY TECH HUB — chatbot.js
   AI chatbot powered by Claude API + WhatsApp handoff
   ============================================================ */

const WA_NUMBER = '2348109689809';
const WA_BASE   = `https://wa.me/${WA_NUMBER}?text=`;

const SYSTEM_PROMPT = `You are the friendly AI assistant for Unity Tech Hub, a tech and academic services centre located at University Road, Opposite Bekind Filling Station, Tanke, Ilorin, Nigeria.

Your job is to answer questions about Unity Tech Hub warmly and concisely. Here is everything you know about the business:

SERVICES:
1. Café & Printing Services:
   - DIY Printing (A3, Flyers, Book Covers, Jotter Covers, etc.)
   - Photocopying, Scanning, Binding, Laminating
   - Passport photos
   - All online registration & bill payment services
   - FREE PS4 Games for customers

2. Research & Document Services:
   - Research Writing (Articles & Non-thesis)
   - Content Writing
   - Data Analysis (SPSS, Excel, AMOS, STATA, NVivo, etc.)
   - CBT & Full E-Learning App for Secondary Schools
   - Personal Coaching (Academics/Students)

3. Tech Courses & ICT Solutions:
   - AI Tech Courses (AI Engineering & Automation)
   - Data Analysis
   - Data Science
   - Web Development
   - Cyber Security Management
   - Taught by Skilled Coaches & Experienced Assessors

CONTACT:
- Phone: 08109689809
- Email: unitytechacademy@gmail.com
- Address: University Road, Opposite Bekind Filling Station, Tanke, Ilorin.
- WhatsApp available on the same number.

HIGHLIGHTS:
- Friendly environment
- Reliable and fast services
- Affordable prices
- 100% customer satisfaction guaranteed
- Quality service guaranteed

RULES:
- Keep replies SHORT (2–4 sentences max) and friendly.
- Always end replies that involve pricing, enrolment, or specific booking with a suggestion to continue on WhatsApp.
- If you don't know something specific (e.g. exact prices), say you'll be happy to connect them on WhatsApp where the team can help directly.
- Never make up prices or details not listed above.
- Speak like a helpful Nigerian customer service rep — warm, direct, professional.
- Do not use markdown formatting like **bold** or bullet dashes in your response. Use plain conversational sentences.`;

// ── State ──
const chatHistory = [];
let panelOpen = false;

// ── DOM refs ──
const chatPanel    = document.getElementById('chatPanel');
const chatToggle   = document.getElementById('chatToggle');
const chatIcon     = document.getElementById('chatIcon');
const chatCloseI   = document.getElementById('chatClose');
const chatMin      = document.getElementById('chatMin');
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const chatSend     = document.getElementById('chatSend');
const chatNotif    = document.getElementById('chatNotif');
const chatWaBtn    = document.getElementById('chatWaBtn');
const quickReplies = document.getElementById('quickReplies');


// ── Toggle panel ──
function togglePanel(forceOpen) {
  panelOpen = forceOpen !== undefined ? forceOpen : !panelOpen;
  chatPanel.classList.toggle('open', panelOpen);
  chatIcon.classList.toggle('d-none', panelOpen);
  chatCloseI.classList.toggle('d-none', !panelOpen);
  if (panelOpen) {
    chatNotif.classList.add('hidden');
    scrollToBottom();
    setTimeout(() => chatInput.focus(), 200);
  }
}

chatToggle.addEventListener('click', () => togglePanel());
chatMin.addEventListener('click', () => togglePanel(false));


// ── Quick reply buttons ──
if (quickReplies) {
  quickReplies.querySelectorAll('.qr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      quickReplies.style.display = 'none';
      sendMessage(msg);
    });
  });
}


// ── Send on button / enter ──
chatSend.addEventListener('click', () => {
  const val = chatInput.value.trim();
  if (val) sendMessage(val);
});
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const val = chatInput.value.trim();
    if (val) sendMessage(val);
  }
});


// ── Core send function ──
async function sendMessage(text) {
  if (!text) return;
  chatInput.value = '';

  // Append user bubble
  appendBubble('user', text);

  // Add to history
  chatHistory.push({ role: 'user', content: text });

  // Show typing
  const typingEl = showTyping();

  try {
    const reply = await callClaude(chatHistory);
    typingEl.remove();
    appendBubble('bot', reply);
    chatHistory.push({ role: 'assistant', content: reply });

    // Update WhatsApp deep link with last user message context
    const encoded = encodeURIComponent(`Hello Unity Tech Hub! I was asking about: ${text}`);
    chatWaBtn.href = `${WA_BASE}${encoded}`;

  } catch (err) {
    typingEl.remove();
    appendBubble('bot', "Sorry, I'm having a little trouble right now. Please reach us directly on WhatsApp — we'll respond right away! 💬");
    console.error('Claude API error:', err);
  }
}


// ── Call Claude API ──
async function callClaude(history) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: history
    })
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.content.map(b => b.text || '').join('').trim();
}


// ── Append bubble ──
function appendBubble(role, text) {
  const wrap = document.createElement('div');
  wrap.className = `chat-msg ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;

  const time = document.createElement('span');
  time.className = 'msg-time';
  time.textContent = getTime();

  // If bot response mentions WhatsApp, add a quick WA button inside bubble
  if (role === 'bot' && /whatsapp/i.test(text)) {
    const waInline = document.createElement('a');
    waInline.href = chatWaBtn.href;
    waInline.target = '_blank';
    waInline.rel = 'noopener';
    waInline.style.cssText = `
      display:inline-flex;align-items:center;gap:5px;
      margin-top:8px;background:#25D366;color:#fff;
      font-size:0.73rem;font-weight:700;padding:5px 12px;
      border-radius:6px;text-decoration:none;font-family:'Montserrat',sans-serif;
    `;
    waInline.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Open WhatsApp`;
    bubble.appendChild(document.createElement('br'));
    bubble.appendChild(waInline);
  }

  wrap.appendChild(bubble);
  wrap.appendChild(time);
  chatMessages.appendChild(wrap);
  scrollToBottom();
}


// ── Typing indicator ──
function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg bot typing-bubble';
  wrap.innerHTML = `<div class="msg-bubble">
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  </div>`;
  chatMessages.appendChild(wrap);
  scrollToBottom();
  return wrap;
}


// ── Helpers ──
function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
