import { Menu, CalendarDays, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Header({ onMenuClick }) {
  const location = useLocation();
  const { user, logOut } = useAuth();

  const pageTitles = {
    "/": "Dashboard",
    "/members": "Members",
    "/history": "Attendance History",
  };

  const title = pageTitles[location.pathname] || "MealTrack";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden text-gray-600"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {title}
            </h2>

            <p className="text-sm text-gray-500">
              Daily Meal Attendance System
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          <div className="hidden lg:flex items-center gap-2 text-gray-500">
            <CalendarDays size={18} />

            <span className="text-sm">{today}</span>
          </div>

          <div className="flex items-center gap-2">
            <UserCircle size={32} className="text-green-600" />
            <span className="hidden sm:block text-sm font-medium">
              {user.name}
            </span>
            <button
              type="button"
              onClick={() => {
                logOut().catch((error) => {
                  window.alert(error.message);
                });
              }}
              className="rounded-lg px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
