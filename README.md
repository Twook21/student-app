🧩 A. URS (User Requirement Specification)
1. Deskripsi Singkat

Sistem ini merupakan aplikasi web pencatatan poin siswa yang digunakan untuk mencatat pelanggaran dan prestasi siswa. Sistem memungkinkan guru untuk menambahkan poin, guru BK untuk melakukan verifikasi/approval, serta siswa dan orang tua untuk melihat dan memberikan klarifikasi atas data pelanggaran.

2. Tujuan

Meningkatkan efisiensi pencatatan poin siswa secara digital.

Menyediakan sistem transparan dan terintegrasi antara guru, siswa, dan orang tua.

Mempermudah proses pengawasan, pembinaan, serta rekapitulasi data pelanggaran dan prestasi.

3. Pengguna Sistem dan Hak Akses
Role	Deskripsi	Hak Akses
Super Admin	Pengelola utama sistem	Kelola data user, hak akses, master data (jenis pelanggaran & prestasi), dan laporan keseluruhan
Guru BK	Bertugas mengelola dan meng-approve poin pelanggaran/prestasi	Melihat semua data siswa, approve/reject poin, kelola kategori pelanggaran, cetak laporan
Wali Kelas	Memantau siswa di kelasnya	Input poin pelanggaran/prestasi, melihat hasil approval
Guru Mapel	Menambahkan poin prestasi siswa	Input prestasi, lihat status approval
Siswa	Subjek poin pelanggaran/prestasi	Melihat riwayat poin, melakukan appeal/alasan atas pelanggaran
Orang Tua	Orang tua siswa	Melihat poin anak (pelanggaran & prestasi) tanpa bisa mengedit
4. Fungsi Utama (Functional Requirements)
🔐 Modul Autentikasi

Login & Logout (berdasarkan role)

Register (khusus oleh admin)

Reset password (via email atau manual oleh admin)

👥 Modul Manajemen User

CRUD data pengguna (Super Admin)

Assign role (Guru BK, Wali Kelas, dll)

Mapping siswa dengan orang tua dan wali kelas

🧑‍🏫 Modul Siswa

CRUD data siswa (Super Admin, Guru BK)

Detail profil siswa

Riwayat poin pelanggaran & prestasi

Fitur appeal (banding) untuk pelanggaran

📚 Modul Poin Pelanggaran

Input pelanggaran oleh Wali Kelas / Guru BK

Status pelanggaran: Menunggu Approval, Disetujui, Ditolak

Guru BK dapat memberikan catatan dan menentukan poin akhir

Notifikasi otomatis ke siswa & orang tua setelah status berubah

🏆 Modul Poin Prestasi

Input prestasi oleh Guru Mapel / Wali Kelas

Approval oleh Guru BK

Penentuan poin prestasi berdasarkan kategori

📑 Modul Kategori & Master Data

Kategori pelanggaran (ringan, sedang, berat)

Kategori prestasi (akademik, non-akademik)

Skor poin per kategori

📊 Modul Laporan & Dashboard

Dashboard rekap poin (per siswa, per kelas, per kategori)

Statistik pelanggaran & prestasi

Export laporan ke PDF / Excel

Ranking siswa berdasarkan poin prestasi

📨 Modul Notifikasi

Notifikasi internal (ke siswa, orang tua, guru)

Notifikasi email (opsional)

Log aktivitas untuk audit

5. Non-Functional Requirements

Keamanan: JWT Authentication, password hashed (bcrypt)

Database: PostgreSQL

Frontend Framework: Next.js (React)

ORM: Prisma

UI Framework: Tailwind CSS / shadcn/ui

Responsif: Mobile-friendly

Performansi: Query efisien dan cache data dashboard

Audit Trail: Setiap perubahan data penting tercatat

⚙️ B. Spesifikasi Aplikasi
1. Teknologi yang Digunakan
Kebutuhan	Teknologi
Frontend	Next.js, Tailwind CSS, Zustand/Redux (state), Axios/Fetch API
Backend	Next.js API Routes (server actions)
ORM	Prisma
Database	PostgreSQL
Auth	NextAuth (JWT strategy)
Deployment	Vercel / Railway / Supabase
File Storage (opsional)	Cloudinary / Supabase Storage
2. Struktur Modul Utama
src/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── siswa/
│   ├── guru/
│   ├── bk/
│   ├── orangtua/
│   ├── admin/
│   └── api/
│       ├── users/
│       ├── siswa/
│       ├── pelanggaran/
│       ├── prestasi/
│       └── kategori/
├── components/
├── prisma/
│   └── schema.prisma
└── utils/

3. Desain Database (Ringkasan Entitas Utama)
Tabel: User
Kolom	Tipe	Keterangan
id	UUID	Primary key
name	String	Nama pengguna
email	String	Unik
password	String	Password hashed
role	Enum (ADMIN, BK, WALIKELAS, GURUMAPEL, SISWA, ORANGTUA)	Hak akses
createdAt	DateTime	Tanggal dibuat
Tabel: Siswa
Kolom	Tipe	Keterangan
id	UUID	Primary key
nama	String	Nama siswa
kelas	String	Kelas
orangTuaId	UUID (FK User)	Relasi ke user orang tua
waliKelasId	UUID (FK User)	Relasi ke guru wali kelas
totalPoin	Int	Akumulasi poin (prestasi - pelanggaran)
Tabel: Pelanggaran
Kolom	Tipe	Keterangan
id	UUID	Primary key
siswaId	UUID (FK)	Siswa terkait
guruId	UUID (FK)	Guru yang input
kategoriId	UUID (FK)	Jenis pelanggaran
deskripsi	Text	Detail pelanggaran
poin	Int	Nilai poin
status	Enum(MENUNGGU, DISETUJUI, DITOLAK)	Status approval BK
alasanSiswa	Text	Alasan banding (appeal)
catatanBK	Text	Catatan dari BK
tanggal	DateTime	Tanggal input
Tabel: Prestasi

Strukturnya mirip tabel Pelanggaran, hanya beda konteks dan jenis kategori.

Tabel: Kategori
Kolom	Tipe	Keterangan
id	UUID	Primary key
nama	String	Nama kategori
tipe	Enum(PELANGGARAN, PRESTASI)	Jenis kategori
poinDefault	Int	Nilai default poin
4. Integrasi & Alur Sistem

Flow Utama: Pelanggaran

Wali Kelas/Guru input pelanggaran → status: MENUNGGU

Guru BK review → DISETUJUI atau DITOLAK

Siswa bisa ajukan appeal → BK bisa update keputusan

Orang tua dapat melihat hasil akhir

Flow Utama: Prestasi

Guru Mapel/Wali Kelas input prestasi

BK approve

Siswa dan orang tua dapat melihat poin prestasi

5. Modul UI yang Dibutuhkan
Modul	Fitur
Login/Register	Autentikasi berdasarkan role
Dashboard	Ringkasan poin, status approval
Data Siswa	CRUD, detail siswa, riwayat poin
Data Guru	CRUD, role assignment
Input Pelanggaran/Prestasi	Form input, validasi, status
Approval BK	List data menunggu, detail, approve/reject
Appeal Siswa	Form alasan banding
Laporan	Filter, cetak, export
Profil User	Ubah profil & password
Notifikasi	Daftar notifikasi sistem