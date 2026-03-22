// ── Grab the form elements from the HTML ──
const form = document.querySelector(".todoForm");
const daySelect = document.getElementById("daySelect");
const taskInput = document.getElementById("taskInput");

// ─────────────────────────────────────────────────────────
// FORM SUBMIT — runs when user clicks Add
// ─────────────────────────────────────────────────────────
form.addEventListener("submit", function (e) {
  e.preventDefault(); // stop page from refreshing

  const day = daySelect.value;
  const task = taskInput.value;

  // ── Validate: make sure user picked a day ──
  if (day === "") {
    alert("Pick a Day");
    daySelect.style.backgroundColor = "rgba(238, 100, 130, 0.45)";
    return;
  }

  // ── Validate: make sure user typed a task ──
  if (task === "") {
    alert("Write a Task");
    taskInput.style.backgroundColor = "rgba(238, 100, 130, 0.45)";
    return;
  }

  // ── Reset error colors ──
  daySelect.style.backgroundColor = "";
  taskInput.style.backgroundColor = "";

  // ── Find the correct day card and its list ──
  const dayCard = document.querySelector(`[data-day="${day}"]`);
  const ulCard = dayCard.querySelector(".todoList");

  // ── Create the task and add it to the list ──
  const li = createTask(task, false, false, day);
  ulCard.appendChild(li);

  // ── Save updated list to localStorage ──
  saveTasks();

  // ── Clear the form fields ──
  daySelect.value = "";
  taskInput.value = "";
});

// ─────────────────────────────────────────────────────────
// CREATE TASK — builds one complete <li> with buttons
// parameters: text, isDone, isMissed, day
// called from both the form submit and loadTasks
// ─────────────────────────────────────────────────────────
function createTask(text, isDone, isMissed, day) {
  // ── Create the main list item and store the original day on it ──
  const li = document.createElement("li");
  li.dataset.day = day;

  // ── Create the text span ──
  const span = document.createElement("span");
  span.textContent = text;
  li.appendChild(span);

  // ── Create the buttons wrapper div ──
  const divBtn = document.createElement("div");
  divBtn.classList.add("divBtn");

  // ── Done button: locks the task when clicked ──
  const doneBtn = document.createElement("button");
  doneBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m8 13l4.228 3.382a1 1 0 0 0 1.398-.148L22 6"/><path fill="currentColor" fill-rule="evenodd" d="m11.19 12.237l4.584-5.604a1 1 0 0 0-1.548-1.266l-4.573 5.59zm-3.167 3.87l-1.537-1.28l-.653.798L2.6 13.2a1 1 0 0 0-1.2 1.6l3.233 2.425a2 2 0 0 0 2.748-.334z" clip-rule="evenodd"/></g></svg>`;
  doneBtn.classList.add("doneBtn");

  doneBtn.addEventListener("click", function () {
    li.classList.add("done"); // mark as done
    li.classList.remove("purpleMissed"); // remove missed style if it had one
    doneBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="M18 8h-1V7c0-2.757-2.243-5-5-5S7 4.243 7 7v1H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2M9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v1H9zm4 8.723V18h-2v-2.277c-.595-.346-1-.984-1-1.723a2 2 0 1 1 4 0c0 .738-.405 1.376-1 1.723"/></svg>';
    doneBtn.disabled = true; // can't click again
    saveTasks(); // save the updated state
  });

  // ── Delete button: removes the task ──
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m13.5 10l4 4m0-4l-4 4m6.095 4.5H9.298a2 2 0 0 1-1.396-.568l-5.35-5.216a1 1 0 0 1 0-1.432l5.35-5.216A2 2 0 0 1 9.298 5.5h10.297c.95 0 2.223.541 2.223 1.625v9.75c0 1.084-1.273 1.625-2.223 1.625"/></svg>`;
  deleteBtn.classList.add("deleteBtn");

  deleteBtn.addEventListener("click", function () {
    li.remove(); // remove from the page
    saveTasks(); // save the updated state
  });

  // ── Restore done state if task was already locked when saved ──
  if (isDone) {
    li.classList.add("done");
    doneBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="M18 8h-1V7c0-2.757-2.243-5-5-5S7 4.243 7 7v1H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2M9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v1H9zm4 8.723V18h-2v-2.277c-.595-.346-1-.984-1-1.723a2 2 0 1 1 4 0c0 .738-.405 1.376-1 1.723"/></svg>';
    doneBtn.disabled = true;
  }

  // ── Restore missed state if task was missed when saved ──
  if (isMissed) {
    li.classList.add("purpleMissed");
  }

  // ── Assemble: buttons → divBtn → li ──
  divBtn.appendChild(doneBtn);
  divBtn.appendChild(deleteBtn);
  li.appendChild(divBtn);

  // ── Return the completed li ──
  return li;
}

// ─────────────────────────────────────────────────────────
// SAVE TASKS — reads all tasks from the page and saves to localStorage
// called after every add, lock, or delete
// ─────────────────────────────────────────────────────────
function saveTasks() {
  const data = {};

  // ── Loop through each day card ──
  document.querySelectorAll(".container").forEach(function (cards) {
    const day = cards.dataset.day; // the card's day name
    const tasks = []; // empty array for this day's tasks
    data[day] = tasks; // link the day to its tasks array

    // ── Loop through each task in this card ──
    cards.querySelectorAll("li").forEach(function (li) {
      tasks.push({
        text: li.querySelector("span").textContent, // the task text
        done: li.classList.contains("done"), // locked or not
        missed: li.classList.contains("purpleMissed"), // missed or not
        day: li.dataset.day, // original day (sticky note)
      });
    });
  });
  
  // ── Convert to JSON string and save ──
  localStorage.setItem("tasks", JSON.stringify(data));
}

// ─────────────────────────────────────────────────────────
// LOAD TASKS — runs on page load, rebuilds tasks from localStorage
// ─────────────────────────────────────────────────────────
function loadTasks() {
  const data = JSON.parse(localStorage.getItem("tasks"));

  // ── Nothing saved yet, stop here ──
  if (data === null) return;

  // ── Loop through each day in saved data ──
  Object.keys(data).forEach(function (day) {
    const dayCard = document.querySelector(`[data-day="${day}"]`);
    const ulCard = dayCard.querySelector(".todoList");

    // ── Rebuild each task using createTask ──
    data[day].forEach(function (task) {
      const li = createTask(task.text, task.done, task.missed, task.day);
      ulCard.appendChild(li);
    });
  });
}

// ─────────────────────────────────────────────────────────
// GET WEEK NUMBER — returns the current week number of the year
// ─────────────────────────────────────────────────────────
function getWeekNumber() {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - firstDay) / 86400000 + firstDay.getDay() + 1) / 7);
}

// ─────────────────────────────────────────────────────────
// CHECK DAY — checks if it's a new day, runs dailyReset if so
// ─────────────────────────────────────────────────────────
function checkDay() {
  const currentDay = new Date().toDateString();
  const savedDay = localStorage.getItem("Daynum");

  if (currentDay !== savedDay) {
    dailyReset();
    localStorage.setItem("Daynum", currentDay);
  }
}

// ─────────────────────────────────────────────────────────
// DAILY RESET — moves unlocked tasks to the missed card
// runs every new day
// ─────────────────────────────────────────────────────────
function dailyReset() {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const currentDay = localStorage.getItem("activeDay") || "monday";
  const currentIndex = days.indexOf(currentDay);
  const todayCard = document.querySelector(`[data-day="${currentDay}"]`);

  // ── Calculate next day first ──
  const nextIndex = (currentIndex + 1) % days.length;
  const nextDay = days[nextIndex];
  localStorage.setItem("activeDay", nextDay);
  
  // ── If no card for today (weekend) skip reset but save next day ──
  if(!todayCard) return;

  // ── Loop through tasks in today's card only ──
  todayCard.querySelectorAll("li").forEach(function(li) {
    if(!li.classList.contains("done")) {
      li.classList.add("purpleMissed");
      const missedCard = document.querySelector("[data-day='missed']");
      const ulCard = missedCard.querySelector(".todoList");
      ulCard.appendChild(li);
    };
  });

  saveTasks();
};

// ─────────────────────────────────────────────────────────
// CHECK WEEK — checks if it's a new week, runs weeklyReset if so
// ─────────────────────────────────────────────────────────
function checkWeek() {
  const currentWeek = getWeekNumber();
  const savedWeek = Number(localStorage.getItem("Weeknum"));

  if (currentWeek !== savedWeek) {
    weeklyReset();
    localStorage.setItem("Weeknum", currentWeek);
  }
}

// ─────────────────────────────────────────────────────────
// WEEKLY RESET — unlocks done tasks, moves missed tasks back to original card in red
// runs every new week
// ─────────────────────────────────────────────────────────
function weeklyReset() {
  // ── Loop through all cards ──
  document.querySelectorAll(".container").forEach(function (cards) {
    cards.querySelectorAll("li").forEach(function (li) {
      const doneBtn = li.querySelector(".doneBtn");

      if (li.classList.contains("done")) {
        // ── Task was done → unlock it for the new week ──
        li.classList.remove("done");
        doneBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m8 13l4.228 3.382a1 1 0 0 0 1.398-.148L22 6"/><path fill="currentColor" fill-rule="evenodd" d="m11.19 12.237l4.584-5.604a1 1 0 0 0-1.548-1.266l-4.573 5.59zm-3.167 3.87l-1.537-1.28l-.653.798L2.6 13.2a1 1 0 0 0-1.2 1.6l3.233 2.425a2 2 0 0 0 2.748-.334z" clip-rule="evenodd"/></g></svg>`;
        doneBtn.disabled = false;
          const originalDay = li.dataset.day;
          const originalCard = document.querySelector(
            `[data-day="${originalDay}"]`,
          );
        const ulCard = originalCard.querySelector(".todoList");
        ulCard.appendChild(li);
      } else if (li.classList.contains("purpleMissed")) {
        // ── Task was missed → move back to original card in red ──
        const originalDay = li.dataset.day;
        const originalCard = document.querySelector(
          `[data-day="${originalDay}"]`,
        );
        const ulCard = originalCard.querySelector(".todoList");
        li.classList.remove("purpleMissed");
        li.classList.add("red");
        ulCard.prepend(li);
      }
    });
  });

  saveTasks();
}

// ─────────────────────────────────────────────────────────
// STARTUP — runs in order when page first loads
// ─────────────────────────────────────────────────────────
loadTasks(); // 1. load saved tasks from localStorage
checkDay(); // 2. check if it's a new day → daily reset if needed
checkWeek(); // 3. check if it's a new week → weekly reset if needed
