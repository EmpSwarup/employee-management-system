CREATE TABLE IF NOT EXISTS public."AttendanceRecords" (
    "Id" SERIAL PRIMARY KEY,
    "EmployeeId" INTEGER NOT NULL,
    "AttendanceDate" DATE NOT NULL,
    "Status" BOOLEAN NOT NULL,    
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_attendancerecords_employee
    FOREIGN KEY("EmployeeId")
    REFERENCES public."Employees"("Id")
    ON DELETE CASCADE,

    CONSTRAINT uq_employee_date UNIQUE ("EmployeeId", "AttendanceDate")
    );

CREATE INDEX IF NOT EXISTS idx_attendancerecords_employeeid_date ON public."AttendanceRecords"("EmployeeId", "AttendanceDate");
CREATE INDEX IF NOT EXISTS idx_attendancerecords_date ON public."AttendanceRecords"("AttendanceDate");

DROP TRIGGER IF EXISTS update_attendancerecords_updated_at ON public."AttendanceRecords";
CREATE TRIGGER update_attendancerecords_updated_at
    BEFORE UPDATE ON public."AttendanceRecords"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();