# ⚡ Reaction Speed — Mini Game

A fast-paced reaction game built with **Vanilla JavaScript**, **Tailwind CSS**, and **GSAP animations**.  
Created as part of an internship assignment to demonstrate clean modular code, smooth animations, responsive design, and leaderboard integration.

---

## 🚀 Demo
🔗 Live Demo: [Reaction Speed Game](https://reaction-speed-nine.vercel.app/)  
📂 GitHub Repo: [reaction-speed](https://github.com/jeshu2004/Reaction-speed)

---

## 🎮 How to Play
1. Press **Start**.
2. Wait for the **3-2-1 countdown**.
3. Tap/click the **glowing circle** before the timer runs out.
4. Each successful tap increases your **score** and makes the game **faster & harder**.
5. A wrong tap reduces your remaining time.
6. Game ends when the timer hits zero.

---

## 🕹️ Controls
- **Start** → Begin the game with countdown.  
- **Pause** → Pause the current game.  
- **Resume** → Continue after pausing.  
- **Restart** → Restart a fresh session.  

---

## ✨ Features
- Responsive **grid layout** (mobile & desktop).
- **Smooth GSAP animations** (pulse, timer bar, button feedback).
- **Glassmorphism UI** with Tailwind.
- Countdown with **beep sounds**.
- **Dynamic difficulty**: speed & target size shrink with progress.
- **Local best score** stored in `localStorage`.
- **Leaderboard stub** (static JSON, ready to replace with API).
- **Sound feedback** for clicks, countdown, success & game over.

---
## 📂 Project Structure
├── index.html # Main game page
├── styles.css # Extra styles (glass effect, scrollbar, etc.)
├── game.js # Core game logic
├── leaderboard.json # (stub data for leaderboard)
└── README.md # Documentation

## 🛠️ Tech Stack
- **Vanilla JS** (no frameworks)
- **Tailwind CSS** (CDN build)
- **GSAP** (animations)
- **Web Audio API** (sound effects)

---

## 📜 License
MIT License — free to use and modify.

