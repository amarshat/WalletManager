import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Cards() {
  // Redirect to the unified Payment Methods page
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to payment-methods page
    navigate("/payment-methods");
  }, [navigate]);

  return null; // No need to render anything as we're redirecting
}
