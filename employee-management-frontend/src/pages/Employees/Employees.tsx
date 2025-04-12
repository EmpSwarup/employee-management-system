import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { getAllEmployees, deleteEmployee } from "@/services/employeeService";
import { EmployeeDto } from "@/types/types";
import {
  Pencil,
  Trash2,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { getInitials } from "@/constants/mockdata";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeDto | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching employees...");
      const data = await getAllEmployees();
      console.log("Employees fetched:", data);
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError(
        "Failed to load employee data. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDeleteClick = (employee: EmployeeDto) => {
    console.log("Delete clicked for:", employee);
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    const employeeName = employeeToDelete.name;

    try {
      await deleteEmployee(employeeToDelete.id);

      setEmployees((prev) =>
        prev.filter((emp) => emp.id !== employeeToDelete.id)
      );

      toast.success("Employee Deleted", {
        description: `${employeeName} was successfully deleted.`,
        duration: 3000,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to delete employee:", err);
      const errorMsg =
        err.response?.data?.message ||
        `Could not delete ${employeeName}. Please try again.`;

      toast.error("Delete Failed", {
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(lowerCaseQuery) ||
        employee.email.toLowerCase().includes(lowerCaseQuery) ||
        employee.phone?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [employees, searchQuery]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-60 items-center justify-center text-center p-6">
          <RefreshCw className="mr-3 h-6 w-6 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">
            Loading Employees...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-6">
          <WifiOff className="h-4 w-4" /> {}
          {}
          <AlertDescription>
            <p className="font-semibold mb-1">Error Loading Data</p>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEmployees}
              className="mt-3 block"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (employees.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground p-6">
          <p className="mb-2">No employees have been added yet.</p>
          <Button asChild>
            <Link to="/employees/add">
              <UserPlus className="mr-2 h-4 w-4" /> Add the first Employee
            </Link>
          </Button>
        </div>
      );
    }

    if (filteredEmployees.length === 0 && searchQuery) {
      return (
        <div className="py-12 text-center text-muted-foreground p-6">
          No employees found matching "{searchQuery}".
        </div>
      );
    }

    return (
      <div className="overflow-x-auto border-t">
        {" "}
        {}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] sm:w-auto">ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} className="group">
                <TableCell className="font-medium">{employee.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {employee.name}
                      </div>
                      {}
                      <div className="text-xs text-muted-foreground md:hidden">
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {employee.email}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {employee.phone || "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      employee.status
                        ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300"
                        : "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
                    )}
                  >
                    {employee.status ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {}
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-accent-foreground/70 hover:text-accent-foreground"
                    >
                      <Link
                        to={`/employees/edit/${employee.id}`}
                        title={`Edit ${employee.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit {employee.name}</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(employee)}
                      className="h-8 w-8 text-destructive/70 hover:text-destructive"
                      title={`Delete ${employee.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete {employee.name}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 w-full">
      {}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your team members and their information.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/employees/add">
            <UserPlus className="mr-2 h-4 w-4" /> Add Employee
          </Link>
        </Button>
      </div>

      {}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative w-full flex-1 sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading || !!error || employees.length === 0}
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0" disabled>
          {" "}
          {}
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      {}
      <Card className="overflow-hidden p-2">{renderContent()}</Card>

      {}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        {}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              employee
              <strong className="mx-1">{employeeToDelete?.name}</strong>
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Continue Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Employees;
