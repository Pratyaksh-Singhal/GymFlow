-- ============================================================================
-- Story 1.1: Row-Level Security (RLS) Policies
-- Prisma-compatible version
-- ============================================================================

-- ============================================================================
-- 1. Enable RLS on all tenant-scoped tables
-- ============================================================================

ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Package" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Fee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MembershipInstance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationDeadLetterQueue" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. RLS Policies for MEMBER table
-- ============================================================================

-- Owner sees only their tenant members
CREATE POLICY "Owner sees own tenant members"
ON "Member"
FOR ALL
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
)
WITH CHECK (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
);

-- Trainer sees assigned members
CREATE POLICY "Trainer sees assigned members"
ON "Member"
FOR SELECT
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'trainer'
  )
  AND (
    "assignedTrainerId" = auth.uid()::text
    OR "assignedTrainerId" IS NULL
  )
);

-- Trainer updates assigned members
CREATE POLICY "Trainer updates assigned members"
ON "Member"
FOR UPDATE
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'trainer'
  )
  AND "assignedTrainerId" = auth.uid()::text
);

-- Member sees own profile
CREATE POLICY "Member sees own profile"
ON "Member"
FOR SELECT
USING (
  "userId" = auth.uid()::text
);

-- ============================================================================
-- 3. RLS Policies for PACKAGE table
-- ============================================================================

CREATE POLICY "Owner sees own tenant packages"
ON "Package"
FOR ALL
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
)
WITH CHECK (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
);

CREATE POLICY "Users see active packages"
ON "Package"
FOR SELECT
USING (
  "isActive" = true
  AND "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
  )
);

-- ============================================================================
-- 4. RLS Policies for FEE table
-- ============================================================================

CREATE POLICY "Owner sees all tenant fees"
ON "Fee"
FOR ALL
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
)
WITH CHECK (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
);

CREATE POLICY "Trainer sees assigned member fees"
ON "Fee"
FOR SELECT
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'trainer'
  )
  AND "memberId" IN (
    SELECT id
    FROM "Member"
    WHERE "assignedTrainerId" = auth.uid()::text
  )
);

CREATE POLICY "Trainer marks assigned member fees paid"
ON "Fee"
FOR UPDATE
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'trainer'
  )
  AND "memberId" IN (
    SELECT id
    FROM "Member"
    WHERE "assignedTrainerId" = auth.uid()::text
  )
)
WITH CHECK (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'trainer'
  )
  AND "memberId" IN (
    SELECT id
    FROM "Member"
    WHERE "assignedTrainerId" = auth.uid()::text
  )
);

CREATE POLICY "Member sees own fees"
ON "Fee"
FOR SELECT
USING (
  "memberId" IN (
    SELECT id
    FROM "Member"
    WHERE "userId" = auth.uid()::text
  )
);

-- ============================================================================
-- 5. RLS Policies for NOTIFICATION table
-- ============================================================================

CREATE POLICY "Owner sees all notifications"
ON "Notification"
FOR ALL
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
)
WITH CHECK (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
);

CREATE POLICY "Member sees own notifications"
ON "Notification"
FOR SELECT
USING (
  "memberId" IN (
    SELECT id
    FROM "Member"
    WHERE "userId" = auth.uid()::text
  )
);

-- ============================================================================
-- 6. RLS Policies for MEMBERSHIP INSTANCE table
-- ============================================================================

CREATE POLICY "Owner sees all instances"
ON "MembershipInstance"
FOR ALL
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
)
WITH CHECK (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
);

CREATE POLICY "Member sees own instances"
ON "MembershipInstance"
FOR SELECT
USING (
  "memberId" IN (
    SELECT id
    FROM "Member"
    WHERE "userId" = auth.uid()::text
  )
);

-- ============================================================================
-- 7. RLS Policies for DEAD LETTER QUEUE
-- ============================================================================

CREATE POLICY "Owner sees DLQ messages"
ON "NotificationDeadLetterQueue"
FOR ALL
USING (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
)
WITH CHECK (
  "tenantId" = (
    SELECT "tenantId"
    FROM "User"
    WHERE id = auth.uid()::text
      AND role = 'owner'
  )
);

-- ============================================================================
-- 8. Verify RLS Status
-- ============================================================================

SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'Member',
    'Package',
    'Fee',
    'Notification',
    'MembershipInstance',
    'NotificationDeadLetterQueue'
  )
ORDER BY tablename;