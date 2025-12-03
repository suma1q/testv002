/**
 * PUT /api/pos/[id] - Update POS order
 * POST /api/pos/[id]/checkout - Checkout and process payment
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createBillingFromDocument } from '@/lib/billing/service';
import { generateDocumentNumber } from '@/lib/billing/rules';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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

    const posOrder = await prisma.posOrder.findUnique({
      where: { id },
    });

    if (!posOrder || posOrder.userId !== user.id) {
      return NextResponse.json({ error: 'POS order not found' }, { status: 404 });
    }

    const body = await req.json();
    const { status, items, notes } = body;

    // Update POS order
    const updated = await prisma.posOrder.update({
      where: { id },
      data: {
        status,
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item: any) => ({
              itemName: item.itemName,
              category: item.category,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              tax: item.tax || 0,
              amount: item.unitPrice * item.quantity,
              notes: item.notes,
            })),
          },
        }),
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ posOrder: updated });
  } catch (error: unknown) {
    console.error('Error updating POS order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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

    const posOrder = await prisma.posOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!posOrder || posOrder.userId !== user.id) {
      return NextResponse.json({ error: 'POS order not found' }, { status: 404 });
    }

    const body = await req.json();
    const { paymentMethod, paymentAmount = posOrder.total } = body;

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method required' },
        { status: 400 }
      );
    }

    // Create receipt document
    const documentCount = await prisma.document.count({
      where: { userId: user.id, documentType: 'receipt' },
    });

    const receiptNumber = generateDocumentNumber('receipt', documentCount + 1);

    const receiptDocument = await prisma.document.create({
      data: {
        documentType: 'receipt',
        documentNumber: receiptNumber,
        userId: user.id,
        fromName: user.name || 'Restaurant',
        fromEmail: user.email,
        toName: posOrder.customerName || 'Walk-in',
        toEmail: user.email,
        documentDate: new Date(),
        items: posOrder.items,
        subtotal: posOrder.subtotal,
        tax: posOrder.tax,
        total: posOrder.total,
        notes: `Order Type: ${posOrder.orderType}`,
        status: 'paid',
      },
    });

    // Create billing entry
    const billing = await prisma.billing.create({
      data: {
        documentId: receiptDocument.id,
        userId: user.id,
        type: 'income',
        billingStatus: 'paid',
        amount: posOrder.subtotal,
        tax: posOrder.tax,
        total: posOrder.total,
        paidAmount: paymentAmount,
        remainingAmount: Math.max(0, posOrder.total - paymentAmount),
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        billingId: billing.id,
        userId: user.id,
        amount: paymentAmount,
        method: paymentMethod,
        status: 'completed',
        paidAt: new Date(),
      },
    });

    // Update POS order to closed
    const closedOrder = await prisma.posOrder.update({
      where: { id },
      data: {
        status: 'closed',
        documentId: receiptDocument.id,
        paymentStatus: paymentAmount >= posOrder.total ? 'paid' : 'partial',
        paymentMethod,
      },
    });

    return NextResponse.json({
      posOrder: closedOrder,
      receipt: receiptDocument,
      billing,
      payment,
    });
  } catch (error: unknown) {
    console.error('Error processing POS checkout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
