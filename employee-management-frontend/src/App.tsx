import { Routes, Route } from "react-router";
import {
  protectedAppRoutes,
  publicRoutes,
  notFoundRoute,
} from "./routes/routes";
import { renderRoutes } from "./routes/RouteRenderer";
import "./App.css";
import { Suspense } from "react";

function App() {

  const renderedPublicRoutes = renderRoutes(publicRoutes);
  const renderedProtectedRoutes = renderRoutes(protectedAppRoutes);

  const NotFoundElement = (
    <Suspense fallback={<div>Loading...</div>}>
      <notFoundRoute.component />
    </Suspense>
  );

  return (
    <Routes>
      {/* public routes */}
      {renderedPublicRoutes}

      {/* protected routes */}
      {renderedProtectedRoutes}

      {/* 404 Route */}
      <Route path={notFoundRoute.path} element={NotFoundElement} />
    </Routes>
  );
}

export default App;
