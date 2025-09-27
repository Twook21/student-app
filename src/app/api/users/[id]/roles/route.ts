import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { 
        userId: params.id,
        isActive: true
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        },
        assigner: true
      }
    })

    return NextResponse.json({
      success: true,
      data: userRoles
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user roles' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { roleId, assignedBy, expiresAt } = await request.json()

    const userRole = await prisma.userRole.create({
      data: {
        userId: params.id,
        roleId,
        assignedBy,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        role: true,
        assigner: true
      }
    })

    return NextResponse.json({
      success: true,
      data: userRole,
      message: 'Role assigned successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to assign role' },
      { status: 500 }
    )
  }
}
