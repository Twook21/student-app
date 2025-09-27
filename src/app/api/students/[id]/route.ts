import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const gradeLevel = searchParams.get('gradeLevel')
    const classId = searchParams.get('classId')

    const skip = (page - 1) * limit

    const where = {
      ...(gradeLevel && { gradeLevel: parseInt(gradeLevel) }),
      ...(classId && { classId })
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          class: {
            include: {
              homeroomTeacher: {
                include: {
                  user: true
                }
              }
            }
          },
          parentRelationships: {
            include: {
              parent: {
                include: {
                  user: true
                }
              }
            }
          },
          pointSummaries: true
        },
        orderBy: { user: { firstName: 'asc' } }
      }),
      prisma.student.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const student = await prisma.student.create({
      data: body,
      include: {
        user: true,
        class: true,
        parentRelationships: {
          include: {
            parent: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: student,
      message: 'Student created successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create student' },
      { status: 500 }
    )
  }
}