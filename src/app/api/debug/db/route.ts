import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test basic connection
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Try to connect and run a simple query
    const result = await db.$queryRaw`SELECT 1 as test`;
    console.log('Raw query result:', result);
    
    // Try to count causes
    const causeCount = await db.cause.count();
    console.log('Cause count:', causeCount);
    
    // Try to get a sample cause
    const sampleCause = await db.cause.findFirst();
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
        name: (error as any).name || 'Unknown',
        message: (error as any).message || 'Unknown error',
        code: (error as any).code || 'Unknown',
      },
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}