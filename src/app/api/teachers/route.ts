import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const department = searchParams.get('department')

    const skip = (page - 1) * limit

    const where = {
      ...(department && { department })
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          homeroomClasses: {
            include: {
              students: {
                include: {
                  user: true
                }
              }
            }
          },
          teacherSubjects: {
            include: {
              subject: true
            }
          }
        },
        orderBy: { user: { firstName: 'asc' } }
      }),
      prisma.teacher.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: teachers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teachers' },
      { status: 500 }
    )
  }
}