import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./app/auth";
import { RequireAuth, RequireRole } from "./app/RequireAuth";
import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/HomePage";
import LinkPage from "./pages/LinkPage";
import LoginPage from "./pages/LoginPage";
import BlackListPage from "./pages/blacklist/BlackListPage";
import PersonsPage from "./pages/persons/PersonsPage";
import RequestsPage from "./pages/requests/RequestsPage";
import UsersPage from "./pages/users/UsersPage";

/** Справочники в BpDazApp были доступны только администратору. */
function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="admin" fallback={<Navigate to="/" replace />}>
      {children}
    </RequireRole>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/link" element={<LinkPage />} />
      </Route>

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/my-requests" element={<RequestsPage onlyMine />} />
        <Route path="/persons" element={<AdminOnly><PersonsPage /></AdminOnly>} />
        <Route path="/users" element={<AdminOnly><UsersPage /></AdminOnly>} />
        <Route path="/blacklist" element={<AdminOnly><BlackListPage /></AdminOnly>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </>
  )
);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
