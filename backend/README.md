# Backend - Modern ERP System

This directory contains the backend code for the ERP system, built using **Python, Django, and Django REST Framework**.

## 🏗️ Architecture: Modular Monolith
This backend does not use a standard Django app structure that mixes all features into one or two folders. Instead, it strictly implements the **Modular Monolith** concept.

This means every business domain (HR, Finance, Inventory) is isolated into its own independent Django App. This makes it easier for developers to manage the codebase and significantly simplifies future transitions into *Microservices* if needed.

### Core Directory Structure
- **`/core`**: This is the "brain" or the main orchestrator of the project. It contains the `settings.py` (global configuration) and `urls.py` (root routing). Other modules are registered here.
- **`/hr_module`**: Human Resources module. Handles Employee Authentication, Departments, Positions, Attendance, and Payroll.
- **`/finance_module`**: Finance module. Handles Chart of Accounts and Journal Entries.
- **`/inventory_module`**: Inventory and Warehouse Management module. Handles product master data, warehouse locations, and stock movements.
- **`/rbac`**: Role-Based Access Control module. Handles dynamic roles, granular permissions (slugs), user-role assignments, and custom JWT payload injection.

### Inside Each Module
Every module (e.g., `hr_module`) follows a standard structure:
- `models.py`: Database table definitions.
- `serializers.py`: Data transformers mapping Models to JSON (for the API).
- `views.py`: Business logic and API endpoints (ViewSets).
- `urls.py`: Specific API routing registration for the module.

## 🔐 Authentication
This application uses **JWT (JSON Web Token)** via the `rest_framework_simplejwt` library.
- Login Endpoint: `/api/token/`
- Refresh Endpoint: `/api/token/refresh/`
- Verify Endpoint: `/api/token/verify/`

Every request from the frontend must include `Authorization: Bearer <access_token>` in its Header.
Additionally, endpoints are protected using the `@require_permission('slug')` decorator to enforce strict Role-Based Access Control based on dynamic permissions stored in the database.

## 🛠️ Useful Commands (Development)

Ensure your *Virtual Environment* is activated (`.\venv\Scripts\activate`) before running the following commands:

1. **Create Table Migrations (After modifying `models.py`)**
   ```bash
   python manage.py makemigrations
   ```
2. **Apply Migrations to Database (Save tables)**
   ```bash
   python manage.py migrate
   ```
3. **Run the Local Server**
   ```bash
   python manage.py runserver
   ```
4. **Create a Superuser (Admin access)**
   ```bash
   python manage.py createsuperuser
   ```
