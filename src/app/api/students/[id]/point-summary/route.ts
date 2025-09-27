import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const academicYear = searchParams.get('academicYear')

    const where = {
      studentId: params.id,
      ...(academicYear && { academicYear })
    }

    const pointSummaries = await prisma.pointSummary.findMany({
      where,
      orderBy: [
        { academicYear: 'desc' },
        { semester: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: pointSummaries
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch point summary' },
      { status: 500 }
    )
  }
}