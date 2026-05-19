import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  extractTenantContext,
  validateTenantAccess,
} from '@/lib/api-response';

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId, userRole } = extractTenantContext(request.headers);

    if (!validateTenantAccess(params.tenantId, tenantId, userRole)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tenant', 403);
    }

    // Define scanning range: from past up to 7 days in the future
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + 7);

    // Fetch active membership instances for this tenant
    const activeInstances = await prisma.membershipInstance.findMany({
      where: {
        tenantId: params.tenantId,
        status: 'active',
        renewalDate: {
          lte: thresholdDate,
        },
      },
      include: {
        package: true,
        fees: true,
      },
    });

    let generatedCount = 0;
    const generatedFees = [];

    for (const instance of activeInstances) {
      // Check if a fee has already been generated for this specific renewal cycle/date
      const alreadyBilled = instance.fees.some(
        (fee) =>
          new Date(fee.dueDate).toDateString() === new Date(instance.renewalDate).toDateString()
      );

      if (!alreadyBilled) {
        const newFee = await prisma.fee.create({
          data: {
            tenantId: params.tenantId,
            memberId: instance.memberId,
            membershipInstanceId: instance.id,
            amount: instance.package.price,
            dueDate: instance.renewalDate,
            status: 'pending',
          },
        });
        generatedFees.push(newFee);
        generatedCount++;
      }
    }

    return successResponse({
      message: `Billing scan completed successfully.`,
      scannedCount: activeInstances.length,
      generatedCount,
    });
  } catch (error) {
    console.error('[Fees Generate POST]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to run auto-billing generation scan', 500);
  }
}
