# 📋 Weekly Planner

A beautiful glassmorphism-styled weekly task planner built with vanilla HTML, CSS and JavaScript.

---

## ✨ Features

- **Add tasks** to specific day cards (Monday → Friday)
- **Lock tasks** as done with a ✓ button — shows a 🔒 icon when completed
- **Delete tasks** with a dedicated delete button
- **Daily reset** — unlocked tasks move to the Missed Tasks card every new day
- **Weekly reset** — missed tasks return to their original day card highlighted in red every new week
- **Persistent storage** — tasks are saved in localStorage and survive page refreshes
- **Responsive design** — works on both desktop and mobile with a fixed toolbar form on phone

---

## 🛠️ Built With

- HTML5
- CSS3 (Glassmorphism, CSS Grid, Media Queries)
- Vanilla JavaScript (no frameworks)
- localStorage API
- Google Fonts — Bubblegum Sans

---

## 🚀 How to Use

1. Type a task in the input field
2. Pick a day from the dropdown
3. Click **Add** or press **Enter**
4. The task appears in the correct day card
5. Click ✓ to mark as done — it locks with a 🔒
6. Click the delete button to remove a task
7. Come back the next day — unlocked tasks automatically move to **Missed Tasks**
8. Every new week — missed tasks return to their day card in red as a reminder

---

## 📁 Project Structure

```
weekly-planner/
├── index.html       # Main HTML structure
├── style.css        # All styles including glassmorphism and responsive
├── script.js        # All JavaScript logic
└── assest/
    └── background1.jpg  # Purple wavy background image
```

---

## 🔄 Reset Logic

| Event | What happens |
|-------|-------------|
| New day | Unlocked tasks → Missed Tasks card (purple style) |
| New week | Missed tasks → back to original day card (red style) |
| New week | Locked tasks → unlocked for the new week |

---

## 📱 Responsive

- **Desktop** — 3 column grid layout
- **Mobile** — 2 column grid, form fixed at bottom as toolbar

---

## 🔮 Future Plans

- Firebase integration for cross-device sync
- User accounts and login
- Boy/Girl color theme selector
- Notifications for missed tasks

---

## 👨‍💻 Author
-**TESTOURY-HICHEM**-
Built from scratch as a learning project — HTML, CSS and JavaScript only, no frameworks!
