
# 🏫 School Management System - Mahiyangana School

The **School Management System** is a full-stack web application designed to streamline administrative, academic, and communication tasks in schools. It supports role-based access for **Admin**, **Staff**, and **Students**. Built using the **MERN Stack** and styled with **Tailwind CSS**, the system enables secure data handling, efficient task management, and smooth user experience.

---

## 📚 Table of Contents

- [🌟 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [📋 Prerequisites](#-prerequisites)
  - [🔐 Environment Variables](#-environment-variables)
  - [📦 Installation](#-installation)
- [🙋‍♀️ Developer](#-developer)

---

## 🌟 Features

### 🔐 Authentication & Authorization
- Secure login using JWT
- Password hashing using bcrypt
- Role-based access: Admin, Staff, Student

### 👩‍🏫 Admin Dashboard
- Predefined admin accounts (3 admins)
- Add and remove staff members
- Add and remove students
- Add and remove assignments
- Add and remove attendance records
- Add and remove marks
- Send and remove notifications

### 🧑‍🏫 Staff Dashboard
- Login using admin-created credentials
- Add and remove assignments
- Add and remove attendance
- Add and remove marks
- Send notifications to students

### 👨‍🎓 Student Portal
- Login using admin-created credentials
- View:
  - Assignments
  - Attendance records
  - Marks
  - Notifications

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, bcrypt
- **Other Tools**: React Router, Axios, dotenv

---

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v14+)
- MongoDB (Atlas or local)

### 🔐 Environment Variables

Create a `.env` file inside the `backend` directory and add:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_key
````

### 📦 Installation

1. Clone the repository

```bash
git clone https://github.com/KanujanS/School-Management-System
cd school-management-system
```

2. Install backend dependencies

```bash
cd backend
npm install
npm start
```

3. Install frontend dependencies

```bash
cd ../frontend
npm install
npm start
```

---

> ⚠️ Admin must first create staff and student accounts.

---

## 🙋‍♀️ Developers

This project was developed by a team of Software Engineering undergraduates from  
**Sabaragamuwa University of Sri Lanka**:

- **Kanujan**
- **Nilakshi**
- **Pramodhi**
- **Prabodha**
- **Jeyprashanth**


