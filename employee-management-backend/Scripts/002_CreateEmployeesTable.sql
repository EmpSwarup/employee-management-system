CREATE TABLE IF NOT EXISTS public."Employees" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "Phone" VARCHAR(50) NULL,
    "Status" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_email ON public."Employees" ("Email");
CREATE INDEX IF NOT EXISTS idx_employees_status ON public."Employees" ("Status");

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."UpdatedAt" = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_employees_updated_at ON public."Employees";
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public."Employees"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();