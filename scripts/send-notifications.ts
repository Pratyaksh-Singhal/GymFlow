// scripts/send-notifications.ts
//import 'tsconfig-paths/register';
import 'dotenv/config';
import { prisma } from '../lib/prisma.ts';

async function sendNotifications() {
  console.log('🔔 Starting notification sending process...');

  try {
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        status: 'queued',
        retryCount: { lt: 3 },
        scheduledTime: { lte: new Date() },
      },
      include: {
        member: true,
        fee: true,
      },
      take: 50,
    });

    console.log(`📋 Found ${pendingNotifications.length} pending notifications`);

    for (const notification of pendingNotifications) {
      try {
        await sendNotification(notification);
        await markNotificationSent(notification.id);

        console.log(`✅ Sent notification ${notification.id} to ${notification.recipient}`);
      } catch (error) {
        console.error(`❌ Failed to send notification ${notification.id}:`, error);
        await incrementRetryCount(notification.id);
      }
    }

    console.log('✅ Notification sending process completed');
  } catch (error) {
    console.error('💥 Error in notification process:', error);
    process.exit(1);
  }
}

async function sendNotification(notification: any) {
  const { channel, recipient, messageBody, member } = notification;

  switch (channel) {
    case 'resend':
      await sendEmailViaResend(recipient, messageBody, member);
      break;

    case 'twilio':
      await sendSMSViaTwilio(recipient, messageBody);
      break;

    default:
      console.warn(`⚠️ Unknown channel: ${channel}`);
  }
}

async function sendEmailViaResend(email: string, message: string, member: any) {
  console.log(`📧 Sending email to ${email} for ${member.name}`);
  console.log(`Message: ${message}`);
}

async function sendSMSViaTwilio(phone: string, message: string) {
  console.log(`📱 Sending SMS to ${phone}`);
  console.log(`Message: ${message}`);
}

async function markNotificationSent(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: 'sent',
      sentTime: new Date(),
    },
  });
}

async function incrementRetryCount(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      retryCount: { increment: 1 },
      nextRetryTime: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
}

sendNotifications()
  .then(() => {
    console.log('🎉 Done');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Failed:', err);
    process.exit(1);
  });
