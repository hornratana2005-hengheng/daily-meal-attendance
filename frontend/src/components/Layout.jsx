import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAttendance } from "../context/useAttendance";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { error, loading } = useAttendance();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8">
          {error && (
            <p
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
          {loading && (
            <p className="mb-4 text-sm text-gray-500" role="status">
              Loading members and attendance…
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;