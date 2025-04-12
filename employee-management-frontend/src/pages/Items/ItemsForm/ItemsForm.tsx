import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useFormik, FieldArray, FormikProvider, Field } from "formik";
import * as Yup from "yup";
import {
  getItemUsageRecordById,
  createItemUsageRecord,
  updateItemUsageRecord,
} from "@/services/itemUsageService";
import { getEmployeeSelectList } from "@/services/employeeService";
import { EmployeeSelectItemDto, ItemDetailDto } from "@/types/types";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { format } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const ItemUsageSchema = Yup.object().shape({
  employeeId: Yup.string().required("Employee selection is required"),
  transactionDate: Yup.string()
    .required("Date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  items: Yup.array()
    .of(
      Yup.object().shape({
        itemName: Yup.string()
          .required("Item name cannot be empty")
          .max(250, "Item name too long"),
        quantity: Yup.number()
          .transform((value) =>
            isNaN(value) || value === null || value === undefined
              ? undefined
              : value
          )
          .required("Quantity is required")
          .positive("Quantity must be greater than 0")
          .integer("Quantity must be a whole number"),
      })
    )
    .min(1, "You must add at least one item"),
});

interface ItemUsageFormValues {
  employeeId: string;
  transactionDate: string;
  items: ItemDetailDto[];
}

const ItemUsageFormPage: React.FC = () => {
  const { itemUsageId } = useParams<{ itemUsageId?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(itemUsageId);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [employeeOptions, setEmployeeOptions] = useState<
    EmployeeSelectItemDto[]
  >([]);
  const [initialData, setInitialData] = useState<ItemUsageFormValues>({
    employeeId: "",
    transactionDate: format(new Date(), "yyyy-MM-dd"),
    items: [{ itemName: "", quantity: 1 }],
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await getEmployeeSelectList();
      setEmployeeOptions(data);
    } catch (err) {
      console.error("Failed to fetch employee list:", err);

      setError("Could not load employee list for selection.");
    }
  }, []);

  const fetchUsageRecord = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const record = await getItemUsageRecordById(id);
      setInitialData({
        employeeId: record.employeeId.toString(),
        transactionDate: record.transactionDate,
        items: record.items.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
        })),
      });
    } catch (err) {
      setError("Failed to load item usage record data.");
      console.error("Fetch Item Usage Record error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    if (isEditing && itemUsageId) {
      const idNumber = parseInt(itemUsageId, 10);
      if (!isNaN(idNumber)) {
        fetchUsageRecord(idNumber);
      } else {
        setError("Invalid Item Usage Record ID.");
        setIsLoading(false);
      }
    }
  }, [itemUsageId, isEditing, fetchEmployees, fetchUsageRecord]);

  const formik = useFormik<ItemUsageFormValues>({
    initialValues: initialData,
    validationSchema: ItemUsageSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      setError(null);
      try {
        const payload = {
          ...values,
          employeeId: parseInt(values.employeeId, 10),

          items: values.items.map((item) => ({
            ...item,
            quantity: Number(item.quantity),
          })),
        };

        if (isEditing && itemUsageId) {
          await updateItemUsageRecord(parseInt(itemUsageId, 10), payload);
        } else {
          await createItemUsageRecord(payload);
        }
        navigate("/item-usage");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(`Failed to ${isEditing ? "update" : "save"} record.`);
        console.error("Submit Item Usage error:", err);

        if (err.response?.data?.errors) {
          console.log(err.response.data.errors);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const renderFormBody = () => {
    if (isLoading) {
      return (
        <CardContent className="flex h-60 items-center justify-center text-center p-6">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">
              {isEditing ? "Loading Record Data..." : "Loading..."}
            </span>
          </div>
        </CardContent>
      );
    }
    if (error && !formik.isSubmitting) {
      return (
        <CardContent className="p-6">
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" /> {}
            {}
            <AlertDescription>
              <p className="font-semibold mb-1">Failed to Load Data</p>
              {error}
              {}
              {isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    itemUsageId && fetchUsageRecord(parseInt(itemUsageId, 10))
                  }
                  className="mt-3"
                >
                  <RefreshCw className="mr-2 h-3 w-3" /> Try Again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      );
    }

    return (
      <CardContent className="space-y-6 p-6 pt-6">
        {}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {}
          <div className="space-y-1.5">
            <Label htmlFor="employeeId" className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              Employee
            </Label>
            <Select
              name="employeeId"
              value={formik.values.employeeId}
              onValueChange={(value) => {
                if (value) {
                  formik.setFieldValue("employeeId", value);
                }
              }}
              disabled={
                formik.isSubmitting ||
                (employeeOptions.length === 0 && isLoading)
              }
            >
              <SelectTrigger
                id="employeeId"
                className={cn(
                  formik.touched.employeeId && formik.errors.employeeId
                    ? "border-destructive"
                    : ""
                )}
              >
                {}
                <SelectValue placeholder="-- Select Employee --" />
              </SelectTrigger>
              <SelectContent>
                {}
                {isLoading && employeeOptions.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground">
                    Loading employees...
                  </div>
                )}
                {!isLoading && employeeOptions.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground">
                    No employees available.
                  </div>
                )}
                {}
                {employeeOptions.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.employeeId && formik.errors.employeeId ? (
              <p className="text-xs text-destructive">
                {formik.errors.employeeId}
              </p>
            ) : null}
          </div>
          {}
          <div className="space-y-1.5">
            <Label
              htmlFor="transactionDate"
              className="flex items-center gap-1.5"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date
            </Label>
            <Input
              id="transactionDate"
              type="date"
              {...formik.getFieldProps("transactionDate")}
              className={cn(
                formik.touched.transactionDate && formik.errors.transactionDate
                  ? "border-destructive"
                  : ""
              )}
              disabled={formik.isSubmitting}
            />
            {formik.touched.transactionDate && formik.errors.transactionDate ? (
              <p className="text-xs text-destructive">
                {formik.errors.transactionDate}
              </p>
            ) : null}
          </div>
        </div>

        {}
        <div className="space-y-4 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Items Used</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                formik.setFieldValue("items", [
                  ...formik.values.items,
                  { itemName: "", quantity: 1 },
                ])
              }
              disabled={formik.isSubmitting}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>

          <FieldArray
            name="items"
            render={(arrayHelpers) => (
              <div className="space-y-3">
                {formik.values.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-end gap-3 rounded border bg-background p-3"
                  >
                    <div className="col-span-12 space-y-1.5 sm:col-span-7">
                      <Label
                        htmlFor={`items.${index}.itemName`}
                        className="text-xs"
                      >
                        Item Name
                      </Label>
                      {}
                      <Field
                        as={Input}
                        id={`items.${index}.itemName`}
                        name={`items.${index}.itemName`}
                        placeholder="e.g., Laptop"
                        className={cn(
                          formik.touched.items?.[index]?.itemName &&
                            formik.errors.items?.[index]?.itemName
                            ? "border-destructive"
                            : ""
                        )}
                        disabled={formik.isSubmitting}
                      />
                      {formik.touched.items?.[index]?.itemName &&
                      typeof formik.errors.items === "object" &&
                      formik.errors.items?.[index]?.itemName ? (
                        <p className="text-xs text-destructive">
                          {formik.errors.items[index].itemName}
                        </p>
                      ) : null}
                    </div>
                    <div className="col-span-8 space-y-1.5 sm:col-span-3">
                      <Label
                        htmlFor={`items.${index}.quantity`}
                        className="text-xs"
                      >
                        Quantity
                      </Label>
                      <Field
                        as={Input}
                        id={`items.${index}.quantity`}
                        name={`items.${index}.quantity`}
                        type="number"
                        min="1"
                        placeholder="Qty"
                        className={cn(
                          formik.touched.items?.[index]?.quantity &&
                            formik.errors.items?.[index]?.quantity
                            ? "border-destructive"
                            : ""
                        )}
                        disabled={formik.isSubmitting}
                      />
                      {formik.touched.items?.[index]?.quantity &&
                      typeof formik.errors.items === "object" &&
                      formik.errors.items?.[index]?.quantity ? (
                        <p className="text-xs text-destructive">
                          {formik.errors.items[index].quantity}
                        </p>
                      ) : null}
                    </div>
                    <div className="col-span-4 flex items-end sm:col-span-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => arrayHelpers.remove(index)}
                        disabled={
                          formik.values.items.length <= 1 || formik.isSubmitting
                        }
                        className="h-10 w-full text-destructive hover:bg-destructive/10 sm:w-10"
                        aria-label={`Remove item ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {formik.touched.items &&
                typeof formik.errors.items === "string" ? (
                  <p className="pt-1 text-xs text-destructive">
                    {formik.errors.items}
                  </p>
                ) : null}
              </div>
            )}
          />
        </div>
      </CardContent>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 w-full">
      {}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="h-9 w-9">
          <Link to="/item-usage">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Item Usage" : "Add Item Usage"}
        </h1>
      </div>

      {}
      <FormikProvider value={formik}>
        <Card>
          <form onSubmit={formik.handleSubmit} noValidate>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Usage Details</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Update record details."
                  : "Select employee/date and add items."}
              </CardDescription>
            </CardHeader>

            {renderFormBody()}

            <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 p-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/item-usage")}
                disabled={formik.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  formik.isSubmitting ||
                  !formik.isValid ||
                  !formik.dirty
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {formik.isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Record"
                  : "Save Record"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </FormikProvider>
    </div>
  );
};

export default ItemUsageFormPage;
