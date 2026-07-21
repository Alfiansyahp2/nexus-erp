# Modern ERP System

A modern web-based Enterprise Resource Planning (ERP) system utilizing a *Modular Monolith* architecture. This project consists of a backend API built with Django REST Framework and a frontend interface built with React.js, Vite, and Ant Design.

## 🚀 Technologies Used
- **Backend:** Python, Django, Django REST Framework, PostgreSQL, JWT Authentication (Simple JWT)
- **Frontend:** React.js, Vite, React Router, Ant Design, Axios

## 🛠️ System Requirements
- Python 3.10+
- Node.js 18+ (and npm/yarn)
- PostgreSQL

## 📦 Local Setup & Installation

### 1. Backend Setup (Django)
1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a *Virtual Environment*:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies from `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the `.env.example` file to `.env` and configure your PostgreSQL database credentials:
   ```bash
   cp .env.example .env
   ```
5. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Create a superuser (Admin):
   ```bash
   python manage.py createsuperuser
   ```
7. Start the local server:
   ```bash
   python manage.py runserver
   ```
   The backend will be running at `http://localhost:8000`.

### 2. Frontend Setup (React + Vite)
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the *development server*:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`. The frontend is already integrated with the backend and secured with *Middleware* (Token Verification) running on initial load.

## 🔑 Features & Modules

### 👥 Phase 1: HR & Payroll (Completed)
- User Authentication & JWT.
- HR Master Data: Employees, Departments, and Positions (Full CRUD operations with icons).
- Attendance Management & Leave Requests (Employee Self-Service).
- Payroll Management.

### 💰 Phase 2: Finance & Accounting (Completed)
- Centralized Chart of Accounts.
- Journal Entries with double-entry accounting (Debit/Credit).
- Clean and centralized modal forms located in `components/modals/finance/`.

### 📦 Phase 3: Inventory & Warehouse (Completed)
- Modular setup of `inventory_module`.
- Inventory Master Data: Product Categories, Products, and Warehouses.
- Live tracking: Stock Balances and Stock Movements (Audit Trail).

### 🛡️ Phase 4: Role-Based Access Control (RBAC) (Completed)
- **Direct User-Level Permissions**: Administrators can configure specific permissions (e.g., `hr.employee.delete`) for each individual user via a centralized checklist UI, overriding rigid roles.
- **Template Autofill**: Roles (e.g., HR Manager) act as quick-fill templates when assigning permissions to a user.
- **Dynamic JWT Payload**: Custom JWT payload injecting user-specific permissions directly to the frontend.
- Backend API protection via `@require_permission` decorators.
- Frontend UI protection via `<Can access="slug">` wrapper component and dynamic Sidebar filtering.

### ⚙️ Phase 5: System Settings (In Progress)
- User Management Module: Dedicated UI for Super Admins to view all users and manage their individual permissions via an interactive modal with grouped checkboxes.
- **Clean Layouts**: Separation of `MainLayout`, `Sidebar`, and `AppHeader`.
- **Organized Pages**: All pages are grouped by module (e.g., `pages/hr/`, `pages/finance/`).
- **Progressive Blank Space**: Custom `BlankSpace.jsx` component to handle *404 Not Found* and *Under Construction* pages gracefully.

## 📄 Directory Structure
- `/backend` - Core system code (Django) following a *modular monolith* architecture (`hr_module`, `finance_module`, `inventory_module`).
- `/frontend` - Interface code (Vite + React) with a centralized modular component architecture.
- `PRD.md` - Product Requirements Document (System vision and details).

---
*This project is developed iteratively (agile) to ensure a clean git history and proper release management.*
