# 📝 Form Builder Frontend

A dynamic form builder application built with **React**, allowing users to:
- Create custom forms with various input types
- Drag and drop to reorder inputs
- Edit existing forms
- Submit form responses
- View previously submitted responses

> 🔥 No third-party UI libraries were used (except for drag-and-drop and notifications)

---

## 🚀 Features

- ✅ Create and edit forms
- 🧩 Add inputs (Text, Number, Email, Password, Date)
- ✏️ Edit input title and placeholder
- 🎯 Drag and drop input fields to reorder (using `@dnd-kit`)
- 🧹 Delete inputs
- 📦 Save and load forms from backend
- 📬 Submit responses and view them
- 🔔 Toast notifications for all actions (`react-toastify`)

---

## 🧱 Tech Stack

- **React**
- **Tailwind CSS**
- **@dnd-kit** – drag and drop functionality
- **React Router** – routing
- **React Toastify** – notification system
- **Axios** – API requests (assumed via custom `API.js` instance)

---

## 🧰 Available Scripts

### Start the app

```bash
npm install
npm run dev
