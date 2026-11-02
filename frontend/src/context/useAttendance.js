import { useContext } from "react";

import AttendanceContext from "./AttendanceContext";

function useAttendance() {
  const context = useContext(AttendanceContext);

  if (!context) {
    throw new Error("useAttendance must be used inside AttendanceProvider");
  }

  return context;
}

export { useAttendance };
