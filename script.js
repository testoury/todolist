// ═══════════════════════════════════════════════════════════
// GLOBALS
// ═══════════════════════════════════════════════════════════

let xp = Number(localStorage.getItem("xp")) || 0;
let level = Number(localStorage.getItem("level")) || 1;

// notification queue — prevents stacking
const notifQueue = [];
let notifActive = false;

// ═══════════════════════════════════════════════════════════
// SOUND — Web Audio API, no file needed
// ═══════════════════════════════════════════════════════════

function playDoneSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12); // E5
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24); // G5

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // silently fail if audio not supported
  }
}

function playCelebrationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS — queued, never stacks
// ═══════════════════════════════════════════════════════════

function showNotification(text, color = "#6c3db5") {
  notifQueue.push({ text, color });
  if (!notifActive) processNotifQueue();
}

function processNotifQueue() {
  if (notifQueue.length === 0) {
    notifActive = false;
    return;
  }

  notifActive = true;
  const { text, color } = notifQueue.shift();

  const notif = document.createElement("div");
  notif.textContent = text;
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 14px 20px;
    background: ${color};
    color: white;
    border-radius: 14px;
    z-index: 9999;
    font-family: 'Bubblegum Sans', sans-serif;
    font-size: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    opacity: 0;
    transform: translateX(40px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    max-width: 280px;
  `;

  document.body.appendChild(notif);

  // slide in
  requestAnimationFrame(() => {
    notif.style.opacity = "1";
    notif.style.transform = "translateX(0)";
  });

  // slide out after 2.5s then show next
  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transform = "translateX(40px)";
    setTimeout(() => {
      notif.remove();
      processNotifQueue();
    }, 300);
  }, 2500);
}

// ═══════════════════════════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════════════════════════

function celebrate(big = false) {
  if (typeof confetti === "undefined") return;
  confetti({
    particleCount: big ? 300 : 120,
    spread: big ? 130 : 70,
    origin: { y: 0.6 },
  });
}

// ═══════════════════════════════════════════════════════════
// XP SYSTEM
// ═══════════════════════════════════════════════════════════

function addXP(amount) {
  xp += amount;

  if (xp >= level * 100) {
    xp -= level * 100;
    level++;
    celebrate(true);
    playCelebrationSound();
    showNotification(`🚀 LEVEL UP! You are now Level ${level}`, "#2d7d46");
  }

  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
}

// ═══════════════════════════════════════════════════════════
// FORM
// ═══════════════════════════════════════════════════════════

const form = document.querySelector(".todoForm");
const daySelect = document.getElementById("daySelect");
const taskInput = document.getElementById("taskInput");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const day = daySelect.value;
  const task = taskInput.value.trim();

  // validation
  if (day === "") {
    daySelect.style.backgroundColor = "rgba(238,100,130,0.45)";
    showNotification("⚠️ Pick a day first!", "#c0392b");
    return;
  }
  if (task === "") {
    taskInput.style.backgroundColor = "rgba(238,100,130,0.45)";
    showNotification("⚠️ Write a task first!", "#c0392b");
    return;
  }

  daySelect.style.backgroundColor = "";
  taskInput.style.backgroundColor = "";

  const dayCard = document.querySelector(`[data-day="${day}"]`);
  const ulCard = dayCard.querySelector(".todoList");

  ulCard.appendChild(createTask(task, false, false, day));
  saveTasks();

  daySelect.value = "";
  taskInput.value = "";
  taskInput.focus();
});

// ═══════════════════════════════════════════════════════════
// CREATE TASK
// ═══════════════════════════════════════════════════════════

function createTask(text, isDone, isMissed, day) {
  const li = document.createElement("li");
  li.dataset.day = day;

  // text span
  const span = document.createElement("span");
  span.textContent = text;
  li.appendChild(span);

  // buttons wrapper
  const divBtn = document.createElement("div");
  divBtn.classList.add("divBtn");

  // ── done button ──
  const doneBtn = document.createElement("button");
  doneBtn.classList.add("doneBtn");
  doneBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m8 13l4.228 3.382a1 1 0 0 0 1.398-.148L22 6"/><path fill="currentColor" fill-rule="evenodd" d="m11.19 12.237l4.584-5.604a1 1 0 0 0-1.548-1.266l-4.573 5.59zm-3.167 3.87l-1.537-1.28l-.653.798L2.6 13.2a1 1 0 0 0-1.2 1.6l3.233 2.425a2 2 0 0 0 2.748-.334z" clip-rule="evenodd"/></g></svg>`;

  doneBtn.addEventListener("click", function () {
    li.classList.add("done");
    li.classList.remove("purpleMissed");

    doneBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M18 8h-1V7c0-2.757-2.243-5-5-5S7 4.243 7 7v1H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2M9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v1H9zm4 8.723V18h-2v-2.277c-.595-.346-1-.984-1-1.723a2 2 0 1 1 4 0c0 .738-.405 1.376-1 1.723"/></svg>`;
    doneBtn.disabled = true;

    playDoneSound();
    addXP(10);
    saveTasks();
    checkDayCompletion(li);
  });

  // ── delete button ──
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("deleteBtn");
  deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m13.5 10l4 4m0-4l-4 4m6.095 4.5H9.298a2 2 0 0 1-1.396-.568l-5.35-5.216a1 1 0 0 1 0-1.432l5.35-5.216A2 2 0 0 1 9.298 5.5h10.297c.95 0 2.223.541 2.223 1.625v9.75c0 1.084-1.273 1.625-2.223 1.625"/></svg>`;

  deleteBtn.addEventListener("click", function () {
    li.remove();
    saveTasks();
  });

  // restore state
  if (isDone) {
    li.classList.add("done");
    doneBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M18 8h-1V7c0-2.757-2.243-5-5-5S7 4.243 7 7v1H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2M9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v1H9zm4 8.723V18h-2v-2.277c-.595-.346-1-.984-1-1.723a2 2 0 1 1 4 0c0 .738-.405 1.376-1 1.723"/></svg>`;
    doneBtn.disabled = true;
  }
  if (isMissed) {
    li.classList.add("purpleMissed");
  }

  divBtn.appendChild(doneBtn);
  divBtn.appendChild(deleteBtn);
  li.appendChild(divBtn);

  return li;
}

// ═══════════════════════════════════════════════════════════
// DAY COMPLETION CHECK
// ═══════════════════════════════════════════════════════════

function checkDayCompletion(justLockedLi) {
  // find which card this task belongs to
  const card = justLockedLi.closest(".container");
  if (!card) return;

  const tasks = card.querySelectorAll("li");
  if (tasks.length === 0) return;

  const allDone = [...tasks].every((li) => li.classList.contains("done"));
  if (!allDone) return;

  const dayName = card.dataset.day;
  if (dayName === "missed") return;

  celebrate(true);
  playCelebrationSound();

  // green glow on the card
  card.style.transition = "box-shadow 0.3s ease";
  card.style.boxShadow = "0 0 40px rgba(0,255,150,0.7)";
  setTimeout(() => (card.style.boxShadow = ""), 3000);

  showNotification(
    `🔥 All done on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}!`,
    "#2d7d46",
  );
  addXP(50);
}

// ═══════════════════════════════════════════════════════════
// SAVE TASKS
// ═══════════════════════════════════════════════════════════

function saveTasks() {
  const data = {};

  document.querySelectorAll(".container").forEach((cards) => {
    const day = cards.dataset.day;
    const tasks = [];
    data[day] = tasks;

    cards.querySelectorAll("li").forEach((li) => {
      tasks.push({
        text: li.querySelector("span").textContent,
        done: li.classList.contains("done"),
        missed: li.classList.contains("purpleMissed"),
        day: li.dataset.day,
      });
    });
  });

  localStorage.setItem("tasks", JSON.stringify(data));
}

// ═══════════════════════════════════════════════════════════
// LOAD TASKS
// ═══════════════════════════════════════════════════════════

function loadTasks() {
  const data = JSON.parse(localStorage.getItem("tasks"));
  if (!data) return;

  Object.keys(data).forEach((day) => {
    const dayCard = document.querySelector(`[data-day="${day}"]`);
    if (!dayCard) return;

    const ulCard = dayCard.querySelector(".todoList");
    data[day].forEach((task) => {
      ulCard.appendChild(
        createTask(task.text, task.done, task.missed, task.day),
      );
    });
  });
}

// ═══════════════════════════════════════════════════════════
// DATE HELPERS
// ═══════════════════════════════════════════════════════════

function getWeekNumber() {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - firstDay) / 86400000 + firstDay.getDay() + 1) / 7);
}

// ═══════════════════════════════════════════════════════════
// CHECK DAY — runs daily reset on yesterday's card
// ═══════════════════════════════════════════════════════════

function checkDay() {
  const currentDay = new Date().toDateString();
  const savedDay = localStorage.getItem("Daynum");

  if (currentDay !== savedDay) {
    dailyReset();
    localStorage.setItem("Daynum", currentDay);
  }
}

function dailyReset() {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayIndex = new Date().getDay();

  // skip weekends
  if (todayIndex === 0 || todayIndex === 6) return;

  const yesterday = dayNames[todayIndex - 1];
  const yesterdayCard = document.querySelector(`[data-day="${yesterday}"]`);
  if (!yesterdayCard) return;

  const missedCard = document.querySelector("[data-day='missed']");
  const missedUl = missedCard.querySelector(".todoList");

  yesterdayCard.querySelectorAll("li").forEach((li) => {
    if (!li.classList.contains("done")) {
      li.classList.add("purpleMissed");
      missedUl.appendChild(li);
    }
  });

  saveTasks();
}

// ═══════════════════════════════════════════════════════════
// CHECK WEEK — runs weekly reset every Monday
// ═══════════════════════════════════════════════════════════

function checkWeek() {
  const currentWeek = getWeekNumber();
  const savedWeek = Number(localStorage.getItem("Weeknum"));

  if (currentWeek !== savedWeek) {
    weeklyReset();
    localStorage.setItem("Weeknum", currentWeek);
  }
}

function weeklyReset() {
  const missedCard = document.querySelector("[data-day='missed']");
  if (!missedCard) return;

  // move missed tasks back to original card in red
  missedCard.querySelectorAll("li").forEach((li) => {
    const originalDay = li.dataset.day;
    const originalCard = document.querySelector(`[data-day="${originalDay}"]`);
    if (!originalCard) return;

    li.classList.remove("purpleMissed");
    li.classList.add("red");
    originalCard.querySelector(".todoList").prepend(li);
  });

  // unlock all done tasks across all cards
  document.querySelectorAll("li.done").forEach((li) => {
    const btn = li.querySelector(".doneBtn");
    li.classList.remove("done");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m8 13l4.228 3.382a1 1 0 0 0 1.398-.148L22 6"/><path fill="currentColor" fill-rule="evenodd" d="m11.19 12.237l4.584-5.604a1 1 0 0 0-1.548-1.266l-4.573 5.59zm-3.167 3.87l-1.537-1.28l-.653.798L2.6 13.2a1 1 0 0 0-1.2 1.6l3.233 2.425a2 2 0 0 0 2.748-.334z" clip-rule="evenodd"/></g></svg>`;
    }
  });

  saveTasks();
  showNotification("🔄 New week! Tasks have been reset.", "#6c3db5");
}

// ═══════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════
loadTasks();
checkDay();
checkWeek();

// re-check every minute in case the day changes while app is open
setInterval(() => {
  checkDay();
  checkWeek();
}, 60000);
