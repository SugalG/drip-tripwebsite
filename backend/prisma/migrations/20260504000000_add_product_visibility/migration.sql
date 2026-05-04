-- Additive visibility flag. Existing production products remain public by default.
ALTER TABLE "Product" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Product_branchId_isVisible_idx" ON "Product"("branchId", "isVisible");
