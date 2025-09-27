import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const academicYear = searchParams.get('academicYear')
    const gradeLevel = searchParams.get('gradeLevel')

    const where = {
      ...(academicYear && { academicYear }),
      ...(gradeLevel && { gradeLevel: parseInt(gradeLevel) })
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        homeroomTeacher: {
          include: {
            user: true
          }
        },
        students: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: [
        { gradeLevel: 'asc' },
        { className: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: classes
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}