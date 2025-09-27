import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApprovalStatus } from '@prisma/client'

// Define types for better type safety
interface PointRecordWhereInput {
  studentId?: string
  academicYear?: string
  approvalStatus?: ApprovalStatus
}

interface CreatePointRecordBody {
  studentId: string
  pointTypeId: string
  teacherId: string
  pointsAwarded: number
  incidentDate: string
  incidentTime?: string
  location?: string
  description?: string
  academicYear: string
  semester: number
  approvalStatus?: ApprovalStatus
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const studentId = searchParams.get('studentId')
    const academicYear = searchParams.get('academicYear')
    const approvalStatusParam = searchParams.get('approvalStatus')

    const skip = (page - 1) * limit

    // Build where clause with proper typing
    const where: PointRecordWhereInput = {}
    
    if (studentId) {
      where.studentId = studentId
    }
    
    if (academicYear) {
      where.academicYear = academicYear
    }
    
    if (approvalStatusParam && Object.values(ApprovalStatus).includes(approvalStatusParam as ApprovalStatus)) {
      where.approvalStatus = approvalStatusParam as ApprovalStatus
    }

    const [records, total] = await Promise.all([
      prisma.pointRecord.findMany({
        where,
        skip,
        take: limit,
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
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pointRecord.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching point records:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch point records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePointRecordBody = await request.json()

    // Validate required fields
    if (!body.studentId || !body.pointTypeId || !body.teacherId || !body.academicYear) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const pointRecord = await prisma.$transaction(async (tx) => {
      // Create point record
      const record = await tx.pointRecord.create({
        data: {
          studentId: body.studentId,
          pointTypeId: body.pointTypeId,
          teacherId: body.teacherId,
          pointsAwarded: body.pointsAwarded,
          incidentDate: new Date(body.incidentDate),
          incidentTime: body.incidentTime ? body.incidentTime : null,
          location: body.location || null,
          description: body.description || null,
          academicYear: body.academicYear,
          semester: body.semester || 1,
          approvalStatus: body.approvalStatus || ApprovalStatus.PENDING
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
          }
        }
      })

      // Update point summary only if record is approved or auto-approved
      if (record.approvalStatus === ApprovalStatus.APPROVED) {
        const existingSummary = await tx.pointSummary.findUnique({
          where: {
            studentId_academicYear_semester: {
              studentId: body.studentId,
              academicYear: body.academicYear,
              semester: body.semester || 1
            }
          }
        })

        const pointsAwarded = body.pointsAwarded
        const isPositive = pointsAwarded > 0

        if (existingSummary) {
          await tx.pointSummary.update({
            where: {
              studentId_academicYear_semester: {
                studentId: body.studentId,
                academicYear: body.academicYear,
                semester: body.semester || 1
              }
            },
            data: {
              totalPositivePoints: isPositive 
                ? existingSummary.totalPositivePoints + pointsAwarded
                : existingSummary.totalPositivePoints,
              totalNegativePoints: !isPositive
                ? existingSummary.totalNegativePoints + Math.abs(pointsAwarded)
                : existingSummary.totalNegativePoints,
              netPoints: existingSummary.netPoints + pointsAwarded,
              lastUpdated: new Date()
            }
          })
        } else {
          await tx.pointSummary.create({
            data: {
              studentId: body.studentId,
              academicYear: body.academicYear,
              semester: body.semester || 1,
              totalPositivePoints: isPositive ? pointsAwarded : 0,
              totalNegativePoints: !isPositive ? Math.abs(pointsAwarded) : 0,
              netPoints: pointsAwarded
            }
          })
        }
      }

      return record
    })

    return NextResponse.json({
      success: true,
      data: pointRecord,
      message: 'Point record created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating point record:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Duplicate record detected' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Referenced record not found' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create point record' },
      { status: 500 }
    )
  }
}