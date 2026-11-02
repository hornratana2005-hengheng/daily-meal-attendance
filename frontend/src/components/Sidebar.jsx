import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  History,
  UtensilsCrossed,
  X,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Members",
    path: "/members",
    icon: Users,
  },
  {
    name: "History",
    path: "/history",
    icon: History,
  },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-xl">
              <UtensilsCrossed className="text-green-600" size={24} />
            </div>

            <div>
              <h1 className="font-bold text-gray-800">MealTrack</h1>

              <p className="text-xs text-gray-500">Attendance System</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-gray-500"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl
                  font-medium transition-colors
                  ${
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full p-5 border-t">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} MealTrack
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
