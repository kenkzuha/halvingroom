# 🪙 The Halving Room - Crypto Portfolio Tracker

A full-featured cryptocurrency portfolio tracker built with **Django**, **HTML/CSS**, and **Chart.js**, designed for easy tracking of your crypto assets, real-time market prices, and historical profit performance.

---

## 🚀 Features

- 🔐 User authentication (Signup/Login/Logout)
- 📊 Dynamic dashboard with:
  - Total portfolio value
  - Portfolio Value over time (24h, 7d, 30d, etc.)
  - Asset allocation donut chart
  - Asset table with real-time price, holdings, and value
- ➕ Add/Edit/Delete assets
- 💹 Refresh real-time prices via API
- 📈 Chart.js integration for interactive graphs
- 🔍 Search bar for assets
- 📱 Responsive UI with FontAwesome icons
- 🔧 Built-in settings and educational "Learn" section

---

## 🏗️ Tech Stack

- **Backend**: Django (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite (can be swapped with PostgreSQL)
- **Charting**: Chart.js
- **Authentication**: Django's built-in auth system
- **APIs**: CoinGecko/CoinMarketCap-compatible endpoint (custom or 3rd party)

---

## 📷 Screenshots

> 📌 Add screenshots or screen recordings here if available!

---

## 📁 Project Structure
halving-room/
│
├── templates/
│ └── index.html # Main dashboard page
│
├── static/
│ ├── styles.css # Custom styles
│ └── ... # FontAwesome and Chart.js assets
│
├── views.py # Django views for auth, dashboard, and asset actions
├── urls.py # URL routing
├── models.py # Asset model
├── forms.py # Django forms for asset management
├── templates/registration/ # Django auth templates
│ └── login.html, signup.html
│
├── manage.py
└── README.md # You are here!

---

## 🔧 Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/kenkzuha/halvingroom.git
cd halvingroom
2. Create a virtual environment
bash
Copy
Edit
python -m venv env
source env/bin/activate  # On Windows use: env\Scripts\activate
3. Install dependencies
bash
Copy
Edit
pip install -r requirements.txt
4. Apply migrations
bash
Copy
Edit
python manage.py migrate
5. Run the development server
bash
Copy
Edit
python manage.py runserver
