# 📚 LPU Library Management System

A full-stack **Library Management System** built with the **MERN Stack** (MongoDB, Express, React, Node.js) — inspired by LPU's central library portal.

🌐 **Live Demo:** [Coming Soon — Vercel]  
🔧 **Backend API:** https://lms-system-wvid.onrender.com/api/health

---

## ✨ Features

### 👨‍🎓 Student Portal
- Register & Login with Reg No + Password
- View recently added books
- Search books by title, author, ISBN, subject
- Browse full catalogue with filters (department, status)
- View issued books with due dates
- Renew books (up to 2 times)
- View reading history
- Check & track fines
- Access E-Resources (journals, e-books, databases)
- Update profile & change password
- Forgot password via email

### 🛠️ Admin / Librarian Panel
- Dashboard with live stats (total books, users, issues, fines)
- Add, edit, delete books
- Issue & return books for students
- Manage all users (create, edit, deactivate)
- View all issues with overdue tracking
- Fine management — mark fines as paid
- Post library notices
- Add/remove E-Resources

### ⚙️ System Features
- JWT Authentication with refresh tokens
- Role-based access (Student / Librarian / Admin)
- Automatic daily fine calculation via cron job (₹2/day)
- Email notifications on book issue
- Password reset via email link
- MongoDB Atlas cloud database
- Rate limiting & security headers

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| State | TanStack Query, Zustand |
| UI | Custom CSS, React Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (Access + Refresh tokens), bcryptjs |
| Email | Nodemailer |
| Cron | node-cron |
| Hosting | Render (backend), Vercel (frontend) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/ritikravi/lms-system.git
cd lms-system
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Fill in your MongoDB URI, JWT secrets, email credentials
npm install
npm run seed    # Seeds sample data
npm run dev     # Starts on port 5001
```

### 3. Setup Frontend
```bash
cd frontend
npm install
# Create .env file:
echo "VITE_API_URL=http://localhost:5001/api" > .env
npm run dev     # Starts on http://localhost:5173
```

---

## 🔐 Default Login Credentials (after seeding)

| Role | Reg No | Password |
|------|--------|----------|
| Admin | `ADMIN001` | `admin123` |
| Librarian | `LIB001` | `lib123` |
| Student | `12528517` | `student123` |
| Student | `12345678` | `student123` |

---

## 📁 Project Structure

```
lms-system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Auth, Books, Issues, Fines, Users...
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── middleware/       # JWT auth, role guard
│   │   └── utils/           # Email, cron jobs, seed script
│   └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Home.jsx
        │   ├── Catalogue.jsx
        │   ├── EResources.jsx
        │   ├── MyAccount.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminBooks.jsx
        │       ├── AdminUsers.jsx
        │       ├── AdminIssues.jsx
        │       ├── AdminFines.jsx
        │       └── AdminNotices.jsx
        ├── components/      # Navbar, Layout, AdminLayout, Footer
        ├── context/         # AuthContext
        └── utils/           # Axios API instance
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books (paginated) |
| GET | `/api/books/search?q=&field=` | Search books |
| GET | `/api/books/recent` | Recently added books |
| POST | `/api/books` | Add book (admin) |
| PUT | `/api/books/:id` | Update book (admin) |
| DELETE | `/api/books/:id` | Delete book (admin) |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues/my` | My issued books |
| POST | `/api/issues` | Issue book (admin) |
| PUT | `/api/issues/:id/return` | Return book (admin) |
| PUT | `/api/issues/:id/renew` | Renew book |

### Fines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fines/my` | My fines |
| GET | `/api/fines` | All fines (admin) |
| PUT | `/api/fines/:id/pay` | Mark fine paid (admin) |

---

## 🌍 Deployment

### Backend — Render.com
- Root Directory: `backend`
- Build: `npm install`
- Start: `node src/server.js`
- Add all env variables from `.env.example`

### Frontend — Vercel
- Root Directory: `lms-system/frontend`
- Framework: Vite
- Add env: `VITE_API_URL=https://your-render-url.onrender.com/api`

---

## 📸 Screenshots

| Login | Home | Admin Dashboard |
|-------|------|-----------------|
| ![Login](https://via.placeholder.com/300x200?text=Login) | ![Home](https://via.placeholder.com/300x200?text=Home) | ![Admin](https://via.placeholder.com/300x200?text=Admin) |

---

## 👨‍💻 Author

**Ritik Raushan**  
📧 ritikravi7724@gmail.com  
🔗 [GitHub](https://github.com/ritikravi)

---

## 📄 License

MIT License — free to use and modify.
