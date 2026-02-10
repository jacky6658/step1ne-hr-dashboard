import { NextResponse } from 'next/server';
import { generateDashboard } from '@/lib/sheets-api';

export async function GET() {
  try {
    const dashboard = await generateDashboard();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error generating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 設定 revalidate（每30秒重新抓取）
export const revalidate = 30;
