import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import { MeProvider } from "./app/me";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import BlackListPage from "./pages/blacklist/BlackListPage";
import PersonsPage from "./pages/persons/PersonsPage";
import RequestsPage from "./pages/requests/RequestsPage";
import UsersPage from "./pages/users/UsersPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/requests" element={<RequestsPage />} />
      <Route path="/my-requests" element={<RequestsPage onlyMine />} />
      <Route path="/persons" element={<PersonsPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/blacklist" element={<BlackListPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

export default function App() {
  return (
    <MeProvider>
      <RouterProvider router={router} />
    </MeProvider>
  );
}
