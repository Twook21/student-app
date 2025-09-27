import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET() {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      pendingApprovals,
      recentPointRecords
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.class.count(),
      prisma.pointRecord.count({
        where: { approvalStatus: 'PENDING' }
      }),
      prisma.pointRecord.findMany({
        take: 5,
        include: {
          student: {
            include: {
              user: true
            }
          },
          pointType: {
            include: {
              pointCategory: true
            }
          },
          teacher: {
            include: {
              user: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalClasses,
        pendingApprovals,
        recentPointRecords
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}