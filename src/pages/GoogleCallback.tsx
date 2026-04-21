import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get("status");
    const message = searchParams.get("message");

    if (status === "success") {
      toast({ title: "Google Calendar & Tasks connected successfully" });
    } else {
      toast({
        title: "Google connection failed",
        description: message || "Please try again.",
        variant: "destructive",
      });
    }

    // Redirect to MasterTodo page
    navigate("/MasterTodo", { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        <p className="text-sm text-muted-foreground">Connecting Google account...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
