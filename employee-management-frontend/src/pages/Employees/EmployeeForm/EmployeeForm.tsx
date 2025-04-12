import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getEmployeeById,
  createEmployee,
  updateEmployee,
} from "@/services/employeeService";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "@/types/types";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Check,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const EmployeeSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(100, "Too Long!")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9+\-() ]*$/, "Invalid characters in phone number")
    .max(25, "Phone number seems too long")
    .nullable(),
  status: Yup.boolean().required(),
});

interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string | null;
  status: boolean;
}

const EmployeeForm: React.FC = () => {
  const { employeeId } = useParams<{ employeeId?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(employeeId);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<EmployeeFormValues>({
    name: "",
    email: "",
    phone: null,
    status: true,
  });

  const fetchEmployeeData = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching employee data for ID:", id);
      const employee = await getEmployeeById(id);
      setInitialData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone ?? null,
        status: employee.status,
      });
    } catch (err) {
      console.error("Failed to fetch employee data:", err);
      setError(
        "Failed to load employee data. Please check the ID or try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (isEditing && employeeId) {
      const idNumber = parseInt(employeeId, 10);
      if (!isNaN(idNumber)) {
        fetchEmployeeData(idNumber);
      } else {
        setError("Invalid Employee ID provided.");
        setIsLoading(false);
      }
    }
  }, [employeeId, isEditing, fetchEmployeeData]);

  const formik = useFormik<EmployeeFormValues>({
    initialValues: initialData,
    validationSchema: EmployeeSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true);

      try {
        const payload: CreateEmployeeDto | UpdateEmployeeDto = {
          ...values,
          phone: values.phone || null,
        };

        let successMessage = "";

        if (isEditing && employeeId) {
          console.log(
            "Updating employee ID:",
            employeeId,
            "with data:",
            payload
          );
          await updateEmployee(
            parseInt(employeeId, 10),
            payload as UpdateEmployeeDto
          );
          successMessage = `${values.name}'s details were successfully updated.`;
        } else {
          console.log("Creating new employee:", payload);
          await createEmployee(payload as CreateEmployeeDto);
          successMessage = `${values.name} was successfully added.`;
        }

        toast.success("Success", {
          description: successMessage,
          duration: 3000,
        });

        navigate("/employees");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(
          `Failed to ${isEditing ? "update" : "create"} employee:`,
          err
        );
        const errorMsg =
          err.response?.data?.message ||
          `Failed to ${
            isEditing ? "update" : "save"
          } employee. Please try again.`;

        toast.error("Operation Failed", {
          description: errorMsg,
          duration: 5000,
        });

        if (err.response && err.response.status === 409) {
          setFieldError("email", errorMsg);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const renderFormContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          Loading employee form...
        </div>
      );
    }

    if (error && !formik.isSubmitting) {
      return (
        <Alert variant="destructive" className="m-6">
          <WifiOff className="h-4 w-4" /> {}
          {}
          <AlertDescription>
            <p className="font-semibold">Error</p>
            {error}
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  employeeId && fetchEmployeeData(parseInt(employeeId, 10))
                }
                className="mt-4 block"
              >
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <CardContent className="grid grid-cols-1 gap-6 p-6 pt-6 md:grid-cols-2">
        {}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-gray-500" /> Name
          </Label>
          {}
          <Input
            id="name"
            placeholder="e.g., John Doe"
            {...formik.getFieldProps("name")}
            aria-invalid={!!(formik.touched.name && formik.errors.name)}
            className={cn(
              formik.touched.name && formik.errors.name
                ? "border-destructive"
                : ""
            )}
          />
          {formik.touched.name && formik.errors.name ? (
            <p className="text-xs text-destructive">{formik.errors.name}</p>
          ) : null}
        </div>
        {}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-gray-500" /> Email Address
          </Label>
          {}
          <Input
            id="email"
            type="email"
            placeholder="e.g., john.doe@example.com"
            {...formik.getFieldProps("email")}
            aria-invalid={!!(formik.touched.email && formik.errors.email)}
            className={cn(
              formik.touched.email && formik.errors.email
                ? "border-destructive"
                : ""
            )}
          />
          {formik.touched.email && formik.errors.email ? (
            <p className="text-xs text-destructive">{formik.errors.email}</p>
          ) : null}
        </div>
        {}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-gray-500" /> Phone Number{" "}
            <span className="text-gray-400">(Optional)</span>
          </Label>
          {}
          <Input
            id="phone"
            placeholder="e.g., 123-456-7890"
            value={formik.values.phone ?? ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            name="phone"
            aria-invalid={!!(formik.touched.phone && formik.errors.phone)}
            className={cn(
              formik.touched.phone && formik.errors.phone
                ? "border-destructive"
                : ""
            )}
          />
          {formik.touched.phone && formik.errors.phone ? (
            <p className="text-xs text-destructive">{formik.errors.phone}</p>
          ) : null}
        </div>
        {}
        <div className="space-y-1.5">
          <Label htmlFor="status-switch" className="flex items-center gap-1.5">
            {" "}
            {}
            <Check className="h-4 w-4 text-gray-500" /> Status
          </Label>
          <div className="flex h-10 items-center space-x-3 rounded-md px-0 py-2">
            {" "}
            {}
            {}
            <Switch
              id="status-switch"
              checked={formik.values.status}
              onCheckedChange={(checked) =>
                formik.setFieldValue("status", checked)
              }
              name="status"
            />
            {}
            <Label htmlFor="status-switch" className="cursor-pointer text-sm">
              {formik.values.status ? "Active" : "Inactive"}
            </Label>
          </div>
        </div>
      </CardContent>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 w-full">
      {}
      <div className="flex items-center gap-2">
        {}
        <Button asChild variant="ghost" size="icon" className="h-9 w-9">
          <Link to="/employees">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Employee" : "Add New Employee"}
        </h1>
      </div>

      {}
      <Card>
        <form onSubmit={formik.handleSubmit} noValidate>
          <CardHeader className="border-b">
            <CardTitle>
              {isEditing ? "Update Information" : "Employee Information"}
            </CardTitle>{" "}
            {}
            <CardDescription>
              {isEditing
                ? "Update the details for this employee."
                : "Fill in the details for the new employee."}
            </CardDescription>
          </CardHeader>

          {renderFormContent()}

          <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 p-4">
            {" "}
            {}
            {}
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/employees")}
              disabled={formik.isSubmitting}
            >
              Cancel
            </Button>
            {}
            <Button
              type="submit"
              disabled={isLoading || formik.isSubmitting || !formik.isValid}
            >
              <Save className="mr-2 h-4 w-4" />
              {formik.isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Employee"
                : "Save Employee"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EmployeeForm;
