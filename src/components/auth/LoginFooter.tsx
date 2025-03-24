
import React from "react";
import { Link } from "react-router-dom";
import { AlertCircleIcon } from "lucide-react";

const LoginFooter: React.FC = () => {
  return (
    <div className="mt-6 text-center text-gray-500 space-y-4">
      <p className="text-xs">
        <AlertCircleIcon className="inline-block h-4 w-4 mr-1 align-middle" />
        By signing in, you agree to our{" "}
        <a href="#" className="text-sinner-red hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-sinner-red hover:underline">
          Privacy Policy
        </a>
        .
      </p>
      <p className="text-sm">
        Don't have an account?{" "}
        <Link 
          to="/signup" 
          className="text-sinner-red hover:underline font-semibold"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginFooter;
