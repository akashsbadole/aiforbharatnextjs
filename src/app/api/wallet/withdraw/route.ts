import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Request withdrawal
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, amount, paymentMethod = 'bank_transfer' } = data;

    if (!userId || !amount) {
      return NextResponse.json({ success: false, error: 'User ID and amount required' }, { status: 400 });
    }

    // Validate minimum amount
    if (amount < 500) {
      return NextResponse.json({ success: false, error: 'Minimum withdrawal amount is ₹500' }, { status: 400 });
    }

    // Get wallet
    const wallet = await db.userWallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    // Check sufficient balance
    if (wallet.availableBalance < amount) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
    }

    // Check bank details
    if (!wallet.bankName || !wallet.accountNumber || !wallet.ifscCode) {
      return NextResponse.json({ 
        success: false, 
        error: 'Bank account details required. Please update your bank details first.' 
      }, { status: 400 });
    }

    // Calculate processing fee (free for now)
    const processingFee = 0;
    const netAmount = amount - processingFee;

    // Create withdrawal request
    const withdrawal = await db.withdrawalRequest.create({
      data: {
        userId,
        walletId: wallet.id,
        amount,
        processingFee,
        netAmount,
        status: 'pending',
        paymentMethod
      }
    });

    // Deduct from wallet
    await db.userWallet.update({
      where: { userId },
      data: {
        availableBalance: { decrement: amount },
        totalWithdrawn: { increment: netAmount }
      }
    });

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        netAmount: withdrawal.netAmount,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt
      },
      message: `Withdrawal request of ₹${amount} submitted successfully!`
    });

  } catch (error) {
    console.error('Withdrawal request error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process withdrawal request' }, { status: 500 });
  }
}

// GET - Get withdrawal history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const withdrawals = await db.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      withdrawals
    });

  } catch (error) {
    console.error('Fetch withdrawals error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}

// PUT - Process withdrawal (admin)
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { withdrawalId, status, transactionId, adminNotes, rejectionReason } = data;

    if (!withdrawalId || !status) {
      return NextResponse.json({ success: false, error: 'Withdrawal ID and status required' }, { status: 400 });
    }

    const withdrawal = await db.withdrawalRequest.findUnique({
      where: { id: withdrawalId }
    });

    if (!withdrawal) {
      return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 });
    }

    // Update withdrawal status
    const updatedWithdrawal = await db.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status,
        transactionId,
        adminNotes,
        rejectionReason,
        processedAt: status === 'completed' ? new Date() : undefined
      }
    });

    // If rejected, refund the amount
    if (status === 'rejected' && withdrawal.status === 'pending') {
      await db.userWallet.update({
        where: { userId: withdrawal.userId },
        data: {
          availableBalance: { increment: withdrawal.amount },
          totalWithdrawn: { decrement: withdrawal.netAmount }
        }
      });
    }

    return NextResponse.json({
      success: true,
      withdrawal: updatedWithdrawal,
      message: status === 'completed' ? 'Withdrawal processed successfully!' : 'Withdrawal updated'
    });

  } catch (error) {
    console.error('Process withdrawal error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process withdrawal' }, { status: 500 });
  }
}
