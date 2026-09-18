# 💸 SpendWise - Full-Stack Personal Expense & Income Management App

**SpendWise** is a production-style, full-stack personal finance application engineered for students and young professionals. It empowers users to track income and expenses, monitor spending trends with interactive visual charts, filter and search transactions, export financial records, and maintain budget health with JWT authentication and robust security.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- **User Registration & Login**: Secure account creation with email normalization and input validation.
- **Password Hashing**: Passwords are salted and hashed using `bcryptjs` before database persistence.
- **JWT Authentication**: Protected API endpoints requiring `Authorization: Bearer <token>` headers.
- **One-Click Demo Account**: Test all features with pre-populated transactions instantly.

### 📊 Expense & Income Management
- **Transaction Operations**: Add, Edit, Delete, Search, and Sort transaction records.
- **Transaction Details**: Title, Amount, Type (`income` / `expense`), Category, Date, Payment Method (`Card`, `Cash`, `UPI`, `Bank Transfer`), Description.
- **Categories**:
  - **Expense**: `Food`, `Travel`, `Education`, `Shopping`, `Bills`, `Entertainment`, `Other`
  - **Income**: `Salary`, `Freelance`, `Allowance`, `Savings`, `Investment`, `Other`

### 📈 Interactive Dashboard & Analytics
- **Financial Summary Metrics**: Total Income, Total Expenses, Current Net Balance, Monthly Spending, and Savings Rate %.
- **Category-wise Spending Breakdown**: Interactive Donut/Pie Chart powered by Recharts with percentage indicators and legend breakdown.
- **6-Month Trend Analysis**: Dual bar chart comparing monthly income vs expenses over time.
- **Recent Activity Feed**: Real-time listing of recent transactions with category icons.
- **Student & Young Pro Financial Insights**: Automated tips for savings health and subscription tracking.

### 🛠 Tools & Utilities
- **Search & Multi-Filter**: Filter transactions by category, type (Income/Expense), date range, or keyword search.
- **CSV Data Export**: Download transaction records directly into `.csv` format.
- **Dark & Light Mode**: Seamless theme toggle stored in browser preferences.
- **Automated MongoMemoryServer Fallback**: Boots out-of-the-box using in-memory MongoDB if no local MongoDB service is active.

---

## 🛠 Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Modern Vanilla CSS Design System, Recharts, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB), JWT (`jsonwebtoken`), `bcryptjs`, CORS, Dotenv |
| **Database** | MongoDB (with `mongodb-memory-server` automated fallback) |

---

## 📁 Project Structure

```
SpendWise/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection & memory fallback logic
│   │   ├── controllers/
│   │   │   ├── authController.js        # Registration, login, profile, demo seed
│   │   │   ├── transactionController.js # Transaction CRUD, search & filter
│   │   │   └── dashboardController.js   # Analytics & aggregated statistics
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT Bearer token protection
│   │   │   └── errorMiddleware.js      # Global error & 404 handler
│   │   ├── models/
│   │   │   ├── User.js                 # User schema & password hashing
│   │   │   └── Transaction.js          # Transaction schema & categories
│   │   ├── routes/
│   │   │   ├── authRoutes.js           # Auth endpoint router
│   │   │   ├── transactionRoutes.js    # Transaction endpoint router
│   │   │   └── dashboardRoutes.js      # Dashboard endpoint router
│   │   └── server.js                   # Express application entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/                   # Login & Registration modal
│   │   │   ├── Dashboard/              # Dashboard cards & Recharts
│   │   │   ├── Layout/                 # Navigation bar & theme switcher
│   │   │   └── Transactions/           # Transactions table, search & modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # React Auth & Theme Context
│   │   ├── services/
│   │   │   └── api.js                  # Axios HTTP client with interceptors
│   │   ├── styles/
│   │   │   └── index.css               # Design system & dark/light theme CSS
│   │   ├── App.jsx                     # Main application shell
│   │   └── main.jsx                    # React entrypoint
│   ├── package.json
│   └── vite.config.js
├── .env.example
└── README.md
```

---

## 📡 REST API Documentation

Base URL: `http://localhost:5000/api`

### 1. Authentication Endpoints

#### 🔑 Register User
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "Password123!",
  "currency": "$"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66e01a8b9f123456789abcde",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "currency": "$",
    "createdAt": "2026-09-13T10:00:00.000Z"
  }
}
```

#### 🔓 Login User
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```
- **Response (200 OK)**: Returns `token` and `user` profile object.

#### ⚡ Quick Demo Login
- **Endpoint**: `POST /api/auth/demo`
- **Access**: Public
- **Description**: Authenticates or seeds a demo user (`demo@spendwise.app`) populated with 11 realistic sample transactions across food, travel, books, salary, and entertainment.

#### 👤 Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Private (Requires `Authorization: Bearer <token>`)

---

### 2. Transaction Endpoints

#### 📋 Get Transactions (With Filters)
- **Endpoint**: `GET /api/transactions`
- **Access**: Private
- **Query Parameters**:
  - `search` (string): Search text in title or description.
  - `category` (string): Filter by specific category (e.g. `Food`, `Bills`, `Salary`).
  - `type` (string): `income` or `expense`.
  - `startDate` (ISO Date string): e.g. `2026-09-01`.
  - `endDate` (ISO Date string): e.g. `2026-09-30`.
  - `sortBy` (string): `date`, `amount`, `title` (Default: `date`).
  - `sortOrder` (string): `desc` or `asc` (Default: `desc`).
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 1,
  "totalCount": 1,
  "page": 1,
  "totalPages": 1,
  "transactions": [
    {
      "_id": "66e01b9a9f123456789abcdf",
      "user": "66e01a8b9f123456789abcde",
      "type": "expense",
      "title": "Grocery Supplies",
      "amount": 145.8,
      "category": "Food",
      "description": "Whole Foods organic items",
      "date": "2026-09-12T00:00:00.000Z",
      "paymentMethod": "Card"
    }
  ]
}
```

#### ➕ Create Transaction
- **Endpoint**: `POST /api/transactions`
- **Access**: Private
- **Request Body**:
```json
{
  "type": "expense",
  "title": "University Books",
  "amount": 89.5,
  "category": "Education",
  "date": "2026-09-10",
  "paymentMethod": "Card",
  "description": "Algorithms textbook"
}
```

#### ✏️ Update Transaction
- **Endpoint**: `PUT /api/transactions/:id`
- **Access**: Private

#### 🗑 Delete Transaction
- **Endpoint**: `DELETE /api/transactions/:id`
- **Access**: Private

#### 🏷 Get Categories List
- **Endpoint**: `GET /api/transactions/categories`
- **Access**: Private

---

### 3. Dashboard Endpoints

#### 📊 Get Dashboard Statistics & Analytics
- **Endpoint**: `GET /api/dashboard/stats`
- **Access**: Private
- **Response (200 OK)**:
```json
{
  "success": true,
  "stats": {
    "totalIncome": 3550.00,
    "totalExpenses": 482.18,
    "currentBalance": 3067.82,
    "monthlyIncome": 300.00,
    "monthlyExpenses": 348.79,
    "savingsRate": 86.4,
    "categoryWiseSpending": [
      { "category": "Food", "amount": 184.2, "percentage": 38.2, "color": "#FF6B6B" },
      { "category": "Shopping", "amount": 119.0, "percentage": 24.7, "color": "#96CEB4" }
    ],
    "monthlyTrends": [
      { "month": "Apr 26", "income": 2500, "expense": 1200 },
      { "month": "Sep 26", "income": 3550, "expense": 482.18 }
    ],
    "recentTransactions": [...]
  }
}
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `.env` file inside `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/spendwise
JWT_SECRET=spendwise_super_secret_jwt_key_2026_production
JWT_EXPIRE=30d
NODE_ENV=development
```

Create `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

**Backend Express Server**:
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Frontend React Vite App**:
```bash
cd frontend
npm run dev
# App opens on http://localhost:3000
```

---

## 🛡 Security Practices Implemented
- **Password Hashing**: `bcryptjs` genSalt(10) with pre-save Mongoose hook.
- **JWT Authorization**: Signed bearer tokens with expiry checks.
- **Data Sanitization**: Excludes sensitive password fields from JSON responses.
- **Query Scoping**: All transaction queries explicitly filter by `req.user.id`.
- **Input Validation**: Rejects invalid numbers, missing fields, or unauthorized modifications.
