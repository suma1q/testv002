/**
 * POST /api/pos - Create POS order
 * GET /api/pos - Get user's POS orders
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      tableNumber,
      customerName,
      orderType,
      items, // Array of {itemName, category, quantity, unitPrice, tax}
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    let taxTotal = 0;
    items.forEach((item: any) => {
      subtotal += item.unitPrice * item.quantity;
      taxTotal += item.tax || 0;
    });

    // Create POS order
    const posOrder = await prisma.posOrder.create({
      data: {
        userId: user.id,
        tableNumber,
        customerName,
        orderType: orderType || 'dine-in',
        subtotal,
        tax: taxTotal,
        total: subtotal + taxTotal,
        status: 'open',
        items: {
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
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ posOrder }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating POS order:', error);
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const posOrders = await prisma.posOrder.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      include: {
        items: true,
        document: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ posOrders });
  } catch (error: unknown) {
    console.error('Error fetching POS orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
