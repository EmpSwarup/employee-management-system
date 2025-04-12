import React from "react";
import { Link, useNavigate } from "react-router"; 
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation

  const handleGoBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    navigate(-1); 
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 rounded-full bg-primary/10 p-6">
    
        <FileQuestion className="h-24 w-24 text-primary" />
      </div>

      <h1 className="mb-4 text-5xl font-bold text-gray-800 dark:text-gray-100">
        {" "}
      
        404 - Page Not Found
      </h1>

      <p className="mb-8 max-w-md text-xl text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
       
        <button
          onClick={handleGoBack}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" // Example using common shadcn/ui style button classes (adjust if needed) or use basic Tailwind: `border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700`
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>

      
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" // Example using common shadcn/ui style primary button classes (adjust if needed) or use basic Tailwind: `bg-blue-600 text-white hover:bg-blue-700`
        >
          <Home className="h-4 w-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
