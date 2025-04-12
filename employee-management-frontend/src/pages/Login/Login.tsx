import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/context/AuthContext";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  LogIn,
  AlertCircle,
  RefreshCw,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import AlertTitle if needed

// validation
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      console.log("LoginPage: onSubmit called");
      try {
        await login(values);
        console.log("LoginPage: Login successful, navigating...");
        navigate("/");
      } catch (err) {
        console.error("LoginPage: Login submission caught error:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-slate-100 p-4 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-800 dark:text-gray-100">
            Employee Management
          </h1>
          <p className="text-muted-foreground">Sign in to continue</p>
        </div>

        <Card>
          <CardHeader>
            {" "}
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials below</CardDescription>
          </CardHeader>

          <form onSubmit={formik.handleSubmit} noValidate>
            <CardContent className="space-y-6">
              {!isLoading && authError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...formik.getFieldProps("email")}
                  aria-invalid={!!(formik.touched.email && formik.errors.email)}
                  className={cn(
                    formik.touched.email && formik.errors.email
                      ? "border-destructive"
                      : ""
                  )}
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-xs text-destructive">
                    {formik.errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-muted-foreground" /> Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...formik.getFieldProps("password")}
                    aria-invalid={
                      !!(formik.touched.password && formik.errors.password)
                    }
                    className={cn(
                      "pr-10",
                      formik.touched.password && formik.errors.password
                        ? "border-destructive"
                        : ""
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 transform text-muted-foreground hover:bg-transparent hover:text-foreground" // Adjust size and positioning
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <p className="text-xs text-destructive">
                    {formik.errors.password}
                  </p>
                ) : null}
              </div>
            </CardContent>

            <CardFooter>
              {" "}
              <Button
                type="submit"
                disabled={isLoading || formik.isSubmitting}
                className="w-full mt-5"
              >
                {isLoading || formik.isSubmitting ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
