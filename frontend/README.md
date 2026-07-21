# Frontend - Modern ERP System

This directory contains the frontend (User Interface) code for the ERP system, built using **React.js, Vite, and Ant Design**.

## 🚀 Architecture & Folder Structure
This project prioritizes cleanliness (Clean Code & Separation of Concerns) by grouping files based on their functionality:

- **`/src/api/`**: Contains the Axios configuration (`axiosConfig.js`). This is where the JWT token from *localStorage* is injected into the *Authorization Header*. It also includes an "Interceptor" system that automatically attempts to refresh the token if your session expires.
- **`/src/layouts/`**: Contains the foundational layout frameworks of the application:
  - `MainLayout.jsx`: The main wrapper container for pages.
  - `Sidebar.jsx`: The left navigation menu.
  - `AppHeader.jsx`: The top menu (includes the profile/logout button).
- **`/src/pages/`**: UI pages divided by modules (matching the Backend separation):
  - `/hr`: HR-related pages (Employees, Leave Requests, Payroll).
  - `/finance`: Finance-related pages (Accounts, Journals).
  - `/settings`: System settings including `UserManagement.jsx` (List of users and their exact permissions).
  - *Note: Components in this folder are solely responsible for rendering tables (Data Grids) and trigger buttons. Input forms are placed in separate components.*
- **`/src/components/modals/`**: A centralized collection of Pop-ups / Modal Forms.
  - All Create/Update forms (e.g., Add Employee, Add Account) are **not written directly inside the page tables**, but are centralized here (`/hr` and `/finance`) to make them highly readable for AI and highly reusable.
- **`/src/components/BlankSpace.jsx`**: A dynamic component that renders an interactive illustration when data is empty, a feature is not ready (info state), or a page is not found (404).
- **`/src/components/Can.jsx`**: A wrapper component to conditionally render UI elements based on user permissions.

## 🔐 Session Security & RBAC
Inside `App.jsx`, there is a `<ProtectedRoute>` component.
Unlike a simple React setup that merely checks for the existence of a token string, this ERP performs a direct "Handshake Verification" with the Backend (`/api/token/verify/`) every time the application is refreshed or opened. If the session is invalid or expired, the application automatically clears the dirty cache and redirects the user to `/login`.

Additionally, the UI implements **Direct User-Level Access Control (RBAC)**:
- Permissions are assigned directly to individual users (bypassing rigid roles).
- The JWT token payload is decoded using `jwt-decode` to extract the user's specific permission list.
- Action buttons (Add, Edit, Delete) are wrapped in `<Can access="slug">` to hide them from unauthorized users.
- The `Sidebar.jsx` dynamically filters navigation menus so users only see modules they have access to.
- A dedicated **User Management UI** (`/settings/users`) allows Super Admins to easily assign permissions using template dropdowns and granular grouped checkboxes.

## 🛠️ Useful Commands (Development)

1. **Install Packages (Run once initially or when new libraries are added)**
   ```bash
   npm install
   ```
2. **Start the Development Server (Vite)**
   ```bash
   npm run dev
   ```
   The application will be accessible locally at `http://localhost:5173`.
3. **Build the Application for Production**
   ```bash
   npm run build
   ```
