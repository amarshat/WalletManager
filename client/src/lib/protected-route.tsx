import { useAuth, AuthLoadingScreen } from "@/hooks/use-auth";
import { Route, Redirect } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  requireAdmin = false,
  requireSuperAdmin = false,
  redirectTo = "/auth"
}: {
  path: string;
  component: () => React.JSX.Element;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  redirectTo?: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <AuthLoadingScreen />
      </Route>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to={redirectTo} />
      </Route>
    );
  }

  // Check for SuperAdmin route
  if (requireSuperAdmin && user.username !== "superadmin") {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Check admin requirement if specified
  if (requireAdmin && !user.isAdmin && user.username !== "superadmin") {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // If admin, redirect from customer pages to admin dashboard
  if ((user.isAdmin || user.username === "superadmin") && !path.startsWith("/admin") && !path.startsWith("/superadmin") && !requireAdmin) {
    return (
      <Route path={path}>
        <Redirect to={user.username === "superadmin" ? "/superadmin" : "/admin"} />
      </Route>
    );
  }

  // User is authenticated and meets requirements
  return <Route path={path} component={Component} />;
}
