# 💰 SpendSense – Smart Expense Tracker

SpendSense is a web-based expense tracking application designed to help users
manage and understand their personal expenses in a simple and organized way.

The application allows users to create an account, log in securely, and view
their financial information through a clean and interactive dashboard.

The planned system will also integrate with Gmail to identify transaction
receipts received through email and automatically record relevant expenses.

---

## 📌 Project Overview

Managing daily expenses manually can be time-consuming and difficult to track.
Users often have to check different transaction messages, receipts, and
records to understand where their money is being spent.

SpendSense aims to provide a single platform where users can manage their
expenses and visualize their spending patterns through charts and summaries.

The project follows a MERN-based architecture:

- React.js – Frontend
- Node.js – Backend runtime
- Express.js – Backend framework
- MongoDB – Database
- Mongoose – MongoDB integration
- Tailwind CSS – UI styling
- JWT – Authentication
- bcryptjs – Password hashing
- Gmail API – Planned transaction receipt integration

---

## 🎯 Objectives

- Provide a simple platform for managing personal expenses.
- Allow users to create accounts and securely log in.
- Store user and expense information in MongoDB.
- Provide an interactive financial dashboard.
- Display expenses using charts and visual analytics.
- Reduce the need for completely manual expense tracking.
- Integrate Gmail to identify transaction receipts in future development.

---

## ✨ Key Features

### 🔐 User Authentication

- User registration
- User login
- Password hashing using bcryptjs
- JWT-based authentication
- Protected user information

### 📊 Expense Dashboard

The dashboard provides an overview of the user's financial activity.

It includes:

- Total expenses
- Monthly budget
- Remaining budget
- Spending overview
- Expense categories
- Recent transactions

### 💳 Expense Management

Users will be able to:

- Add expenses
- View expenses
- Update expenses
- Delete expenses
- Categorize expenses
- Track transaction dates and amounts

### 📈 Expense Analytics

The application will provide visual representations of spending,
including:

- Monthly spending
- Category-wise expenses
- Spending trends

### 📧 Gmail Integration

A planned feature of SpendSense is Gmail integration.

The user will be able to connect their Gmail account through Google OAuth.
The system can then access relevant transaction/receipt emails through the
Gmail API and use the information to identify expenses.

> Gmail transaction extraction and automatic expense creation are planned
> features and are not fully implemented yet.

---

## 🛠️ Technologies Used

### Frontend

- React.js
- React Router
- Tailwind CSS
- Axios
- Recharts

### Backend

- Node.js
- Express.js
- JWT
- bcryptjs
- CORS
- dotenv

### Database

- MongoDB
- MongoDB Compass
- Mongoose

### Planned Integration

- Google OAuth
- Gmail API

---

## 🏗️ System Architecture

The application follows a client-server architecture.

```text
                    User
                     │
                     ▼
              React Frontend
                     │
                  Axios
                     │
                     ▼
             Express Backend
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
       Mongoose            Authentication
          │               JWT + bcryptjs
          │
          ▼
       MongoDB
          │
          ├── Users
          ├── Expenses
          └── Budgets

          Planned
             │
             ▼
       Google OAuth
             │
             ▼
         Gmail API
             │
             ▼
   Transaction Receipts