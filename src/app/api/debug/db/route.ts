import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test basic connection
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Try to connect and run a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Raw query result:', result);
    
    // Try to count causes
    const causeCount = await prisma.cause.count();
    console.log('Cause count:', causeCount);
    
    // Try to get a sample cause
    const sampleCause = await prisma.cause.findFirst();
    console.log('Sample cause:', sampleCause);
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        rawQueryResult: result,
        causeCount,
        sampleCause,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
      }
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: {
        name: error.name,
        message: error.message,
        code: error.code || 'Unknown',
      },
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}