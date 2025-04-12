import React from "react";
import { Link } from "react-router";
import {
  Users,
  CalendarCheck,
  Package,
  UserPlus,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

const primaryBg = "bg-blue-100";
const secondaryColor = "text-teal-600";
const secondaryBg = "bg-teal-100";
const accentColor = "text-purple-600";
const accentBg = "bg-purple-100";

const HomePage: React.FC = () => {
  return (
    
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
    
      <div className="space-y-2">
        
        <h1 className="text-4xl font-bold text-gray-900">
          Employee Management System
        </h1>
        <p className="text-lg text-gray-500">
          {" "}
         
          Manage employee information, track attendance, and record item usage
        </p>
      </div>
  
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
          {" "}
          <div className="flex flex-1 flex-col p-6">
            {" "}
       
            <div className={`mb-4 w-fit rounded-full p-3 ${primaryBg}`}>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="mb-4 flex-grow space-y-2">
              {" "}
             
              <h2 className="text-2xl font-semibold leading-none tracking-tight">
                {" "}
                
                Employee Management
              </h2>
              <p className="text-sm text-gray-500">
                {" "}
             
                Add, edit, and manage employee information with ease
              </p>
            </div>
         
            <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-4">
              {" "}
            
              <div className="flex items-center text-sm text-gray-500">
                {" "}
             
                <UserPlus className="mr-1 h-4 w-4" />
                <span>Add new employees</span>
              </div>
            
              <Link
                to="/employees"
                className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 text-blue-600"
              >
                <span>Manage</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
          {" "}
      
          <div className="flex flex-1 flex-col p-6">
   
            <div className={`mb-4 w-fit rounded-full p-3 ${secondaryBg}`}>
              <CalendarCheck className={`h-6 w-6 ${secondaryColor}`} />
            </div>
         
            <div className="mb-4 flex-grow space-y-2">
              <h2 className="text-2xl font-semibold leading-none tracking-tight">
                Attendance Tracking
              </h2>
              <p className="text-sm text-gray-500">
                Track employee attendance with an intuitive calendar interface
              </p>
            </div>
           
            <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="mr-1 h-4 w-4" />
                <span>Monthly records</span>
              </div>
              <Link
                to="/attendance"
                className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 ${secondaryColor}`}
              >
                <span>Manage</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

       
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
          {" "}
      
          <div className="flex flex-1 flex-col p-6">
      
            <div className={`mb-4 w-fit rounded-full p-3 ${accentBg}`}>
              <Package className={`h-6 w-6 ${accentColor}`} />
            </div>
        
            <div className="mb-4 flex-grow space-y-2">
              <h2 className="text-2xl font-semibold leading-none tracking-tight">
                Item Usage
              </h2>
              <p className="text-sm text-gray-500">
                Track and manage items used by employees efficiently
              </p>
            </div>
       
            <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <TrendingUp className="mr-1 h-4 w-4" /> 
                <span>Track usage</span>
              </div>
              <Link
                to="/item-usage"
                className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 ${accentColor}`}
              >
                <span>Manage</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>{" "}
     
    </div>
  );
};

export default HomePage;
