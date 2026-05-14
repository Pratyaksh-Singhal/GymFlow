// scripts/process-fee-reminders.ts
// Scheduled task: Process fee reminders and create notifications
// Runs daily at 9 AM via GitHub Actions

import 'dotenv/config';
import { prisma } from '../lib/prisma.ts';

async function processFeeReminders() {
  console.log('💰 Starting fee reminder processing...');

  try {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Find fees that are due soon (within 7 days) and haven't been reminded yet
    const upcomingFees = await prisma.fee.findMany({
      where: {
        status: 'pending',
        dueDate: {
          gte: today,
          lte: sevenDaysFromNow,
        },
        // Check if we haven't sent a reminder recently
        notifications: {
          none: {
            type: 'fee_reminder',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
            },
          },
        },
      },
      include: {
        member: true,
        membershipInstance: {
          include: {
            package: true,
          },
        },
      },
    });

    console.log(`📋 Found ${upcomingFees.length} fees requiring reminders`);

    for (const fee of upcomingFees) {
      try {
        await createFeeReminderNotification(fee);
        console.log(`✅ Created reminder for fee ${fee.id} (${fee.member.name})`);
      } catch (error) {
        console.error(`❌ Failed to create reminder for fee ${fee.id}:`, error);
      }
    }

    // Also check for overdue fees (past due date)
    const overdueFees = await prisma.fee.findMany({
      where: {
        status: 'pending',
        dueDate: {
          lt: today,
        },
        // Haven't sent overdue notification in last 24 hours
        notifications: {
          none: {
            type: 'payment_overdue',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        },
      },
      include: {
        member: true,
        membershipInstance: {
          include: {
            package: true,
          },
        },
      },
    });

    console.log(`⚠️ Found ${overdueFees.length} overdue fees`);

    for (const fee of overdueFees) {
      try {
        await createOverdueNotification(fee);
        console.log(`🚨 Created overdue notification for fee ${fee.id} (${fee.member.name})`);
      } catch (error) {
        console.error(`❌ Failed to create overdue notification for fee ${fee.id}:`, error);
      }
    }

    console.log('✅ Fee reminder processing completed');
  } catch (error) {
    console.error('💥 Error in fee reminder processing:', error);
    process.exit(1);
  }
}

async function createFeeReminderNotification(fee: any) {
  const daysUntilDue = Math.ceil((fee.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  let messageBody = '';

  if (daysUntilDue <= 1) {
    messageBody = `Your fee payment is due tomorrow (${fee.dueDate.toDateString()}). Amount: ₹${fee.amount}`;
  } else if (daysUntilDue <= 3) {
    messageBody = `Your fee payment is due in ${daysUntilDue} days (${fee.dueDate.toDateString()}). Amount: ₹${fee.amount}`;
  } else {
    messageBody = `Your fee payment is due in ${daysUntilDue} days (${fee.dueDate.toDateString()}). Amount: ₹${fee.amount}`;
  }

  await prisma.notification.create({
    data: {
      tenantId: fee.tenantId,
      memberId: fee.memberId,
      feeId: fee.id,
      type: 'email',
      channel: 'resend',
      recipient: fee.member.email,
      messageBody,
      scheduledTime: new Date(), // Send immediately
    },
  });
}

async function createOverdueNotification(fee: any) {
  const daysOverdue = Math.floor((Date.now() - fee.dueDate.getTime()) / (1000 * 60 * 60 * 24));

  const messageBody = `Your fee payment is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue. Amount: ₹${fee.amount}. Please make payment immediately to avoid service interruption.`;

  await prisma.notification.create({
    data: {
      tenantId: fee.tenantId,
      memberId: fee.memberId,
      feeId: fee.id,
      type: 'email',
      channel: 'resend',
      recipient: fee.member.email,
      messageBody,
      scheduledTime: new Date(), // Send immediately
    },
  });
}

// Run the script
processFeeReminders()
  .then(() => {
    console.log('🎉 Fee reminder processing completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fee reminder processing failed:', error);
    process.exit(1);
  });
