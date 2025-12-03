/**
 * GET /api/billing/stats - Get billing dashboard stats
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBillingStats, getRecentBillings } from '@/lib/billing/service';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get billing stats
    const stats = await getBillingStats(user.id);
    const recentBillings = await getRecentBillings(user.id, 10);

    return NextResponse.json({
      stats,
      recentBillings,
    });
  } catch (error: unknown) {
    console.error('Error fetching billing stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
