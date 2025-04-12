import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router";
import {
  getAllItemUsageRecords,
  deleteItemUsageRecord,
} from "@/services/itemUsageService";
import { ItemUsageRecordDto } from "@/types/types";
import {
  Pencil,
  Trash2,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  WifiOff,
  Calendar,
  Package,
} from "lucide-react";
import { format, parseISO } from "date-fns";
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

const Items: React.FC = () => {
  const [itemUsages, setItemUsages] = useState<ItemUsageRecordDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [usageToDelete, setUsageToDelete] = useState<ItemUsageRecordDto | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsageRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllItemUsageRecords();
      setItemUsages(data);
    } catch (err) {
      setError("Failed to load item usage data. Please try again.");
      console.error("Fetch Item Usage error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsageRecords();
  }, [fetchUsageRecords]);

  const handleDeleteClick = (usage: ItemUsageRecordDto) => {
    setUsageToDelete(usage);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!usageToDelete) return;
    const recordId = usageToDelete.id;
    const employeeName = usageToDelete.employeeName;
    const recordDate = usageToDelete.transactionDate;

    try {
      await deleteItemUsageRecord(usageToDelete.id);
      setItemUsages((prev) => prev.filter((u) => u.id !== usageToDelete.id));

      toast.success("Record Deleted", {
        description: `Item usage record #${recordId} for ${employeeName} on ${format(
          parseISO(recordDate),
          "MMM dd, yyyy"
        )} was deleted.`,
        duration: 3000,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Delete Item Usage error:", err);
      const errorMsg =
        err.response?.data?.message ||
        `Could not delete record #${recordId}. Please try again.`;

      toast.error("Delete Failed", { description: errorMsg, duration: 5000 });

      setError(errorMsg);
    } finally {
      setIsDeleteDialogOpen(false);
      setUsageToDelete(null);
    }
  };

  const filteredItemUsages = useMemo(() => {
    if (!searchQuery) return itemUsages;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return itemUsages.filter(
      (usage) =>
        usage.employeeName.toLowerCase().includes(lowerCaseQuery) ||
        usage.items.some((item) =>
          item.itemName.toLowerCase().includes(lowerCaseQuery)
        ) ||
        usage.transactionDate.includes(searchQuery)
    );
  }, [itemUsages, searchQuery]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-60 items-center justify-center text-center p-6">
          <RefreshCw className="mr-3 h-6 w-6 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">
            Loading Records...
          </span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-6">
          {" "}
          {}
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            {}
            <AlertDescription>
              <p className="font-semibold mb-1">Error Loading Data</p>
              {error}
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchUsageRecords}
                className="mt-3"
              >
                <RefreshCw className="mr-2 h-3 w-3" /> Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    if (itemUsages.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground p-6">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold mb-1">
            No Item Usage Records Found
          </h3>
          <p className="text-sm mb-4">
            Get started by adding the first record.
          </p>
          <Button asChild>
            <Link to="/item-usage/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Record
            </Link>
          </Button>
        </div>
      );
    }
    if (filteredItemUsages.length === 0 && searchQuery) {
      return (
        <div className="py-12 text-center text-muted-foreground p-6">
          <Search className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold mb-1">No Matching Records</h3>
          <p className="text-sm">
            Your search for "{searchQuery}" did not return any results.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="mt-3"
          >
            Clear Search
          </Button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto border-t p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items Used</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItemUsages.map((usage) => (
              <TableRow key={usage.id} className="group">
                <TableCell className="font-medium">{usage.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {getInitials(usage.employeeName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {usage.employeeName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(usage.transactionDate), "MMM dd, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {usage.items.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="whitespace-nowrap"
                      >
                        {item.itemName} ({item.quantity})
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-accent-foreground/70 hover:text-accent-foreground"
                    >
                      <Link
                        to={`/item-usage/edit/${usage.id}`}
                        title={`Edit Record ${usage.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(usage)}
                      className="h-8 w-8 text-destructive/70 hover:text-destructive"
                      title={`Delete Record ${usage.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">Item Usage Management</h1>
          <p className="mt-1 text-muted-foreground">
            Track items used by employees.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/item-usage/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item Usage Record
          </Link>
        </Button>
      </div>

      {}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative w-full flex-1 sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search by employee, item, or date (YYYY-MM-DD)..."
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading || !!error || itemUsages.length === 0}
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0" disabled>
          <Filter className="h-4 w-4" /> <span className="sr-only">Filter</span>
        </Button>
      </div>

      {}
      <Card className="overflow-hidden">{renderContent()}</Card>

      {}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the item usage record #
              {usageToDelete?.id} for
              <strong className="mx-1">{usageToDelete?.employeeName}</strong>
              on{" "}
              {usageToDelete?.transactionDate
                ? format(
                    parseISO(usageToDelete.transactionDate),
                    "MMM dd, yyyy"
                  )
                : ""}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUsageToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Items;
