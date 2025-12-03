/**
 * GET /api/documents/[id] - Get document by ID
 * PUT /api/documents/[id] - Update document
 * DELETE /api/documents/[id] - Delete document
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        billings: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!document || document.userId !== user.id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error: unknown) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document || document.userId !== user.id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const body = await req.json();

    const updated = await prisma.document.update({
      where: { id },
      data: {
        ...body,
        documentDate: body.documentDate ? new Date(body.documentDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      },
      include: {
        billings: true,
      },
    });

    return NextResponse.json({ document: updated });
  } catch (error: unknown) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document || document.userId !== user.id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete associated billings (cascade should handle this, but explicit for safety)
    await prisma.billing.deleteMany({
      where: { documentId: id },
    });

    // Delete document
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Document deleted' });
  } catch (error: unknown) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
