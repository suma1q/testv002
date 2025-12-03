/**
 * POST /api/billing - Create billing entry (usually auto-created with document)
 * GET /api/billing - Get all billings
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

    // Get query params
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const billings = await prisma.billing.findMany({
      where: {
        userId: user.id,
        ...(type && { type }),
        ...(status && { billingStatus: status }),
      },
      include: {
        document: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ billings });
  } catch (error: unknown) {
    console.error('Error fetching billings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const {
      documentId,
      type,
      amount,
      tax,
      total,
      reference,
      notes,
    } = body;

    if (!documentId || !type || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const billing = await prisma.billing.create({
      data: {
        documentId,
        userId: user.id,
        type,
        amount,
        tax: tax || 0,
        total,
        paidAmount: 0,
        remainingAmount: total,
        reference,
        notes,
      },
    });

    return NextResponse.json({ billing }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating billing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
