/**
 * GET /api/documents - List all documents
 * POST /api/documents - Create new document
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canCreateDocument } from '@/lib/billing/rules';
import { createBillingFromDocument } from '@/lib/billing/service';

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

    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const documentType = searchParams.get('type');
    const status = searchParams.get('status');

    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
        ...(documentType && { documentType }),
        ...(status && { status }),
      },
      include: {
        billings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (error: unknown) {
    console.error('Error fetching documents:', error);
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

    // Check plan limits
    const documentCount = await prisma.document.count({
      where: { userId: user.id },
    });

    const canCreate = canCreateDocument(user.plan, documentCount);
    if (!canCreate.allowed) {
      return NextResponse.json(
        { error: canCreate.message, limitReached: true },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      documentType,
      documentNumber,
      fromName,
      fromEmail,
      fromAddress,
      fromCity,
      fromCountry,
      toName,
      toEmail,
      toAddress,
      toCity,
      toCountry,
      documentDate,
      dueDate,
      validUntil,
      items,
      subtotal,
      tax,
      discount,
      total,
      notes,
      terms,
      currency,
      template,
    } = body;

    // Validation
    if (!documentType || !documentNumber || !toName || !toEmail || !items) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        documentType,
        documentNumber,
        userId: user.id,
        fromName,
        fromEmail,
        fromAddress,
        fromCity,
        fromCountry,
        toName,
        toEmail,
        toAddress,
        toCity,
        toCountry,
        documentDate: new Date(documentDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        items,
        subtotal,
        tax,
        discount,
        total,
        notes,
        terms,
        currency: currency || 'USD',
        template,
        status: 'draft',
      },
    });

    // Create billing entry if applicable
    await createBillingFromDocument(
      document.id,
      user.id,
      documentType,
      subtotal,
      tax,
      discount,
      notes
    );

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
