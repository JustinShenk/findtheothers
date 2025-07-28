-- Add indexes for performance optimization

-- Indexes for Initiative table
CREATE INDEX "Initiative_stars_idx" ON "Initiative"("stars" DESC);
CREATE INDEX "Initiative_lastActivityAt_idx" ON "Initiative"("lastActivityAt" DESC);
CREATE INDEX "Initiative_causeId_stars_idx" ON "Initiative"("causeId", "stars" DESC);

-- Indexes for Contributor table
CREATE INDEX "Contributor_lastActiveAt_idx" ON "Contributor"("lastActiveAt" DESC);
CREATE INDEX "Contributor_githubUsername_idx" ON "Contributor"("githubUsername");

-- Indexes for Cause table
CREATE INDEX "Cause_impactScore_idx" ON "Cause"("impactScore" DESC);
CREATE INDEX "Cause_slug_idx" ON "Cause"("slug");

-- Indexes for search functionality
CREATE INDEX "Initiative_name_idx" ON "Initiative"("name");
CREATE INDEX "Initiative_description_idx" ON "Initiative"("description");
CREATE INDEX "Cause_name_idx" ON "Cause"("name");
CREATE INDEX "Cause_description_idx" ON "Cause"("description");
CREATE INDEX "Contributor_name_idx" ON "Contributor"("name");

-- Composite indexes for common queries
CREATE INDEX "CoordinationOpportunity_status_causeId_idx" ON "CoordinationOpportunity"("status", "causeId");
CREATE INDEX "PrecomputedPCA_causeId_initiativeId_idx" ON "PrecomputedPCA"("causeId", "initiativeId");