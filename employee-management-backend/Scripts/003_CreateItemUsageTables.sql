CREATE TABLE IF NOT EXISTS public."ItemUsageRecords" (
    "Id" SERIAL PRIMARY KEY,
    "EmployeeId" INTEGER NOT NULL,
    "TransactionDate" DATE NOT NULL, 
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_itemusagerecords_employee
        FOREIGN KEY("EmployeeId")
        REFERENCES public."Employees"("Id")
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_itemusagerecords_employeeid ON public."ItemUsageRecords"("EmployeeId");
CREATE INDEX IF NOT EXISTS idx_itemusagerecords_transactiondate ON public."ItemUsageRecords"("TransactionDate");


CREATE TABLE IF NOT EXISTS public."ItemUsageDetails" (
    "Id" SERIAL PRIMARY KEY,
    "ItemUsageRecordId" INTEGER NOT NULL,
    "ItemName" VARCHAR(255) NOT NULL,
    "Quantity" INTEGER NOT NULL,
 
    CONSTRAINT fk_itemusagedetails_record
        FOREIGN KEY("ItemUsageRecordId")
        REFERENCES public."ItemUsageRecords"("Id")
        ON DELETE CASCADE,
   
    CONSTRAINT chk_itemusagedetails_quantity CHECK ("Quantity" > 0)
);

CREATE INDEX IF NOT EXISTS idx_itemusagedetails_recordid ON public."ItemUsageDetails"("ItemUsageRecordId");
CREATE INDEX IF NOT EXISTS idx_itemusagedetails_itemname ON public."ItemUsageDetails"("ItemName");

DROP TRIGGER IF EXISTS update_itemusagerecords_updated_at ON public."ItemUsageRecords";
CREATE TRIGGER update_itemusagerecords_updated_at
BEFORE UPDATE ON public."ItemUsageRecords"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();