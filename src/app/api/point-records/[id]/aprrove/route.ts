import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { approvedBy } = await request.json()

    const pointRecord = await prisma.pointRecord.update({
      where: { id: params.id },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy,
        approvedAt: new Date()
      },
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
        },
        approver: true
      }
    })

    return NextResponse.json({
      success: true,
      data: pointRecord,
      message: 'Point record approved successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to approve point record' },
      { status: 500 }
    )
  }
}