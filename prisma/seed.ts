const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  // ====================================================================
  // --- CLEAR EXISTING DATA (optional - uncomment if needed) ---
  // ====================================================================
  
  await prisma.activityLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.pointRecord.deleteMany()
  await prisma.pointCategory.deleteMany()
  await prisma.parentStudent.deleteMany()
  await prisma.parent.deleteMany()
  await prisma.student.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.class.deleteMany()
  await prisma.userRole.deleteMany()
  await prisma.role.deleteMany()
  await prisma.user.deleteMany()

  // ====================================================================
  // --- CREATE ROLES ---
  // ====================================================================
  
  const roles = await Promise.all([
    prisma.role.create({
      data: { name: 'ADMIN' }
    }),
    prisma.role.create({
      data: { name: 'GURU' }
    }),
    prisma.role.create({
      data: { name: 'WALIKELAS' }
    }),
    prisma.role.create({
      data: { name: 'SISWA' }
    }),
    prisma.role.create({
      data: { name: 'ORANGTUA' }
    })
  ])

  console.log('✅ Roles created')

  // ====================================================================
  // --- CREATE ADMIN USER ---
  // ====================================================================
  
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@sekolah.com',
      password: hashedPassword,
      status: 'ACTIVE'
    }
  })

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: roles.find(r => r.name === 'ADMIN').id
    }
  })

  console.log('✅ Admin user created')

  // ====================================================================
  // --- CREATE CLASSES ---
  // ====================================================================
  
  const classNames = [
    'X IPA 1', 'X IPA 2', 'X IPA 3', 'X IPS 1', 'X IPS 2',
    'XI IPA 1', 'XI IPA 2', 'XI IPA 3', 'XI IPS 1', 'XI IPS 2',
    'XII IPA 1', 'XII IPA 2', 'XII IPA 3', 'XII IPS 1', 'XII IPS 2'
  ]

  const classes = await Promise.all(
    classNames.map(name => 
      prisma.class.create({
        data: { name }
      })
    )
  )

  console.log('✅ Classes created')

  // ====================================================================
  // --- CREATE TEACHERS ---
  // ====================================================================
  
  const teacherData = [
    { name: 'Drs. Ahmad Wijaya, S.Pd', nip: '196501011990031001', email: 'ahmad.wijaya@sekolah.com', isHomeroom: true },
    { name: 'Siti Nurhaliza, S.Pd', nip: '197203051995122001', email: 'siti.nurhaliza@sekolah.com', isHomeroom: true },
    { name: 'Budi Santoso, M.Pd', nip: '198505102010011001', email: 'budi.santoso@sekolah.com', isHomeroom: true },
    { name: 'Dr. Maya Sari, S.Si', nip: '197812151999032001', email: 'maya.sari@sekolah.com', isHomeroom: true },
    { name: 'Andi Pratama, S.Kom', nip: '199001202015041001', email: 'andi.pratama@sekolah.com', isHomeroom: true },
    { name: 'Rina Kusuma, S.Pd', nip: '198207081999032002', email: 'rina.kusuma@sekolah.com', isHomeroom: false },
    { name: 'Hendra Gunawan, M.Sc', nip: '197505252000011001', email: 'hendra.gunawan@sekolah.com', isHomeroom: false },
    { name: 'Lisa Fitria, S.S', nip: '199203102017012001', email: 'lisa.fitria@sekolah.com', isHomeroom: false },
    { name: 'Dedi Kurniawan, S.Pd', nip: '198908152012011002', email: 'dedi.kurniawan@sekolah.com', isHomeroom: false },
    { name: 'Ratna Dewi, M.Pd', nip: '197611201998032001', email: 'ratna.dewi@sekolah.com', isHomeroom: false }
  ]

  const teachers = []
  
  for (let i = 0; i < teacherData.length; i++) {
    const teacher = teacherData[i]
    const teacherUser = await prisma.user.create({
      data: {
        email: teacher.email,
        password: await bcrypt.hash('guru123', 10),
        status: 'ACTIVE'
      }
    })

    const teacherRecord = await prisma.teacher.create({
      data: {
        nip: teacher.nip,
        name: teacher.name,
        isHomeroom: teacher.isHomeroom,
        userId: teacherUser.id,
        homeroomClassId: teacher.isHomeroom && i < classes.length ? classes[i].id : null
      }
    })

    await prisma.userRole.create({
      data: {
        userId: teacherUser.id,
        roleId: roles.find(r => r.name === 'GURU').id
      }
    })

    if (teacher.isHomeroom) {
      await prisma.userRole.create({
        data: {
          userId: teacherUser.id,
          roleId: roles.find(r => r.name === 'WALIKELAS').id
        }
      })
    }

    teachers.push({ user: teacherUser, teacher: teacherRecord })
  }

  console.log('✅ Teachers created')

  // ====================================================================
  // --- CREATE STUDENTS ---
  // ====================================================================
  
  const firstNames = ['Ahmad', 'Siti', 'Budi', 'Rina', 'Andi', 'Maya', 'Dedi', 'Lisa', 'Hendra', 'Ratna', 'Fajar', 'Dewi', 'Agus', 'Indira', 'Rudi', 'Sari', 'Bayu', 'Nur', 'Joko', 'Fitri']
  const lastNames = ['Wijaya', 'Santoso', 'Pratama', 'Sari', 'Kusuma', 'Gunawan', 'Fitria', 'Kurniawan', 'Dewi', 'Rahman', 'Putri', 'Hakim', 'Sartono', 'Lestari', 'Hidayat', 'Marlina', 'Setiawan', 'Anggraini', 'Prabowo', 'Wulandari']

  const students = []
  let nisnCounter = 2024001

  for (let classIndex = 0; classIndex < classes.length; classIndex++) {
    const studentsPerClass = 32 // Rata-rata 32 siswa per kelas
    
    for (let studentIndex = 0; studentIndex < studentsPerClass; studentIndex++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const fullName = `${firstName} ${lastName}`
      const nisn = nisnCounter.toString().padStart(10, '0')
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${nisnCounter}@siswa.sekolah.com`
      
      const studentUser = await prisma.user.create({
        data: {
          email,
          password: await bcrypt.hash('siswa123', 10),
          status: 'ACTIVE'
        }
      })

      const studentRecord = await prisma.student.create({
        data: {
          nisn,
          name: fullName,
          totalPoint: Math.floor(Math.random() * 200) - 50, // Random points between -50 to 150
          classId: classes[classIndex].id,
          userId: studentUser.id
        }
      })

      await prisma.userRole.create({
        data: {
          userId: studentUser.id,
          roleId: roles.find(r => r.name === 'SISWA').id
        }
      })

      students.push({ user: studentUser, student: studentRecord })
      nisnCounter++
    }
  }

  console.log('✅ Students created')

  // ====================================================================
  // --- CREATE PARENTS ---
  // ====================================================================
  
  const parents = []
  
  // Buat orang tua untuk sebagian siswa (tidak semua siswa memiliki akun orang tua)
  for (let i = 0; i < students.length; i += 3) { // Setiap 3 siswa, buat 1 orang tua
    const student = students[i]
    const parentName = `Orang Tua ${student.student.name.split(' ')[1]}`
    // Tambahkan unique identifier untuk menghindari email duplikat
    const email = `orangtua.${student.student.name.toLowerCase().replace(/\s+/g, '.')}.${i}@parent.sekolah.com`
    
    try {
      const parentUser = await prisma.user.create({
        data: {
          email,
          password: await bcrypt.hash('parent123', 10),
          status: 'ACTIVE'
        }
      })

      const parentRecord = await prisma.parent.create({
        data: {
          name: parentName,
          userId: parentUser.id
        }
      })

      await prisma.userRole.create({
        data: {
          userId: parentUser.id,
          roleId: roles.find(r => r.name === 'ORANGTUA').id
        }
      })

      // Hubungkan dengan 1-3 siswa (simulasi keluarga)
      const childCount = Math.min(3, Math.ceil(Math.random() * 2) + 1)
      for (let j = 0; j < childCount && (i + j) < students.length; j++) {
        await prisma.parentStudent.create({
          data: {
            parentId: parentRecord.id,
            studentId: students[i + j].student.id
          }
        })
      }

      parents.push({ user: parentUser, parent: parentRecord })
    } catch (error) {
      console.log(`⚠️  Skipping parent creation for ${parentName} due to duplicate email`)
      continue
    }
  }

  console.log('✅ Parents created')

  // ====================================================================
  // --- CREATE POINT CATEGORIES ---
  // ====================================================================
  
  const achievementCategories = [
    { name: 'Juara 1 Olimpiade Matematika', description: 'Meraih juara 1 dalam olimpiade matematika tingkat sekolah', pointValue: 50, isAchievement: true },
    { name: 'Juara 2 Olimpiade Fisika', description: 'Meraih juara 2 dalam olimpiade fisika tingkat sekolah', pointValue: 40, isAchievement: true },
    { name: 'Juara 3 Lomba Karya Tulis', description: 'Meraih juara 3 dalam lomba karya tulis ilmiah', pointValue: 30, isAchievement: true },
    { name: 'Aktif dalam Kegiatan Ekstrakurikuler', description: 'Aktif mengikuti kegiatan ekstrakurikuler minimal 6 bulan', pointValue: 25, isAchievement: true },
    { name: 'Membantu Guru', description: 'Aktif membantu guru dalam kegiatan pembelajaran', pointValue: 15, isAchievement: true },
    { name: 'Prestasi Olahraga', description: 'Meraih prestasi dalam bidang olahraga', pointValue: 35, isAchievement: true },
    { name: 'Siswa Teladan Bulan Ini', description: 'Terpilih sebagai siswa teladan bulan ini', pointValue: 20, isAchievement: true },
    { name: 'Ketua OSIS/MPK', description: 'Menjabat sebagai ketua OSIS atau MPK', pointValue: 45, isAchievement: true }
  ]

  const violationCategories = [
    { name: 'Terlambat Masuk Sekolah', description: 'Datang terlambat ke sekolah', pointValue: -5, isAchievement: false },
    { name: 'Tidak Mengerjakan PR', description: 'Tidak mengerjakan pekerjaan rumah yang diberikan', pointValue: -10, isAchievement: false },
    { name: 'Tidak Memakai Seragam Lengkap', description: 'Tidak memakai seragam sekolah dengan lengkap dan rapi', pointValue: -8, isAchievement: false },
    { name: 'Ribut di Kelas', description: 'Membuat keributan selama proses pembelajaran', pointValue: -15, isAchievement: false },
    { name: 'Tidak Masuk Tanpa Keterangan', description: 'Tidak hadir ke sekolah tanpa keterangan yang jelas', pointValue: -20, isAchievement: false },
    { name: 'Merokok di Area Sekolah', description: 'Kedapatan merokok di dalam lingkungan sekolah', pointValue: -50, isAchievement: false },
    { name: 'Berkelahi', description: 'Terlibat perkelahian dengan siswa lain', pointValue: -40, isAchievement: false },
    { name: 'Merusak Fasilitas Sekolah', description: 'Merusak atau menghilangkan fasilitas milik sekolah', pointValue: -35, isAchievement: false },
    { name: 'Tidak Sopan kepada Guru', description: 'Bersikap tidak sopan atau kurang ajar kepada guru', pointValue: -30, isAchievement: false },
    { name: 'Tidur di Kelas', description: 'Tidur selama proses pembelajaran berlangsung', pointValue: -12, isAchievement: false }
  ]

  const pointCategories = await Promise.all([
    ...achievementCategories.map(cat => 
      prisma.pointCategory.create({ data: cat })
    ),
    ...violationCategories.map(cat => 
      prisma.pointCategory.create({ data: cat })
    )
  ])

  console.log('✅ Point categories created')

  // ====================================================================
  // --- CREATE POINT RECORDS ---
  // ====================================================================
  
  const pointRecords = []
  
  // Buat banyak point records untuk simulasi aktivitas
  for (let i = 0; i < 500; i++) {
    const randomStudent = students[Math.floor(Math.random() * students.length)]
    const randomCategory = pointCategories[Math.floor(Math.random() * pointCategories.length)]
    const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)]
    
    // Tanggal random dalam 3 bulan terakhir
    const randomDate = new Date()
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 90))
    
    const notes = [
      'Catatan dari wali kelas',
      'Dilihat langsung oleh guru piket',
      'Laporan dari guru mata pelajaran',
      'Hasil pengamatan selama pembelajaran',
      'Berdasarkan kegiatan ekstrakurikuler',
      'Prestasi yang membanggakan',
      'Perlu pembinaan lebih lanjut',
      'Sikap yang perlu diperbaiki'
    ]

    const pointRecord = await prisma.pointRecord.create({
      data: {
        studentId: randomStudent.student.id,
        pointCategoryId: randomCategory.id,
        inputtedById: randomTeacher.user.id,
        notes: notes[Math.floor(Math.random() * notes.length)],
        createdAt: randomDate
      }
    })

    pointRecords.push(pointRecord)

    // Update total point siswa (dalam implementasi nyata, ini bisa dilakukan dengan trigger database)
    await prisma.student.update({
      where: { id: randomStudent.student.id },
      data: {
        totalPoint: {
          increment: randomCategory.pointValue
        }
      }
    })
  }

  console.log('✅ Point records created')

  // ====================================================================
  // --- CREATE NOTIFICATIONS ---
  // ====================================================================
  
  const notifications = []
  const notificationMessages = [
    'Anak Anda mendapat poin prestasi hari ini',
    'Ada catatan pelanggaran untuk anak Anda',
    'Reminder: Rapat orang tua minggu depan',
    'Anak Anda terpilih dalam kegiatan ekstrakurikuler',
    'Pemberitahuan nilai ujian sudah keluar',
    'Anak Anda mendapat penghargaan dari sekolah',
    'Harap datang ke sekolah untuk konsultasi',
    'Jadwal kegiatan sekolah telah diperbarui'
  ]

  // Buat notifikasi untuk orang tua
  for (let i = 0; i < 100; i++) {
    const randomParent = parents[Math.floor(Math.random() * parents.length)]
    const randomMessage = notificationMessages[Math.floor(Math.random() * notificationMessages.length)]
    
    const randomDate = new Date()
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30))
    
    const notification = await prisma.notification.create({
      data: {
        userId: randomParent.user.id,
        message: randomMessage,
        isRead: Math.random() > 0.3, // 70% sudah dibaca
        createdAt: randomDate
      }
    })

    notifications.push(notification)
  }

  console.log('✅ Notifications created')

  // ====================================================================
  // --- CREATE ACTIVITY LOGS ---
  // ====================================================================
  
  const activityLogs = []
  const actions = [
    'LOGIN',
    'LOGOUT', 
    'CREATE_POINT_RECORD',
    'UPDATE_STUDENT_DATA',
    'VIEW_STUDENT_REPORT',
    'UPDATE_PROFILE',
    'SEND_NOTIFICATION',
    'GENERATE_REPORT'
  ]

  for (let i = 0; i < 200; i++) {
    const allUsers = [...teachers.map(t => t.user), ...parents.map(p => p.user), adminUser]
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
    const randomAction = actions[Math.floor(Math.random() * actions.length)]
    
    const randomDate = new Date()
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 60))
    
    const details = {
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      additionalInfo: 'Action performed successfully'
    }

    const activityLog = await prisma.activityLog.create({
      data: {
        userId: randomUser.id,
        action: randomAction,
        details: JSON.stringify(details),
        createdAt: randomDate
      }
    })

    activityLogs.push(activityLog)
  }

  console.log('✅ Activity logs created')

  // ====================================================================
  // --- SUMMARY ---
  // ====================================================================
  
  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Roles: ${roles.length}`)
  console.log(`- Classes: ${classes.length}`)
  console.log(`- Teachers: ${teachers.length}`)
  console.log(`- Students: ${students.length}`)
  console.log(`- Parents: ${parents.length}`)
  console.log(`- Point Categories: ${pointCategories.length}`)
  console.log(`- Point Records: ${pointRecords.length}`)
  console.log(`- Notifications: ${notifications.length}`)
  console.log(`- Activity Logs: ${activityLogs.length}`)
  
  console.log('\n🔑 Default Login Credentials:')
  console.log('Admin: admin@sekolah.com / admin123')
  console.log('Teachers: [teacher-email] / guru123')
  console.log('Students: [student-email] / siswa123')
  console.log('Parents: [parent-email] / parent123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })