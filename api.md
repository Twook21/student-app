⚙️ SPESIFIKASI API ENDPOINT

Semua endpoint berada di bawah prefix:
/api

Setiap request dikirim dalam format JSON, dan setiap endpoint (kecuali login/register) menggunakan Bearer Token (JWT) untuk autentikasi.

🔐 1. AUTH MODULE
POST /api/auth/register

Deskripsi:
Mendaftarkan user baru (oleh Super Admin).

Body:

{
  "name": "Akmal Bintang",
  "email": "akmal@example.com",
  "password": "12345678",
  "role": "WALIKELAS"
}


Response:

{
  "message": "User registered successfully",
  "user": { "id": "uuid", "email": "akmal@example.com", "role": "WALIKELAS" }
}

POST /api/auth/login

Deskripsi:
Login untuk semua role.

Body:

{
  "email": "akmal@example.com",
  "password": "12345678"
}


Response:

{
  "token": "JWT_TOKEN",
  "user": {
    "id": "uuid",
    "name": "Akmal Bintang",
    "role": "WALIKELAS"
  }
}

POST /api/auth/logout

Deskripsi:
Logout user (menghapus sesi token).

Header:
Authorization: Bearer <token>

Response:

{ "message": "Logout successful" }

👥 2. USER MODULE
GET /api/users

Deskripsi:
Mengambil semua user (khusus Super Admin & BK).

Response:

[
  { "id": "uuid", "name": "Guru A", "role": "WALIKELAS", "email": "guru@example.com" }
]

GET /api/users/:id

Deskripsi:
Detail data user berdasarkan ID.

Response:

{
  "id": "uuid",
  "name": "Guru A",
  "email": "guru@example.com",
  "role": "WALIKELAS"
}

PUT /api/users/:id

Deskripsi:
Update data user.

Body:

{
  "name": "Guru Akmal",
  "role": "BK"
}


Response:

{ "message": "User updated successfully" }

DELETE /api/users/:id

Deskripsi:
Hapus user (Super Admin only).

🎓 3. SISWA MODULE
GET /api/siswa

Deskripsi:
Mengambil semua data siswa (BK, Wali Kelas, Admin).

Query (opsional):
?kelas=XI-RPL-1

Response:

[
  {
    "id": "uuid",
    "nama": "Budi Santoso",
    "kelas": "XI-RPL-1",
    "totalPoin": 45,
    "waliKelas": { "name": "Guru Akmal" },
    "orangTua": { "name": "Ibu Budi" }
  }
]

GET /api/siswa/:id

Deskripsi:
Detail siswa beserta riwayat pelanggaran dan prestasi.

Response:

{
  "id": "uuid",
  "nama": "Budi Santoso",
  "kelas": "XI-RPL-1",
  "totalPoin": 45,
  "pelanggaran": [...],
  "prestasi": [...]
}

POST /api/siswa

Deskripsi:
Menambahkan siswa baru.

Body:

{
  "nama": "Budi Santoso",
  "kelas": "XI-RPL-1",
  "orangTuaId": "uuid_orangtua",
  "waliKelasId": "uuid_walikelas"
}

PUT /api/siswa/:id

Deskripsi:
Mengubah data siswa.

DELETE /api/siswa/:id

Deskripsi:
Menghapus data siswa.

⚠️ 4. PELANGGARAN MODULE
GET /api/pelanggaran

Deskripsi:
Menampilkan semua pelanggaran (BK dapat melihat semua, wali kelas hanya kelasnya).

Response:

[
  {
    "id": "uuid",
    "siswa": { "nama": "Budi Santoso" },
    "guru": { "nama": "Guru Wali Kelas" },
    "deskripsi": "Datang terlambat",
    "poin": 10,
    "status": "MENUNGGU",
    "tanggal": "2025-10-24"
  }
]

POST /api/pelanggaran

Deskripsi:
Input pelanggaran oleh Wali Kelas/Guru.

Body:

{
  "siswaId": "uuid_siswa",
  "guruId": "uuid_guru",
  "kategoriId": "uuid_kategori",
  "deskripsi": "Datang terlambat",
  "poin": 10
}


Response:

{ "message": "Pelanggaran submitted, waiting for BK approval" }

PUT /api/pelanggaran/:id/approve

Deskripsi:
Guru BK menyetujui atau menolak pelanggaran.

Body:

{
  "status": "DISETUJUI",
  "catatanBK": "Dikonfirmasi oleh BK"
}

PUT /api/pelanggaran/:id/appeal

Deskripsi:
Siswa mengajukan banding (appeal).

Body:

{
  "alasanSiswa": "Saya telat karena ban motor bocor"
}

DELETE /api/pelanggaran/:id

Deskripsi:
Menghapus pelanggaran (BK/Admin only).

🏅 5. PRESTASI MODULE
GET /api/prestasi

Deskripsi:
Menampilkan daftar prestasi siswa.

POST /api/prestasi

Deskripsi:
Input prestasi oleh guru mapel atau wali kelas.

Body:

{
  "siswaId": "uuid_siswa",
  "guruId": "uuid_guru",
  "kategoriId": "uuid_kategori",
  "deskripsi": "Juara 1 Lomba Web Design",
  "poin": 15
}

PUT /api/prestasi/:id/approve

Deskripsi:
Guru BK menyetujui prestasi.

Body:

{ "status": "DISETUJUI" }

🗂️ 6. KATEGORI MODULE
GET /api/kategori

Deskripsi:
Mengambil semua kategori pelanggaran dan prestasi.

POST /api/kategori

Deskripsi:
Menambahkan kategori baru.

Body:

{
  "nama": "Datang Terlambat",
  "tipe": "PELANGGARAN",
  "poinDefault": 10
}

PUT /api/kategori/:id

Deskripsi:
Mengubah kategori.

DELETE /api/kategori/:id

Deskripsi:
Menghapus kategori.

📊 7. LAPORAN MODULE
GET /api/laporan/rekap

Deskripsi:
Rekap poin per siswa (BK dan Admin).

Query Example:
/api/laporan/rekap?kelas=XI-RPL-1&period=2025-10

Response:

[
  {
    "siswa": "Budi Santoso",
    "kelas": "XI-RPL-1",
    "pelanggaran": 3,
    "prestasi": 2,
    "totalPoin": 45
  }
]

GET /api/laporan/detail/:id

Deskripsi:
Detail laporan siswa (riwayat pelanggaran dan prestasi lengkap).

🔔 8. NOTIFIKASI MODULE
GET /api/notifikasi

Deskripsi:
Menampilkan notifikasi untuk user login.

POST /api/notifikasi

Deskripsi:
Membuat notifikasi (misal setelah approval BK).

🧠 Alur Approval API (Pelanggaran & Prestasi)

Wali Kelas / Guru Mapel → POST /api/pelanggaran atau POST /api/prestasi

Status Awal: "MENUNGGU"

Guru BK → PUT /api/pelanggaran/:id/approve atau PUT /api/prestasi/:id/approve

Siswa bisa kirim banding → PUT /api/pelanggaran/:id/appeal

Orang Tua hanya bisa GET /api/siswa/:id untuk melihat hasil