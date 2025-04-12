import React, { Suspense } from "react";
import { Route } from "react-router";
import { IRoute } from "../types/types";
import ProtectedRoute from "./ProtectedRoute";


const wrapComponent = (route: IRoute): React.ReactElement => {
  let element: React.ReactElement = <route.component />;
  
  if (route.layout) {
    element = <route.layout>{element}</route.layout>;
  }

  // Wrap with ProtectedRoute if authenticated is true
  if (route.authenticated) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }

  // Wrap with Suspense for lazy loading
  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
};

// Recursive function to render routes and their children
export const renderRoutes = (routes: IRoute[]): React.ReactNode[] => {
  return routes.map((route) => {
    const element = wrapComponent(route);

    // If the route has children, render them recursively within this route
    if (route.children && route.children.length > 0) {
      return (
        <Route key={route.id} path={route.path} element={element}>
          {renderRoutes(route.children)}
        </Route>
      );
    }

    // If no children, render a self-closing route
    return <Route key={route.id} path={route.path} element={element} />;
  });
};
