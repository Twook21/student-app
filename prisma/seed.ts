import { PrismaClient, RelationshipType, ApprovalStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Define a type for the data structure we receive from the PointRecord query
// This helps resolve the 'implicitly has an any type' (ts7006) errors in map/filter/reduce callbacks.
type PointRecordPayload = {
  semester: number;
  pointsAwarded: number;
  // Include other necessary properties from the PointRecord model if needed for the logic below
}

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data in correct order to avoid foreign key constraints
  await prisma.pointSummary.deleteMany()
  await prisma.pointRecord.deleteMany()
  await prisma.pointType.deleteMany()
  await prisma.pointCategory.deleteMany()
  await prisma.teacherSubject.deleteMany()
  await prisma.teacherClass.deleteMany()
  await prisma.parentStudentRelationship.deleteMany()
  await prisma.userRole.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.student.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.parent.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.class.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.role.deleteMany()
  await prisma.academicYear.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleared existing data')

  // 1. Create Academic Years
  const currentYear = await prisma.academicYear.create({
    data: {
      yearName: '2024-2025',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-07-31'),
      isCurrent: true,
    },
  })

  const previousYear = await prisma.academicYear.create({
    data: {
      yearName: '2023-2024',
      startDate: new Date('2023-08-01'),
      endDate: new Date('2024-07-31'),
      isCurrent: false,
    },
  })

  console.log('📅 Created academic years')

  // 2. Create Roles
  const superAdminRole = await prisma.role.create({
    data: {
      roleName: 'Super Admin',
      description: 'Full system access',
      isSystemRole: true,
    },
  })

  const principalRole = await prisma.role.create({
    data: {
      roleName: 'Principal',
      description: 'School-wide reports and management',
      isSystemRole: true,
    },
  })

  const hodRole = await prisma.role.create({
    data: {
      roleName: 'Head of Department',
      description: 'Department-specific management',
      isSystemRole: true,
    },
  })

  const homeroomTeacherRole = await prisma.role.create({
    data: {
      roleName: 'Homeroom Teacher',
      description: 'Class management and point recording',
      isSystemRole: true,
    },
  })

  const subjectTeacherRole = await prisma.role.create({
    data: {
      roleName: 'Subject Teacher',
      description: 'Limited point recording for their subjects',
      isSystemRole: true,
    },
  })

  const studentRole = await prisma.role.create({
    data: {
      roleName: 'Student',
      description: 'View own points only',
      isSystemRole: true,
    },
  })

  const parentRole = await prisma.role.create({
    data: {
      roleName: 'Parent',
      description: 'View child\'s points only',
      isSystemRole: true,
    },
  })

  console.log('👥 Created roles')

  // 3. Create Permissions
  const permissions = [
    { name: 'points:create', resource: 'points', action: 'create', desc: 'Create new point records' },
    { name: 'points:read', resource: 'points', action: 'read', desc: 'View point records' },
    { name: 'points:update', resource: 'points', action: 'update', desc: 'Update point records' },
    { name: 'points:delete', resource: 'points', action: 'delete', desc: 'Delete point records' },
    { name: 'points:approve', resource: 'points', action: 'approve', desc: 'Approve pending point records' },
    { name: 'reports:generate', resource: 'reports', action: 'generate', desc: 'Generate system reports' },
    { name: 'students:manage', resource: 'students', action: 'manage', desc: 'Manage student information' },
    { name: 'classes:assign', resource: 'classes', action: 'assign', desc: 'Assign students to classes' },
    { name: 'teachers:manage', resource: 'teachers', action: 'manage', desc: 'Manage teacher information' },
    { name: 'users:manage', resource: 'users', action: 'manage', desc: 'Manage user accounts' },
    { name: 'roles:assign', resource: 'roles', action: 'assign', desc: 'Assign roles to users' },
    { name: 'settings:manage', resource: 'settings', action: 'manage', desc: 'Manage system settings' },
  ]

  const createdPermissions = await Promise.all(
    permissions.map(perm =>
      prisma.permission.create({
        data: {
          permissionName: perm.name,
          resource: perm.resource,
          action: perm.action,
          description: perm.desc,
        },
      })
    )
  )

  console.log('🔐 Created permissions')

  // 4. Assign Permissions to Roles
  // Super Admin - All permissions
  await Promise.all(
    createdPermissions.map(permission =>
      prisma.rolePermission.create({
        data: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      })
    )
  )

  // Principal - Most permissions except user management
  const principalPermissions = createdPermissions.filter(p => 
    !p.permissionName.includes('users:manage') && !p.permissionName.includes('roles:assign')
  )
  await Promise.all(
    principalPermissions.map(permission =>
      prisma.rolePermission.create({
        data: {
          roleId: principalRole.id,
          permissionId: permission.id,
        },
      })
    )
  )

  // Homeroom Teacher - Point management and reports
  const homeroomPermissions = createdPermissions.filter(p =>
    p.permissionName.includes('points:') || p.permissionName.includes('reports:generate')
  )
  await Promise.all(
    homeroomPermissions.map(permission =>
      prisma.rolePermission.create({
        data: {
          roleId: homeroomTeacherRole.id,
          permissionId: permission.id,
        },
      })
    )
  )

  // Subject Teacher - Limited point management
  const subjectTeacherPermissions = createdPermissions.filter(p =>
    p.permissionName === 'points:create' || p.permissionName === 'points:read'
  )
  await Promise.all(
    subjectTeacherPermissions.map(permission =>
      prisma.rolePermission.create({
        data: {
          roleId: subjectTeacherRole.id,
          permissionId: permission.id,
        },
      })
    )
  )

  // Student - Read own points only
  const studentPermissions = createdPermissions.filter(p => p.permissionName === 'points:read')
  await Promise.all(
    studentPermissions.map(permission =>
      prisma.rolePermission.create({
        data: {
          // FIX: Changed 'userId' to 'roleId'
          roleId: studentRole.id,
          permissionId: permission.id,
        },
      })
    )
  )

  // Parent - Read child's points only
  const parentPermissions = createdPermissions.filter(p => p.permissionName === 'points:read')
  await Promise.all(
    parentPermissions.map(permission =>
      prisma.rolePermission.create({
        data: {
          // FIX: Changed 'userId' to 'roleId'
          roleId: parentRole.id,
          permissionId: permission.id,
        },
      })
    )
  )

  console.log('🔗 Assigned permissions to roles')

  // 5. Create Subjects
  const subjects = [
    { name: 'Mathematics', code: 'MATH', dept: 'Science', credits: 4 },
    { name: 'English Language', code: 'ENG', dept: 'Language', credits: 4 },
    { name: 'Indonesian Language', code: 'IND', dept: 'Language', credits: 4 },
    { name: 'Physics', code: 'PHY', dept: 'Science', credits: 3 },
    { name: 'Chemistry', code: 'CHEM', dept: 'Science', credits: 3 },
    { name: 'Biology', code: 'BIO', dept: 'Science', credits: 3 },
    { name: 'History', code: 'HIST', dept: 'Social Studies', credits: 2 },
    { name: 'Geography', code: 'GEO', dept: 'Social Studies', credits: 2 },
    { name: 'Physical Education', code: 'PE', dept: 'Physical Education', credits: 2 },
    { name: 'Art', code: 'ART', dept: 'Arts', credits: 2 },
  ]

  const createdSubjects = await Promise.all(
    subjects.map(subject =>
      prisma.subject.create({
        data: {
          subjectName: subject.name,
          subjectCode: subject.code,
          department: subject.dept,
          credits: subject.credits,
        },
      })
    )
  )

  console.log('📚 Created subjects')

  // 6. Create Classes
  const classes = []
  for (let grade = 10; grade <= 12; grade++) {
    for (let section = 1; section <= 3; section++) {
      const className = `Grade ${grade} - Section ${section}`
      const classCode = `G${grade}S${section}`
      
      classes.push({
        className,
        classCode,
        gradeLevel: grade,
        academicYear: currentYear.yearName,
      })
    }
  }

  const createdClasses = await Promise.all(
    classes.map(cls =>
      prisma.class.create({
        data: cls,
      })
    )
  )

  console.log('🏫 Created classes')

  // 7. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      username: 'admin',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+62812345678',
    },
  })

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  })

  console.log('👤 Created admin user')

  // 8. Create Principal User
  const principalUser = await prisma.user.create({
    data: {
      email: 'principal@school.com',
      username: 'principal',
      passwordHash: await bcrypt.hash('principal123', 10),
      firstName: 'John',
      lastName: 'Principal',
      phone: '+62812345679',
    },
  })

  await prisma.userRole.create({
    data: {
      userId: principalUser.id,
      roleId: principalRole.id,
    },
  })

  console.log('🎓 Created principal user')

  // 9. Create Teachers
  const teacherData = [
    { 
      firstName: 'Sarah', 
      lastName: 'Johnson', 
      email: 'sarah.johnson@school.com',
      username: 'sarah.johnson',
      employeeId: 'T001',
      department: 'Mathematics',
      isHOD: true,
      subjects: ['MATH']
    },
    { 
      firstName: 'Michael', 
      lastName: 'Chen', 
      email: 'michael.chen@school.com',
      username: 'michael.chen',
      employeeId: 'T002',
      department: 'Science',
      isHOD: false,
      subjects: ['PHY', 'CHEM']
    },
    { 
      firstName: 'Emma', 
      lastName: 'Davis', 
      email: 'emma.davis@school.com',
      username: 'emma.davis',
      employeeId: 'T003',
      department: 'Language',
      isHOD: true,
      subjects: ['ENG', 'IND']
    },
    { 
      firstName: 'David', 
      lastName: 'Wilson', 
      email: 'david.wilson@school.com',
      username: 'david.wilson',
      employeeId: 'T004',
      department: 'Science',
      isHOD: false,
      subjects: ['BIO']
    },
    { 
      firstName: 'Lisa', 
      lastName: 'Brown', 
      email: 'lisa.brown@school.com',
      username: 'lisa.brown',
      employeeId: 'T005',
      department: 'Social Studies',
      isHOD: true,
      subjects: ['HIST', 'GEO']
    },
  ]

  const teachers = []
  for (const teacher of teacherData) {
    const user = await prisma.user.create({
      data: {
        email: teacher.email,
        username: teacher.username,
        passwordHash: await bcrypt.hash('teacher123', 10),
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        phone: `+6281234567${Math.floor(Math.random() * 90) + 10}`,
      },
    })

    const teacherRecord = await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId: teacher.employeeId,
        hireDate: new Date('2020-08-01'),
        department: teacher.department,
        isHeadOfDepartment: teacher.isHOD,
        specialty: teacher.subjects.join(', '),
      },
    })

    // Assign role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: teacher.isHOD ? hodRole.id : (Math.random() > 0.5 ? homeroomTeacherRole.id : subjectTeacherRole.id),
      },
    })

    // Assign subjects
    for (const subjectCode of teacher.subjects) {
      const subject = createdSubjects.find(s => s.subjectCode === subjectCode)
      if (subject) {
        await prisma.teacherSubject.create({
          data: {
            teacherId: teacherRecord.id,
            subjectId: subject.id,
            academicYear: currentYear.yearName,
            isPrimaryTeacher: true,
            assignedDate: new Date('2024-08-01'),
          },
        })
      }
    }

    teachers.push(teacherRecord)
  }

  // Assign homeroom teachers to classes
  for (let i = 0; i < Math.min(createdClasses.length, teachers.length); i++) {
    await prisma.class.update({
      where: { id: createdClasses[i].id },
      data: { homeroomTeacherId: teachers[i].id },
    })

    await prisma.teacherClass.create({
      data: {
        teacherId: teachers[i].id,
        classId: createdClasses[i].id,
        academicYear: currentYear.yearName,
        isHomeroomTeacher: true,
        assignedDate: new Date('2024-08-01'),
      },
    })
  }

  console.log('👨‍🏫 Created teachers')

  // 10. Create Students and Parents
  const studentNames = [
    { first: 'Alice', last: 'Anderson' },
    { first: 'Bob', last: 'Brown' },
    { first: 'Charlie', last: 'Chen' },
    { first: 'Diana', last: 'Davis' },
    { first: 'Edward', last: 'Evans' },
    { first: 'Fiona', last: 'Foster' },
    { first: 'George', last: 'Garcia' },
    { first: 'Hannah', last: 'Harris' },
    { first: 'Ian', last: 'Ibrahim' },
    { first: 'Julia', last: 'Johnson' },
    { first: 'Kevin', last: 'Kim' },
    { first: 'Luna', last: 'Lee' },
    { first: 'Marcus', last: 'Miller' },
    { first: 'Nina', last: 'Nguyen' },
    { first: 'Oliver', last: 'O\'Connor' },
  ]

  const students = []
  const parents = []

  for (let i = 0; i < studentNames.length; i++) {
    const studentName = studentNames[i]
    const classIndex = i % createdClasses.length
    const gradeLevel = createdClasses[classIndex].gradeLevel
    
    // Create Student User
    const studentUser = await prisma.user.create({
      data: {
        email: `${studentName.first.toLowerCase()}.${studentName.last.toLowerCase()}@student.school.com`,
        username: `${studentName.first.toLowerCase()}.${studentName.last.toLowerCase()}`,
        passwordHash: await bcrypt.hash('student123', 10),
        firstName: studentName.first,
        lastName: studentName.last,
        phone: `+6281234${String(i).padStart(4, '0')}`,
      },
    })

    // Create Student Profile
    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        studentNumber: `STU${String(2024000 + i + 1).padStart(7, '0')}`,
        dateOfBirth: new Date(2006 + (12 - gradeLevel), Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 28) + 1),
        gradeLevel,
        classId: createdClasses[classIndex].id,
        majorStream: gradeLevel >= 11 ? (Math.random() > 0.5 ? 'Science' : 'Social Studies') : null,
        enrollmentDate: new Date(`${2024 - (12 - gradeLevel)}-08-01`),
      },
    })

    // Assign Student Role
    await prisma.userRole.create({
      data: {
        userId: studentUser.id,
        roleId: studentRole.id,
      },
    })

    // Create Parents (Father and Mother)
    const fatherUser = await prisma.user.create({
      data: {
        email: `${studentName.first.toLowerCase()}.father@parent.school.com`,
        username: `${studentName.first.toLowerCase()}.father`,
        passwordHash: await bcrypt.hash('parent123', 10),
        firstName: `Father of ${studentName.first}`,
        lastName: studentName.last,
        phone: `+6281234${String(i * 2).padStart(4, '0')}`,
      },
    })

    const father = await prisma.parent.create({
      data: {
        userId: fatherUser.id,
        occupation: ['Engineer', 'Doctor', 'Teacher', 'Businessman', 'Government Officer'][Math.floor(Math.random() * 5)],
        emergencyContact: true,
      },
    })

    const motherUser = await prisma.user.create({
      data: {
        email: `${studentName.first.toLowerCase()}.mother@parent.school.com`,
        username: `${studentName.first.toLowerCase()}.mother`,
        passwordHash: await bcrypt.hash('parent123', 10),
        firstName: `Mother of ${studentName.first}`,
        lastName: studentName.last,
        phone: `+6281234${String(i * 2 + 1).padStart(4, '0')}`,
      },
    })

    const mother = await prisma.parent.create({
      data: {
        userId: motherUser.id,
        occupation: ['Nurse', 'Teacher', 'Housewife', 'Manager', 'Civil Servant'][Math.floor(Math.random() * 5)],
        emergencyContact: false,
      },
    })

    // Assign Parent Roles
    await prisma.userRole.create({
      data: {
        userId: fatherUser.id,
        roleId: parentRole.id,
      },
    })

    await prisma.userRole.create({
      data: {
        userId: motherUser.id,
        roleId: parentRole.id,
      },
    })

    // Create Parent-Student Relationships
    await prisma.parentStudentRelationship.create({
      data: {
        parentId: father.id,
        studentId: student.id,
        relationshipType: RelationshipType.FATHER,
        isPrimaryContact: true,
      },
    })

    await prisma.parentStudentRelationship.create({
      data: {
        parentId: mother.id,
        studentId: student.id,
        relationshipType: RelationshipType.MOTHER,
        isPrimaryContact: false,
      },
    })

    students.push(student)
    parents.push(father, mother)
  }

  console.log('🎓 Created students and parents')

  // 11. Create Point Categories
  const positiveCategories = [
    { name: 'Academic Achievement', desc: 'Points for academic excellence', color: '#10B981' },
    { name: 'Behavioral Achievement', desc: 'Points for good behavior and character', color: '#3B82F6' },
    { name: 'Leadership', desc: 'Points for leadership activities', color: '#8B5CF6' },
    { name: 'Community Service', desc: 'Points for community involvement', color: '#F59E0B' },
  ]

  const negativeCategories = [
    { name: 'Academic Violation', desc: 'Points deduction for academic issues', color: '#EF4444' },
    { name: 'Behavioral Violation', desc: 'Points deduction for behavioral issues', color: '#DC2626' },
    { name: 'Attendance Issues', desc: 'Points deduction for attendance problems', color: '#B91C1C' },
    { name: 'Uniform Violation', desc: 'Points deduction for uniform issues', color: '#991B1B' },
  ]

  const createdPositiveCategories = await Promise.all(
    positiveCategories.map(cat =>
      prisma.pointCategory.create({
        data: {
          categoryName: cat.name,
          description: cat.desc,
          isPositive: true,
          colorCode: cat.color,
        },
      })
    )
  )

  const createdNegativeCategories = await Promise.all(
    negativeCategories.map(cat =>
      prisma.pointCategory.create({
        data: {
          categoryName: cat.name,
          description: cat.desc,
          isPositive: false,
          colorCode: cat.color,
        },
      })
    )
  )

  console.log('📊 Created point categories')

  // 12. Create Point Types
  const positivePointTypes = [
    // Academic Achievement
    { category: 0, name: 'Excellent Test Score (90-100)', desc: 'Scored 90-100 on a test', points: 10 },
    { category: 0, name: 'Perfect Homework Streak (1 week)', desc: 'Completed all homework for a week', points: 5 },
    { category: 0, name: 'Academic Competition Winner', desc: 'Won academic competition', points: 15 },
    { category: 0, name: 'Improvement in Grades', desc: 'Significant improvement in subject grades', points: 8 },
    
    // Behavioral Achievement
    { category: 1, name: 'Helping a Classmate', desc: 'Helped classmate with studies or problems', points: 3 },
    { category: 1, name: 'Leadership in Group Project', desc: 'Led group project effectively', points: 8 },
    { category: 1, name: 'Respectful Behavior', desc: 'Showed exceptional respect to teachers/peers', points: 5 },
    { category: 1, name: 'Conflict Resolution', desc: 'Helped resolve conflicts peacefully', points: 10 },
    
    // Leadership
    { category: 2, name: 'Student Council Activity', desc: 'Active participation in student council', points: 12 },
    { category: 2, name: 'Event Organization', desc: 'Organized or led school event', points: 15 },
    { category: 2, name: 'Mentoring Junior Students', desc: 'Mentored younger students', points: 10 },
    
    // Community Service
    { category: 3, name: 'Volunteer Service', desc: 'Participated in volunteer activities', points: 10 },
    { category: 3, name: 'Environmental Initiative', desc: 'Led environmental conservation activity', points: 12 },
    { category: 3, name: 'Charity Work', desc: 'Participated in charity or fundraising', points: 8 },
  ]

  const negativePointTypes = [
    // Academic Violation
    { category: 0, name: 'Late Assignment Submission', desc: 'Submitted assignment after deadline', points: -5 },
    { category: 0, name: 'Incomplete Homework', desc: 'Failed to complete homework', points: -3 },
    { category: 0, name: 'Cheating on Test', desc: 'Caught cheating during examination', points: -20 },
    { category: 0, name: 'Plagiarism', desc: 'Submitted plagiarized work', points: -15 },
    
    // Behavioral Violation
    { category: 1, name: 'Disruptive Behavior', desc: 'Disrupted class or school activities', points: -10 },
    { category: 1, name: 'Disrespectful to Teacher', desc: 'Showed disrespect to teaching staff', points: -15 },
    { category: 1, name: 'Fighting', desc: 'Engaged in physical altercation', points: -25 },
    { category: 1, name: 'Bullying', desc: 'Bullied another student', points: -30 },
    
    // Attendance Issues
    { category: 2, name: 'Late to Class', desc: 'Arrived late to class', points: -2 },
    { category: 2, name: 'Unexcused Absence', desc: 'Absent without valid reason', points: -5 },
    { category: 2, name: 'Skipping Class', desc: 'Left school grounds without permission', points: -10 },
    
    // Uniform Violation
    { category: 3, name: 'Incomplete Uniform', desc: 'Not wearing complete school uniform', points: -1 },
    { category: 3, name: 'Inappropriate Appearance', desc: 'Hair, accessories, or appearance violations', points: -2 },
  ]

  const createdPositiveTypes = await Promise.all(
    positivePointTypes.map(type =>
      prisma.pointType.create({
        data: {
          pointCategoryId: createdPositiveCategories[type.category].id,
          typeName: type.name,
          description: type.desc,
          defaultPoints: type.points,
          createdBy: adminUser.id,
        },
      })
    )
  )

  const createdNegativeTypes = await Promise.all(
    negativePointTypes.map(type =>
      prisma.pointType.create({
        data: {
          pointCategoryId: createdNegativeCategories[type.category].id,
          typeName: type.name,
          description: type.desc,
          defaultPoints: type.points,
          createdBy: adminUser.id,
        },
      })
    )
  )

  console.log('🎯 Created point types')

  // 13. Create Sample Point Records
  const allPointTypes = [...createdPositiveTypes, ...createdNegativeTypes]
  const allTeachers = teachers

  // Create random point records for the last 3 months
  const today = new Date()
  
  for (let i = 0; i < students.length * 8; i++) { // Average 8 records per student
    const student = students[Math.floor(Math.random() * students.length)]
    const pointType = allPointTypes[Math.floor(Math.random() * allPointTypes.length)]
    const teacher = allTeachers[Math.floor(Math.random() * allTeachers.length)]
    
    // Random date within last 90 days
    const randomDate = new Date(today.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    
    await prisma.pointRecord.create({
      data: {
        studentId: student.id,
        pointTypeId: pointType.id,
        teacherId: teacher.id,
        pointsAwarded: pointType.defaultPoints + Math.floor(Math.random() * 3) - 1, // Small variation
        incidentDate: randomDate,
        incidentTime: new Date(`1970-01-01T${String(Math.floor(Math.random() * 16) + 7).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`),
        location: ['Classroom', 'Library', 'Laboratory', 'Cafeteria', 'Playground', 'Auditorium'][Math.floor(Math.random() * 6)],
        description: `Point awarded for: ${pointType.typeName}`,
        academicYear: currentYear.yearName,
        semester: randomDate.getMonth() >= 1 && randomDate.getMonth() <= 6 ? 2 : 1,
        approvalStatus: Math.random() > 0.1 ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING,
        approvedBy: Math.random() > 0.1 ? adminUser.id : null,
        approvedAt: Math.random() > 0.1 ? randomDate : null,
      },
    })
  }

  console.log('📈 Created sample point records')

  // 14. Generate Point Summaries
  for (const student of students) {
    // Calculate summaries for current academic year
    // We query all required fields (including the student's ID and points awarded)
    const studentPoints = await prisma.pointRecord.findMany({
      where: {
        studentId: student.id,
        academicYear: currentYear.yearName,
        approvalStatus: ApprovalStatus.APPROVED,
      },
      select: {
        semester: true,
        pointsAwarded: true,
      },
    }) as PointRecordPayload[]

    // Group by semester. The filter callback is now strongly typed.
    const semester1Points = studentPoints.filter((p: PointRecordPayload) => p.semester === 1)
    const semester2Points = studentPoints.filter((p: PointRecordPayload) => p.semester === 2)

    // Explicitly type the array structure for iteration
    const semesterData: [number, PointRecordPayload[]][] = [
        [1, semester1Points], 
        [2, semester2Points]
    ]

    for (const [semester, points] of semesterData) {
      // Explicitly type parameters in reduce callbacks to resolve 'implicit any' errors (ts7006)
      const positivePoints = points
        .filter((p: PointRecordPayload) => p.pointsAwarded > 0)
        .reduce((sum: number, p: PointRecordPayload) => sum + p.pointsAwarded, 0)
        
      const negativePoints = Math.abs(points
        .filter((p: PointRecordPayload) => p.pointsAwarded < 0)
        .reduce((sum: number, p: PointRecordPayload) => sum + p.pointsAwarded, 0))

      const netPoints = positivePoints - negativePoints;

      await prisma.pointSummary.create({
        data: {
          studentId: student.id,
          academicYear: currentYear.yearName,
          semester: semester,
          totalPositivePoints: positivePoints,
          totalNegativePoints: negativePoints,
          netPoints: netPoints,
        },
      })
    }
  }

  console.log('📊 Generated point summaries')

  // 15. Display Summary
  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`👥 Users: ${await prisma.user.count()}`)
  console.log(`🎓 Students: ${await prisma.student.count()}`)
  console.log(`👨‍🏫 Teachers: ${await prisma.teacher.count()}`)
  console.log(`👪 Parents: ${await prisma.parent.count()}`)
  console.log(`🏫 Classes: ${await prisma.class.count()}`)
  console.log(`📚 Subjects: ${await prisma.subject.count()}`)
  console.log(`🎯 Point Types: ${await prisma.pointType.count()}`)
  console.log(`📈 Point Records: ${await prisma.pointRecord.count()}`)
  console.log(`🔐 Roles: ${await prisma.role.count()}`)
  console.log(`🔑 Permissions: ${await prisma.permission.count()}`)

  console.log('\n🔐 Default Login Credentials:')
  console.log('Admin: admin@school.com / admin123')
  console.log('Principal: principal@school.com / principal123')
  console.log('Teachers: [firstname].[lastname]@school.com / teacher123')
  console.log('Students: [firstname].[lastname]@student.school.com / student123')
  console.log('Parents: [child.firstname].father@parent.school.com / parent123')
  console.log('         [child.firstname].mother@parent.school.com / parent123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
