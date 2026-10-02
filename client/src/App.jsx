import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Budget from "./pages/Budget";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* PROTECTED ROUTES */}

        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/expenses"
            element={<Expenses />}
          />

          <Route
            path="/income"
            element={<Income />}
          />

          <Route
            path="/budget"
            element={<Budget />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

        </Route>


        {/* 404 */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;