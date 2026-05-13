// scripts/seed.ts
// Story 1.2: Seed Development Database with Test Data
import prisma from '../lib/prisma.ts';

async function seed() {
  console.log('🌱 Seeding development database...\n');

  try {
    // ============================================================================
    // 1. Create Test Gym (Tenant)
    // ============================================================================

    console.log('📦 Creating tenant...');
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Iron Gym',
        slug: 'iron-gym',
        subscriptionTier: 'pro',
      },
    });
    console.log(`   ✅ Created tenant: ${tenant.name} (ID: ${tenant.id})\n`);

    // ============================================================================
    // 2. Create Users (Owner, Trainers, Members)
    // ============================================================================

    console.log('👤 Creating users...');

    const owner = await prisma.user.create({
      data: {
        id: 'owner-001',
        email: 'owner@irongym.local',
        tenantId: tenant.id,
        role: 'owner',
        phone: '+919876543210',
        dateOfBirth: new Date('1990-01-15'),
      },
    });
    console.log(`   ✅ Owner: ${owner.email}`);

    const trainer1 = await prisma.user.create({
      data: {
        id: 'trainer-001',
        email: 'trainer1@irongym.local',
        tenantId: tenant.id,
        role: 'trainer',
        phone: '+919876543211',
        dateOfBirth: new Date('1992-05-20'),
      },
    });
    console.log(`   ✅ Trainer 1: ${trainer1.email}`);

    const trainer2 = await prisma.user.create({
      data: {
        id: 'trainer-002',
        email: 'trainer2@irongym.local',
        tenantId: tenant.id,
        role: 'trainer',
        phone: '+919876543212',
        dateOfBirth: new Date('1995-08-10'),
      },
    });
    console.log(`   ✅ Trainer 2: ${trainer2.email}\n`);

    // ============================================================================
    // 3. Create Membership Packages
    // ============================================================================

    console.log('📦 Creating membership packages...');

    const monthlyPkg = await prisma.package.create({
      data: {
        name: 'Monthly',
        durationDays: 30,
        price: '2500.00',
        description: 'Access to gym for 30 days',
        tenantId: tenant.id,
        isActive: true,
      },
    });
    console.log(`   ✅ Monthly: ₹${monthlyPkg.price}`);

    const quarterlyPkg = await prisma.package.create({
      data: {
        name: 'Quarterly',
        durationDays: 90,
        price: '6500.00',
        description: 'Access to gym for 90 days',
        tenantId: tenant.id,
        isActive: true,
      },
    });
    console.log(`   ✅ Quarterly: ₹${quarterlyPkg.price}`);

    const annualPkg = await prisma.package.create({
      data: {
        name: 'Annual',
        durationDays: 365,
        price: '20000.00',
        description: 'Access to gym for 365 days',
        tenantId: tenant.id,
        isActive: true,
      },
    });
    console.log(`   ✅ Annual: ₹${annualPkg.price}\n`);

    // ============================================================================
    // 4. Create Members
    // ============================================================================

    console.log('👥 Creating members...');

    const members = await Promise.all([
      prisma.member.create({
        data: {
          name: 'Arjun Singh',
          email: 'arjun@test.local',
          phone: '+919888111111',
          tenantId: tenant.id,
          status: 'active',
          assignedTrainerId: trainer1.id,
          dateOfBirth: new Date('1998-03-15'),
        },
      }),
      prisma.member.create({
        data: {
          name: 'Priya Sharma',
          email: 'priya@test.local',
          phone: '+919888111112',
          tenantId: tenant.id,
          status: 'active',
          assignedTrainerId: trainer1.id,
          dateOfBirth: new Date('2000-07-22'),
        },
      }),
      prisma.member.create({
        data: {
          name: 'Rahul Patel',
          email: 'rahul@test.local',
          phone: '+919888111113',
          tenantId: tenant.id,
          status: 'active',
          assignedTrainerId: trainer2.id,
          dateOfBirth: new Date('1995-11-10'),
        },
      }),
      prisma.member.create({
        data: {
          name: 'Deepika Gupta',
          email: 'deepika@test.local',
          phone: '+919888111114',
          tenantId: tenant.id,
          status: 'active',
          assignedTrainerId: trainer2.id,
          dateOfBirth: new Date('1997-09-05'),
        },
      }),
      prisma.member.create({
        data: {
          name: 'Vikram Das',
          email: 'vikram@test.local',
          phone: '+919888111115',
          tenantId: tenant.id,
          status: 'paused',
          dateOfBirth: new Date('1992-01-30'),
        },
      }),
    ]);

    members.forEach((m) => console.log(`   ✅ ${m.name} (${m.status})`));
    console.log();

    // ============================================================================
    // 5. Create Membership Instances
    // ============================================================================

    console.log('📅 Creating membership instances...');

    const now = new Date();
    const instances = await Promise.all([
      // Arjun - Monthly (active)
      prisma.membershipInstance.create({
        data: {
          tenantId: tenant.id,
          memberId: members[0].id,
          packageId: monthlyPkg.id,
          startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          renewalDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          status: 'active',
        },
      }),
      // Priya - Quarterly (active)
      prisma.membershipInstance.create({
        data: {
          tenantId: tenant.id,
          memberId: members[1].id,
          packageId: quarterlyPkg.id,
          startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          renewalDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          status: 'active',
        },
      }),
      // Rahul - Annual (active)
      prisma.membershipInstance.create({
        data: {
          tenantId: tenant.id,
          memberId: members[2].id,
          packageId: annualPkg.id,
          startDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
          renewalDate: new Date(now.getTime() + 185 * 24 * 60 * 60 * 1000),
          status: 'active',
        },
      }),
      // Deepika - Monthly (expiring soon)
      prisma.membershipInstance.create({
        data: {
          tenantId: tenant.id,
          memberId: members[3].id,
          packageId: monthlyPkg.id,
          startDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
          renewalDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
          status: 'active',
        },
      }),
      // Vikram - Monthly (paused)
      prisma.membershipInstance.create({
        data: {
          tenantId: tenant.id,
          memberId: members[4].id,
          packageId: monthlyPkg.id,
          startDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
          renewalDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
          status: 'paused',
        },
      }),
    ]);

    instances.forEach((inst, idx) => {
      const daysLeft = Math.round(
        (inst.renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      console.log(`   ✅ ${members[idx].name}: ${inst.status} (renews in ${daysLeft} days)`);
    });
    console.log();

    // ============================================================================
    // 6. Create Fees
    // ============================================================================

    console.log('💰 Creating fees...');

    const fees = await Promise.all([
      // Arjun - Pending (due in 1 week)
      prisma.fee.create({
        data: {
          tenantId: tenant.id,
          memberId: members[0].id,
          membershipInstanceId: instances[0].id,
          amount: monthlyPkg.price,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          status: 'pending',
        },
      }),
      // Priya - Paid (paid yesterday)
      prisma.fee.create({
        data: {
          tenantId: tenant.id,
          memberId: members[1].id,
          membershipInstanceId: instances[1].id,
          amount: quarterlyPkg.price,
          dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          status: 'paid',
          paidDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          paidByUserId: trainer1.id,
        },
      }),
      // Rahul - Overdue (due 5 days ago)
      prisma.fee.create({
        data: {
          tenantId: tenant.id,
          memberId: members[2].id,
          membershipInstanceId: instances[2].id,
          amount: annualPkg.price,
          dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          status: 'overdue',
        },
      }),
      // Deepika - Pending (due tomorrow)
      prisma.fee.create({
        data: {
          tenantId: tenant.id,
          memberId: members[3].id,
          membershipInstanceId: instances[3].id,
          amount: monthlyPkg.price,
          dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
          status: 'pending',
        },
      }),
      // Vikram - Overdue (due 20 days ago)
      prisma.fee.create({
        data: {
          tenantId: tenant.id,
          memberId: members[4].id,
          membershipInstanceId: instances[4].id,
          amount: monthlyPkg.price,
          dueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
          status: 'overdue',
        },
      }),
    ]);

    fees.forEach((f, idx) => {
      console.log(`   ✅ ${members[idx].name}: ₹${f.amount} (${f.status})`);
    });
    console.log();

    // ============================================================================
    // 7. Create Notifications
    // ============================================================================

    console.log('📧 Creating notifications...');

    const notifications = await Promise.all([
      // 7-day reminder for Arjun
      prisma.notification.create({
        data: {
          tenantId: tenant.id,
          memberId: members[0].id,
          feeId: fees[0].id,
          type: 'email',
          channel: 'resend',
          status: 'queued',
          recipient: members[0].email,
          messageBody: `Your fee of ₹${monthlyPkg.price} is due in 7 days.`,
          scheduledTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
      // SMS reminder for Deepika
      prisma.notification.create({
        data: {
          tenantId: tenant.id,
          memberId: members[3].id,
          feeId: fees[3].id,
          type: 'sms',
          channel: 'twilio',
          status: 'queued',
          recipient: members[3].phone,
          messageBody: `Reminder: Your gym fee is due tomorrow.`,
          scheduledTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        },
      }),
      // Overdue notice for Vikram
      prisma.notification.create({
        data: {
          tenantId: tenant.id,
          memberId: members[4].id,
          feeId: fees[4].id,
          type: 'email',
          channel: 'resend',
          status: 'sent',
          recipient: members[4].email,
          messageBody: `Your fee is overdue. Please pay immediately.`,
          scheduledTime: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
          sentTime: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    notifications.forEach((n, idx) => {
      console.log(`   ✅ ${n.type.toUpperCase()} to ${members[idx].name} (${n.status})`);
    });
    console.log();

    // ============================================================================
    // Summary
    // ============================================================================

    console.log('✅ Seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Tenants: 1`);
    console.log(`   - Users: 3 (1 owner, 2 trainers)`);
    console.log(`   - Packages: 3`);
    console.log(`   - Members: 5`);
    console.log(`   - Memberships: 5`);
    console.log(`   - Fees: 5`);
    console.log(`   - Notifications: 3\n`);

    console.log('🔑 Login Credentials (for testing):');
    console.log(`   Email: owner@irongym.local`);
    console.log(`   Password: (set in Supabase Auth)\n`);

    console.log('📝 Development Notes:');
    console.log('   - All IDs use CUID format');
    console.log('   - Dates are relative to current time');
    console.log('   - Status values: active, paused, paid, pending, overdue');
    console.log('   - Member phones and emails are for testing only\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
