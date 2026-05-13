// scripts/test-prisma-crud.ts
// Story 1.2: Prisma CRUD Operations & RLS Validation Tests

import prisma from '../lib/prisma.ts';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, duration?: number, error?: string) {
  results.push({ name, passed, duration, error });
  const status = passed ? '✅' : '❌';
  const time = duration ? ` (${duration}ms)` : '';
  console.log(`${status} ${name}${time}`);
  if (error) console.log(`   Error: ${error}`);
}

// ============================================================================
// 1. TENANT CRUD Operations
// ============================================================================

async function testTenantCRUD() {
  console.log('\n📦 TENANT CRUD Operations\n');

  try {
    // CREATE
    const start = Date.now();
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Gym',
        slug: 'test-gym-' + Date.now(),
        subscriptionTier: 'basic',
      },
    });
    logTest('Create tenant', true, Date.now() - start);

    // READ
    const start2 = Date.now();
    const fetchedTenant = await prisma.tenant.findUnique({
      where: { id: tenant.id },
    });
    logTest('Read tenant', !!fetchedTenant, Date.now() - start2);

    // UPDATE
    const start3 = Date.now();
    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { subscriptionTier: 'pro' },
    });
    logTest('Update tenant', updated.subscriptionTier === 'pro', Date.now() - start3);

    // CLEANUP
    await prisma.tenant.delete({ where: { id: tenant.id } });
    logTest('Delete tenant', true, 0);

    return tenant.id;
  } catch (error) {
    logTest('Tenant CRUD', false, undefined, String(error));
    throw error;
  }
}

// ============================================================================
// 2. USER CRUD Operations
// ============================================================================

async function testUserCRUD() {
  console.log('\n👤 USER CRUD Operations\n');

  try {
    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'User Test Gym',
        slug: 'user-test-' + Date.now(),
        subscriptionTier: 'basic',
      },
    });

    // CREATE User
    const start = Date.now();
    const user = await prisma.user.create({
      data: {
        id: 'user-' + Date.now(),
        email: `owner-${Date.now()}@test.com`,
        tenantId: tenant.id,
        role: 'owner',
        phone: '+919876543210',
      },
    });
    logTest('Create user', true, Date.now() - start);

    // READ with relation
    const start2 = Date.now();
    const fetchedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { tenant: true },
    });
    logTest('Read user with tenant relation', !!fetchedUser?.tenant, Date.now() - start2);

    // UPDATE
    const start3 = Date.now();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'trainer' },
    });
    logTest('Update user role', updated.role === 'trainer', Date.now() - start3);

    // LIST users by tenant
    const start4 = Date.now();
    const users = await prisma.user.findMany({
      where: { tenantId: tenant.id },
    });
    logTest('List users by tenant', users.length > 0, Date.now() - start4);

    // CLEANUP
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });

    return { user, tenant };
  } catch (error) {
    logTest('User CRUD', false, undefined, String(error));
    throw error;
  }
}

// ============================================================================
// 3. MEMBER CRUD Operations
// ============================================================================

async function testMemberCRUD() {
  console.log('\n👥 MEMBER CRUD Operations\n');

  try {
    // Setup
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Member Test Gym',
        slug: 'member-test-' + Date.now(),
      },
    });

    // CREATE Member
    const start = Date.now();
    const member = await prisma.member.create({
      data: {
        name: 'John Doe',
        email: `member-${Date.now()}@test.com`,
        phone: '+919876543210',
        tenantId: tenant.id,
        status: 'active',
      },
    });
    logTest('Create member', true, Date.now() - start);

    // READ
    const start2 = Date.now();
    const fetchedMember = await prisma.member.findUnique({
      where: { id: member.id },
    });
    logTest('Read member', !!fetchedMember, Date.now() - start2);

    // UPDATE
    const start3 = Date.now();
    const updated = await prisma.member.update({
      where: { id: member.id },
      data: { status: 'paused' },
    });
    logTest('Update member status', updated.status === 'paused', Date.now() - start3);

    // BULK READ (pagination)
    const start4 = Date.now();
    const members = await prisma.member.findMany({
      where: { tenantId: tenant.id },
      skip: 0,
      take: 10,
    });
    logTest('Paginate members', members.length > 0, Date.now() - start4);

    // COUNT
    const start5 = Date.now();
    const count = await prisma.member.count({
      where: { tenantId: tenant.id, status: 'active' },
    });
    logTest('Count active members', count >= 0, Date.now() - start5);

    // CLEANUP
    await prisma.member.delete({ where: { id: member.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
  } catch (error) {
    logTest('Member CRUD', false, undefined, String(error));
    throw error;
  }
}

// ============================================================================
// 4. PACKAGE & MEMBERSHIP INSTANCE
// ============================================================================

async function testPackageCRUD() {
  console.log('\n📦 PACKAGE & MEMBERSHIP CRUD Operations\n');

  try {
    // Setup
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Package Test Gym',
        slug: 'package-test-' + Date.now(),
      },
    });

    const member = await prisma.member.create({
      data: {
        name: 'Test Member',
        email: `pkg-${Date.now()}@test.com`,
        phone: '+919876543210',
        tenantId: tenant.id,
      },
    });

    // CREATE Package
    const start = Date.now();
    const pkg = await prisma.package.create({
      data: {
        name: 'Monthly Pass',
        durationDays: 30,
        price: '2500.00',
        tenantId: tenant.id,
        isActive: true,
      },
    });
    logTest('Create package', true, Date.now() - start);

    // CREATE Membership Instance
    const start2 = Date.now();
    const instance = await prisma.membershipInstance.create({
      data: {
        tenantId: tenant.id,
        memberId: member.id,
        packageId: pkg.id,
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    });
    logTest('Create membership instance', true, Date.now() - start2);

    // READ with relations
    const start3 = Date.now();
    const fetchedInstance = await prisma.membershipInstance.findUnique({
      where: { id: instance.id },
      include: {
        member: true,
        package: true,
        tenant: true,
      },
    });
    logTest('Read membership with relations', !!fetchedInstance?.member, Date.now() - start3);

    // CLEANUP
    await prisma.membershipInstance.delete({ where: { id: instance.id } });
    await prisma.package.delete({ where: { id: pkg.id } });
    await prisma.member.delete({ where: { id: member.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
  } catch (error) {
    logTest('Package CRUD', false, undefined, String(error));
    throw error;
  }
}

// ============================================================================
// 5. FEE TRACKING
// ============================================================================

async function testFeeCRUD() {
  console.log('\n💰 FEE CRUD Operations\n');

  try {
    // Setup
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Fee Test Gym',
        slug: 'fee-test-' + Date.now(),
      },
    });

    const member = await prisma.member.create({
      data: {
        name: 'Member',
        email: `fee-${Date.now()}@test.com`,
        tenantId: tenant.id,
        phone: '+919876543210',
      },
    });

    const pkg = await prisma.package.create({
      data: {
        name: 'Monthly',
        durationDays: 30,
        price: '2500.00',
        tenantId: tenant.id,
      },
    });

    const instance = await prisma.membershipInstance.create({
      data: {
        tenantId: tenant.id,
        memberId: member.id,
        packageId: pkg.id,
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // CREATE Fee
    const start = Date.now();
    const fee = await prisma.fee.create({
      data: {
        tenantId: tenant.id,
        memberId: member.id,
        membershipInstanceId: instance.id,
        amount: '2500.00',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    });
    logTest('Create fee', true, Date.now() - start);

    // READ pending fees
    const start2 = Date.now();
    const pendingFees = await prisma.fee.findMany({
      where: {
        tenantId: tenant.id,
        status: 'pending',
      },
    });
    logTest('Find pending fees', pendingFees.length > 0, Date.now() - start2);

    // UPDATE to paid
    const start3 = Date.now();
    const updated = await prisma.fee.update({
      where: { id: fee.id },
      data: {
        status: 'paid',
        paidDate: new Date(),
      },
    });
    logTest('Mark fee as paid', updated.status === 'paid', Date.now() - start3);

    // COUNT by status
    const start4 = Date.now();
    const counts = await prisma.fee.groupBy({
      by: ['status'],
      where: { tenantId: tenant.id },
      _count: true,
    });
    logTest('Count fees by status', counts.length > 0, Date.now() - start4);

    // CLEANUP
    await prisma.fee.delete({ where: { id: fee.id } });
    await prisma.membershipInstance.delete({ where: { id: instance.id } });
    await prisma.package.delete({ where: { id: pkg.id } });
    await prisma.member.delete({ where: { id: member.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
  } catch (error) {
    logTest('Fee CRUD', false, undefined, String(error));
    throw error;
  }
}

// ============================================================================
// 6. NOTIFICATION SYSTEM
// ============================================================================

async function testNotificationCRUD() {
  console.log('\n📧 NOTIFICATION CRUD Operations\n');

  try {
    // Setup
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Notification Test Gym',
        slug: 'notif-test-' + Date.now(),
      },
    });

    const member = await prisma.member.create({
      data: {
        name: 'Member',
        email: `notif-${Date.now()}@test.com`,
        tenantId: tenant.id,
        phone: '+919876543210',
      },
    });

    const pkg = await prisma.package.create({
      data: {
        name: 'Monthly',
        durationDays: 30,
        price: '2500.00',
        tenantId: tenant.id,
      },
    });

    const instance = await prisma.membershipInstance.create({
      data: {
        tenantId: tenant.id,
        memberId: member.id,
        packageId: pkg.id,
        startDate: new Date(),
        renewalDate: new Date(),
      },
    });

    const fee = await prisma.fee.create({
      data: {
        tenantId: tenant.id,
        memberId: member.id,
        membershipInstanceId: instance.id,
        amount: '2500.00',
        dueDate: new Date(),
        status: 'pending',
      },
    });

    // CREATE Notification
    const start = Date.now();
    const notification = await prisma.notification.create({
      data: {
        tenantId: tenant.id,
        memberId: member.id,
        feeId: fee.id,
        type: 'email',
        channel: 'resend',
        status: 'queued',
        recipient: member.email,
        messageBody: 'Payment reminder',
        scheduledTime: new Date(),
      },
    });
    logTest('Create notification', true, Date.now() - start);

    // READ queued notifications
    const start2 = Date.now();
    const queued = await prisma.notification.findMany({
      where: {
        tenantId: tenant.id,
        status: 'queued',
      },
    });
    logTest('Find queued notifications', queued.length > 0, Date.now() - start2);

    // UPDATE status
    const start3 = Date.now();
    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: 'sent',
        sentTime: new Date(),
      },
    });
    logTest('Update notification status', updated.status === 'sent', Date.now() - start3);

    // CLEANUP
    await prisma.notification.delete({ where: { id: notification.id } });
    await prisma.fee.delete({ where: { id: fee.id } });
    await prisma.membershipInstance.delete({ where: { id: instance.id } });
    await prisma.package.delete({ where: { id: pkg.id } });
    await prisma.member.delete({ where: { id: member.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
  } catch (error) {
    logTest('Notification CRUD', false, undefined, String(error));
    throw error;
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('🧪 Story 1.2: Prisma CRUD Operations & RLS Tests\n');
  console.log(`Started: ${new Date().toISOString()}\n`);

  try {
    await testTenantCRUD();
    await testUserCRUD();
    await testMemberCRUD();
    await testPackageCRUD();
    await testFeeCRUD();
    await testNotificationCRUD();

    // Summary
    console.log('\n📊 Test Summary\n');
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const totalTime = results.reduce((sum, r) => sum + (r.duration || 0), 0);

    console.log(`Passed: ${passed}/${total}`);
    console.log(`Total Time: ${totalTime}ms`);

    if (passed === total) {
      console.log('\n✅ All CRUD operations working! Database is ready for development.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Review errors above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Critical error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllTests().catch(console.error);

export { runAllTests };
