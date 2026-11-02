import { useEffect, useState } from "react";

import { apiRequest } from "../api";
import AttendanceContext from "./AttendanceContext";
import { useAuth } from "./useAuth";

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function AttendanceProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("Lunch");
  const { token, user } = useAuth();
  const currentUserId = user.member_id;

  const today = getToday();

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [loadedMembers, loadedAttendance] = await Promise.all([
          apiRequest("/api/members/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiRequest("/api/attendance/records", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (active) {
          setMembers(loadedMembers);
          setAttendance(loadedAttendance);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [token]);

  const getAttendanceKey = (date, mealType) => `${date}_${mealType}`;

  const getMealAttendance = (date, mealType) =>
    attendance[getAttendanceKey(date, mealType)] || {};

  const updateAttendance = async (
    memberId,
    status,
    date = today,
    mealType = selectedMeal,
  ) => {
    const key = getAttendanceKey(date, mealType);

    setError("");
    try {
      await apiRequest("/api/attendance/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          member_id: memberId,
          meal_date: date,
          meal_type: mealType,
          status,
        }),
      });

      setAttendance((previous) => ({
        ...previous,
        [key]: {
          ...(previous[key] || {}),
          [memberId]: status,
        },
      }));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const getMembersWithStatus = (date = today, mealType = selectedMeal) => {
    const records = getMealAttendance(date, mealType);

    return members.map((member) => ({
      ...member,
      status: records[member.id] || "Pending",
    }));
  };

  const getStatistics = (date = today, mealType = selectedMeal) => {
    const records = getMembersWithStatus(date, mealType);

    return {
      total: records.length,

      eating: records.filter((member) => member.status === "Eating").length,

      notEating: records.filter((member) => member.status === "Not Eating")
        .length,

      pending: records.filter((member) => member.status === "Pending").length,
    };
  };

  return (
    <AttendanceContext.Provider
      value={{
        members,
        attendance,
        loading,
        error,
        today,
        selectedMeal,
        setSelectedMeal,
        currentUserId,
        updateAttendance,
        getMealAttendance,
        getMembersWithStatus,
        getStatistics,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export { AttendanceProvider };
