import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Test basic database connection
    const userCount = await prisma.user.count()
    return NextResponse.json({ 
      message: 'Prisma connection successful',
      userCount: userCount,
      databasePath: 'dev.db'
    })
  } catch (error) {
    console.error('Prisma error:', error)
    return NextResponse.json(
      { 
        error: 'Prisma connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
