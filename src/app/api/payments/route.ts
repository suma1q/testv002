/**
 * POST /api/payments - Record payment
 * GET /api/payments - Get payment history
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateBillingStatus } from '@/lib/billing/service';

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
      billingId,
      amount,
      method,
      reference,
      stripePaymentIntentId,
      gatewayMeta,
    } = body;

    if (!billingId || !amount || !method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify billing exists and belongs to user
    const billing = await prisma.billing.findUnique({
      where: { id: billingId },
    });

    if (!billing || billing.userId !== user.id) {
      return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        billingId,
        userId: user.id,
        amount,
        method,
        reference,
        stripePaymentIntentId,
        gatewayMeta: gatewayMeta || {},
        status: 'completed',
        paidAt: new Date(),
      },
    });

    // Update billing status
    await updateBillingStatus(billingId, amount);

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const billingId = searchParams.get('billingId');

    const payments = await prisma.payment.findMany({
      where: {
        userId: user.id,
        ...(billingId && { billingId }),
      },
      include: {
        billing: {
          include: {
            document: true,
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    return NextResponse.json({ payments });
  } catch (error: unknown) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
