import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { username: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: true,
          teacher: true,
          parent: true,
          userRoles: {
            include: {
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, ...userData } = body

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword
      },
      include: {
        student: true,
        teacher: true,
        parent: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.code === 'P2002' ? 'Email or username already exists' : 'Failed to create user'
      },
      { status: 400 }
    )
  }
}