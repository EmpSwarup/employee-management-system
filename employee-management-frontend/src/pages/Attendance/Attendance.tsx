import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Link } from "react-router";
import { getEmployeeSelectList } from "@/services/employeeService";
import {
  getMonthlyAttendance,
  saveMonthlyAttendance,
} from "@/services/attendanceService";
import {
  EmployeeSelectItemDto,
  MonthlyAttendance,
  SaveAttendanceDto,
} from "@/types/types";
import { format, getDaysInMonth, getDay, parse, startOfMonth } from "date-fns";
import {
  CalendarCheck,
  Save,
  RefreshCw,
  WifiOff,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { getInitials } from "@/constants/mockdata";

const Attendance: React.FC = () => {
  // --- STATE DECLARATIONS ---
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(currentDate, "yyyy-MM")
  );
  const [employees, setEmployees] = useState<EmployeeSelectItemDto[]>([]);
  const [attendance, setAttendance] = useState<MonthlyAttendance>({});
  const [isEmployeesLoading, setIsEmployeesLoading] = useState<boolean>(true);
  const [isAttendanceLoading, setIsAttendanceLoading] =
    useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  
  const prevIsEmployeesLoading = useRef<boolean>(isEmployeesLoading);

  const currentMonthData = useMemo(() => {
    const dateObj = parse(selectedMonth, "yyyy-MM", new Date());
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const daysCount = getDaysInMonth(dateObj);
    const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);
    const firstDayOfMonth = startOfMonth(dateObj);
    // console.log(`AttendancePage: Memoizing Month Data for ${selectedMonth}`, { year, month, daysCount });
    return { year, month, daysCount, daysArray, firstDayOfMonth };
  }, [selectedMonth]);

  // fetch employees once
  const fetchEmployees = useCallback(async () => {
    console.log("fetchEmployees: START");
    setIsEmployeesLoading(true);
    setError(null);
    try {
      const data = await getEmployeeSelectList();
      console.log("fetchEmployees: SUCCESS", data);
      setEmployees(data);
    } catch (err) {
      console.error("fetchEmployees: ERROR", err);
      setError(
        "Failed to load employee list. Attendance cannot be shown or marked."
      );
    } finally {
      console.log("fetchEmployees: FINALLY");
      setIsEmployeesLoading(false);
    }
  }, []);

  const isLoadingRef = useRef(false);

  const fetchAttendance = useCallback(
    async (year: number, month: number) => {
      if (isLoadingRef.current) {
        console.log("fetchAttendance: Already loading, skipping.");
        return;
      }

      console.log(`fetchAttendance: START for ${year}-${month}`);
      setIsAttendanceLoading(true);
      isLoadingRef.current = true; 

      try {
        const data = await getMonthlyAttendance(year, month);
        console.log(`fetchAttendance: SUCCESS for ${year}-${month}`, data);
        setAttendance(data.attendanceData || {});
        setError(null);
      } catch (err) {
        const monthName = format(currentMonthData.firstDayOfMonth, "MMMM yyyy");
        console.error(`fetchAttendance: ERROR for ${year}-${month}`, err);
        setError(`Failed to load attendance data for ${monthName}.`);
        setAttendance({});
      } finally {
        console.log(`fetchAttendance: FINALLY for ${year}-${month}`);
        setIsAttendanceLoading(false);
        isLoadingRef.current = false; // Reset ref
      }
    },
    [currentMonthData.firstDayOfMonth]
  );

  // load employee
  useEffect(() => {
    console.log(
      "Effect [fetchEmployees]: Component mounted, calling fetchEmployees."
    );
    fetchEmployees();
  }, [fetchEmployees]);

  // trigger attendance fetch
  useEffect(() => {
    console.log("Effect [Trigger Attendance Fetch] Checking conditions...", {
      currentIsEmployeesLoading: isEmployeesLoading,
      previousIsEmployeesLoading: prevIsEmployeesLoading.current,
      employeesLength: employees.length,
      hasError: !!error,
      year: currentMonthData.year,
      month: currentMonthData.month,
    });

    // check if employee finsihed loading
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const employeesJustLoaded =
      prevIsEmployeesLoading.current === true && isEmployeesLoading === false;

    // Condition to check if we should fetch
    const shouldFetch = !isEmployeesLoading && employees.length > 0 && !error;

    if (shouldFetch) {
      // Trigger fetch if the month changed OR if employees just loaded
      
      console.log(
        "Effect [Trigger Attendance Fetch]: Conditions MET (Employees loaded, no error). Triggering fetch."
      );
      fetchAttendance(currentMonthData.year, currentMonthData.month);
    } else if (!isEmployeesLoading && employees.length === 0 && !error) {
      // Handle state if employee loading finished with no employees
      console.log(
        "Effect [Trigger Attendance Fetch]: Employee load finished, no employees, clearing attendance."
      );
      setAttendance({});
      if (isAttendanceLoading) setIsAttendanceLoading(false);
    } else {
      // Log why fetch didn't happen
      let reason = "Conditions NOT MET.";
      if (isEmployeesLoading) reason += " Still loading employees.";
      if (error && !isEmployeesLoading)
        reason += ` An error exists ('${error}') preventing fetch.`;
      if (employees.length === 0 && !isEmployeesLoading && !error)
        reason += " No employees available.";
      console.log(`Effect [Trigger Attendance Fetch]: ${reason}`);
    }
 
    prevIsEmployeesLoading.current = isEmployeesLoading;
 
  }, [
    isEmployeesLoading,
    employees.length,
    currentMonthData.year,
    currentMonthData.month, 
    fetchAttendance,
    error,
  ]);

  // Handle Checkbox Change
  const handleAttendanceChange = (
    employeeId: number,
    day: number,
    checked: boolean
  ) => {
    console.log(
      `Attendance Change: EmpID=${employeeId}, Day=${day}, Checked=${checked}`
    );
    setAttendance((prev) => {
      const currentEmpData = prev[employeeId] || {};
      const newEmpData = { ...currentEmpData, [day]: checked };
      return { ...prev, [employeeId]: newEmpData };
    });
  };

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    console.log("handleSave: START", { selectedMonth, attendance });
    try {
      const payload: SaveAttendanceDto = {
        Month: selectedMonth,
        AttendanceData: attendance,
      };
      await saveMonthlyAttendance(payload);
      console.log("handleSave: SUCCESS");
     
      toast.success("Attendance Saved", {
        description: `Attendance for ${format(
          currentMonthData.firstDayOfMonth,
          "MMMM yyyy"
        )} saved successfully.`,
        duration: 3000,
      });
   
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("handleSave: ERROR", err);
      // setError("Failed to save attendance data. Please try again."); // Still optionally set general error
      
      toast.error("Save Failed", {
        description:
          err.response?.data?.message ||
          "Could not save attendance data. Please check connection or try again.",
        duration: 5000,
      });
      // -----------------------------
    } finally {
      console.log("handleSave: FINALLY");
      setIsSaving(false);
    }
  };

  // month options
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      return {
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy"),
      };
    });
  }, [currentDate]);
  
  const renderTableContent = () => {
    // console.log("renderTableContent: Rendering...", { isAttendanceLoading, error });

    if (isAttendanceLoading) {
      return (
        <div className="flex h-60 items-center justify-center text-center p-6">
          <RefreshCw className="mr-3 h-6 w-6 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">
            Loading Attendance Data...
          </span>
        </div>
      );
    }

    if (error && !isAttendanceLoading && !isEmployeesLoading) {
      return (
        <div className="p-6">
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-1">Error Loading Attendance</p>
              {error}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  fetchAttendance(currentMonthData.year, currentMonthData.month)
                }
                className="mt-3"
              >
                <RefreshCw className="mr-2 h-3 w-3" /> Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // table
    return (
      <div className="overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 whitespace-nowrap bg-gray-100 dark:bg-slate-800 min-w-[200px] px-4 py-3">
                Employee
              </TableHead>
              {currentMonthData.daysArray.map((day) => {
                const dayDate = new Date(
                  currentMonthData.year,
                  currentMonthData.month - 1,
                  day
                );
                const dayAbbr = format(dayDate, "EEE");
                const isWeekend =
                  getDay(dayDate) === 0 || getDay(dayDate) === 6;
                return (
                  <TableHead
                    key={day}
                    className={cn(
                      "w-12 p-1 text-center text-xs font-medium",
                      isWeekend && "bg-muted/50"
                    )}
                  >
                    <div className="flex flex-col items-center leading-tight">
                      <span>{day}</span>
                      <span className="text-[10px] font-normal text-muted-foreground">
                        {dayAbbr}
                      </span>
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="sticky left-0 z-10 whitespace-nowrap bg-background dark:bg-slate-900 px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{employee.name}</span>
                  </div>
                </TableCell>
                {currentMonthData.daysArray.map((day) => {
                  const dayDate = new Date(
                    currentMonthData.year,
                    currentMonthData.month - 1,
                    day
                  );
                  const isWeekend =
                    getDay(dayDate) === 0 || getDay(dayDate) === 6;
                  return (
                    <TableCell
                      key={day}
                      className={cn(
                        "p-2 text-center",
                        isWeekend && "bg-muted/30"
                      )}
                    >
                      <Checkbox
                        checked={attendance[employee.id]?.[day] ?? false}
                        onCheckedChange={(checked) =>
                          handleAttendanceChange(
                            employee.id,
                            day,
                            Boolean(checked)
                          )
                        }
                        aria-label={`Attendance for ${employee.name} on day ${day}`}
                        disabled={isSaving}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
 
  const pageIsEffectivelyLoading = isEmployeesLoading;
  const canShowTableArea = !isEmployeesLoading && !error;
  const showFooter = canShowTableArea && employees.length > 0;

  // console.log("Attendance Component Render:", { pageIsEffectivelyLoading, isAttendanceLoading, error, employeesLength: employees.length, selectedMonth });

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="mt-1 text-muted-foreground">
            Track and manage monthly employee attendance.
          </p>
        </div>
      </div>

      {/* Attendance Card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Monthly Attendance Sheet
              </CardTitle>
            </div>
            <div className="w-full sm:w-auto">
              <Label htmlFor="month-select" className="sr-only">
                Select Month
              </Label>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
                disabled={
                  pageIsEffectivelyLoading || isSaving || isAttendanceLoading
                }
              >
                <SelectTrigger
                  id="month-select"
                  className="w-full sm:w-[200px]"
                >
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
    
        <CardContent className="p-0">
          {isEmployeesLoading && (
            <div className="flex h-60 items-center justify-center text-center p-6">
              <RefreshCw className="mr-3 h-6 w-6 animate-spin text-primary" />
              <span className="text-lg text-muted-foreground">
                Loading Employees...
              </span>
            </div>
          )}
          {!isEmployeesLoading &&
            error && (
              <div className="p-6">
                <Alert variant="destructive">
                  <WifiOff className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-1">
                      Error Loading Page Data
                    </p>
                    {error}
                    {error.includes("employee list") && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={fetchEmployees}
                        className="mt-3"
                      >
                        <RefreshCw className="mr-2 h-3 w-3" /> Retry Loading
                        Employees
                      </Button>
                    )}
                    {!error.includes("employee list") &&
                      employees.length > 0 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            fetchAttendance(
                              currentMonthData.year,
                              currentMonthData.month
                            )
                          }
                          className="mt-3"
                        >
                          <RefreshCw className="mr-2 h-3 w-3" /> Retry Loading
                          Attendance
                        </Button>
                      )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          {!isEmployeesLoading && !error && employees.length === 0 && (
            <div className="py-12 text-center text-muted-foreground p-6">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold mb-1">No Employees Found</h3>
              <p className="text-sm mb-4">
                Add employees first to track attendance.
              </p>
              <Button asChild variant="secondary">
                <Link to="/employees">Go to Employees</Link>
              </Button>
            </div>
          )}
          {canShowTableArea && employees.length > 0 && renderTableContent()}
        </CardContent>
    
        {showFooter && (
          <CardFooter className="flex justify-end border-t bg-muted/50 p-4">
            <Button
              onClick={handleSave}
              disabled={
                isSaving || pageIsEffectivelyLoading || isAttendanceLoading
              }
            >
              {isSaving ? (
                <>
                  {" "}
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving...{" "}
                </>
              ) : (
                <>
                  {" "}
                  <Save className="mr-2 h-4 w-4" /> Save Attendance{" "}
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Attendance;
