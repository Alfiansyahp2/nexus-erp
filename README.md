# Modern ERP System

Sistem Enterprise Resource Planning (ERP) berbasis web modern dengan arsitektur *Modular Monolith*. Proyek ini terdiri dari backend API yang dibangun menggunakan Django REST Framework dan frontend antarmuka yang dibangun dengan React.js, Vite, dan Ant Design.

## 🚀 Teknologi yang Digunakan
- **Backend:** Python, Django, Django REST Framework, PostgreSQL, JWT Authentication (Simple JWT)
- **Frontend:** React.js, Vite, React Router, Ant Design, Axios

## 🛠️ Persyaratan Sistem
- Python 3.10+
- Node.js 18+ (dan npm/yarn)
- PostgreSQL

## 📦 Setup & Instalasi Lokal

### 1. Setup Backend (Django)
1. Buka terminal dan masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Buat dan aktifkan *Virtual Environment*:
   ```bash
   python -m venv venv
   # Di Windows:
   .\venv\Scripts\activate
   # Di macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependensi dari `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```
4. Salin file `.env.example` menjadi `.env` lalu sesuaikan konfigurasi *Database* PostgreSQL Anda:
   ```bash
   cp .env.example .env
   ```
5. Jalankan migrasi *database*:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Buat superuser (Admin Utama):
   ```bash
   python manage.py createsuperuser
   ```
7. Jalankan server lokal:
   ```bash
   python manage.py runserver
   ```
   Backend akan berjalan di `http://localhost:8000`.

### 2. Setup Frontend (React + Vite)
1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependensi Node:
   ```bash
   npm install
   ```
3. Jalankan *development server*:
   ```bash
   npm run dev
   ```
4. Buka browser dan akses `http://localhost:5173`. Frontend sudah terintegrasi dan siap mengakses backend API.

## 🔑 Fitur Tersedia (Fase 1 Selesai)
- **Modul HR:** Autentikasi Pengguna dengan JWT, Manajemen User Custom, Departemen, Jabatan, dan Profil Karyawan terpusat.
- **Employee Self-Service (ESS):** Check-in/Check-out kehadiran harian dan form pengajuan cuti secara *real-time*.
- **Manajemen Penggajian (Payroll):** Model tunjangan/potongan pajak serta kalkulasi gaji bersih *Take Home Pay*.
- **Layout Frontend:** Tata letak *sidebar* responsif menggunakan Ant Design dengan halaman modern.

## 📄 Struktur Direktori
- `/backend` - Kode utama sistem (Django) dengan arsitektur *modular monolith* (seperti `hr_module`).
- `/frontend` - Kode antarmuka (Vite + React) terstruktur menggunakan sub-direktori seperti `pages`, `layouts`, dan `components`.
- `PRD.md` - Product Requirements Document (Dokumen visi dan detail kebutuhan sistem).

---
*Proyek ini dikembangkan secara bertahap (agile) untuk memastikan kualitas riwayat git dan manajemen rilis.*
