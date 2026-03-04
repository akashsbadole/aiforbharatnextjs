import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get wallet balance and transactions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // Get or create wallet
    let wallet = await db.userWallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await db.userWallet.create({
        data: {
          userId,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0
        }
      });
    }

    // Get recent withdrawals
    const withdrawals = await db.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      wallet: {
        ...wallet,
        id: wallet.id,
        availableBalance: wallet.availableBalance,
        pendingBalance: wallet.pendingBalance,
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn
      },
      withdrawals
    });

  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch wallet' }, { status: 500 });
  }
}

// POST - Add money to wallet
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, amount, type, description } = data;

    if (!userId || !amount) {
      return NextResponse.json({ success: false, error: 'User ID and amount required' }, { status: 400 });
    }

    // Get or create wallet
    let wallet = await db.userWallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await db.userWallet.create({
        data: {
          userId,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0
        }
      });
    }

    // Update wallet balance
    const updatedWallet = await db.userWallet.update({
      where: { userId },
      data: {
        availableBalance: { increment: amount },
        totalEarned: type === 'credit' ? { increment: amount } : undefined
      }
    });

    return NextResponse.json({
      success: true,
      wallet: updatedWallet,
      message: `₹${amount} added to wallet`
    });

  } catch (error) {
    console.error('Wallet update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update wallet' }, { status: 500 });
  }
}

// PUT - Update bank details
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, bankName, accountNumber, ifscCode, accountHolderName } = data;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const wallet = await db.userWallet.update({
      where: { userId },
      data: {
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
        isVerified: true
      }
    });

    return NextResponse.json({
      success: true,
      wallet,
      message: 'Bank details updated successfully'
    });

  } catch (error) {
    console.error('Bank details update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update bank details' }, { status: 500 });
  }
}
