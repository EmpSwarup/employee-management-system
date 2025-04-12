import React from "react";
import { IRoute } from "../types/types";
import MainLayout from "../components/layouts/MainLayout";

// Public/
const LoginPage = React.lazy(() => import("../pages/Login/Login"));

// App Pages 
const HomePage = React.lazy(() => import("../pages/HomePage/Homepage"));

const Employees = React.lazy(() => import("../pages/Employees/Employees"));
const EmployeeFormPage = React.lazy(
  () => import("../pages/Employees/EmployeeForm/EmployeeForm")
);

const Attendance = React.lazy(() => import("../pages/Attendance/Attendance"));

const Items = React.lazy(() => import("../pages/Items/Items"));
const ItemsForm = React.lazy(
  () => import("../pages/Items/ItemsForm/ItemsForm")
);

// 404 page
const NotFoundPage = React.lazy(() => import("../pages/NotFound/NotFound"));

// Routes

// Routes accessible without authentication
export const publicRoutes: IRoute[] = [
  {
    id: "login",
    path: "/login",
    name: "Login",
    component: LoginPage,
    authenticated: false,
  },
];

// Routes requiring authentication
export const protectedAppRoutes: IRoute[] = [
  {
    id: "home",
    path: "/",
    name: "Home",
    component: HomePage,
    authenticated: true, 
    layout: MainLayout, 
  },
  {
    id: "employees",
    path: "/employees",
    name: "Employees",
    component: Employees, 
    authenticated: true,
    layout: MainLayout,
  },
  {
    id: "employee-add",
    path: "/employees/add",
    name: "Add Employee",
    component: EmployeeFormPage,
    authenticated: true,
    layout: MainLayout,
  },
  {
    id: "employee-edit",
    path: "/employees/edit/:employeeId", 
    name: "Edit Employee",
    component: EmployeeFormPage, 
    authenticated: true,
    layout: MainLayout,
  },
  {
    id: "attendance",
    path: "/attendance",
    name: "Attendance",
    component: Attendance,
    authenticated: true,
    layout: MainLayout,
  },
  {
    id: "items",
    path: "/item-usage",
    name: "Items",
    component: Items,
    authenticated: true, 
    layout: MainLayout,
  },
  {
    id: "items-add",
    path: "/item-usage/add",
    name: "Add Item",
    component: ItemsForm,
    authenticated: true,
    layout: MainLayout,
  },
  {
    id: "items-edit",
    path: "/item-usage/edit/:itemUsageId", 
    name: "Edit Item",
    component: ItemsForm,
    authenticated: true,
    layout: MainLayout,
  },
];

// for not found
export const notFoundRoute: IRoute = {
  id: "notfound",
  path: "*",
  name: "Not Found",
  component: NotFoundPage,
  authenticated: false,
  layout: MainLayout,
};

export const allRoutes = [
  ...publicRoutes,
  ...protectedAppRoutes,
  notFoundRoute,
];
