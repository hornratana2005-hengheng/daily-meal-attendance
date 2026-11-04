import { useState } from "react";
import { Users, CheckCircle2, XCircle, Clock3, Utensils } from "lucide-react";

import { useAttendance } from "../context/useAttendance";

function Dashboard() {
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [reasonDrafts, setReasonDrafts] = useState({});
  const {
    today,
    selectedMeal,
    setSelectedMeal,
    currentUserId,
    updateAttendance,
    getMembersWithStatus,
    getStatistics,
  } = useAttendance();

  const stats = getStatistics();

  const members = getMembersWithStatus();

  const currentMember = members.find((member) => member.id === currentUserId);
  const responseKey = `${currentUserId}_${selectedMeal}`;
  const selectedStatus =
    selectedStatuses[responseKey] || currentMember?.status || "Pending";
  const reason = reasonDrafts[responseKey] ?? currentMember?.reason ?? "";

  const saveNotEating = async () => {
    await updateAttendance(currentUserId, "Not Eating", reason);
  };

  const statCards = [
    {
      title: "Total Members",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "Eating",
      value: stats.eating,
      icon: CheckCircle2,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      title: "Not Eating",
      value: stats.notEating,
      icon: XCircle,
      color: "text-red-600",
      background: "bg-red-50",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock3,
      color: "text-yellow-600",
      background: "bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome to MealTrack 👋
        </h1>

        <p className="text-gray-500 mt-1">Manage today's meal attendance.</p>
      </div>

      {/* Meal Selection */}
      <div className="bg-white rounded-2xl border p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-800">Select Meal</h2>

            <p className="text-sm text-gray-500">{today}</p>
          </div>

          <select
            value={selectedMeal}
            onChange={(event) => setSelectedMeal(event.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-500 sm:text-sm">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-800 sm:text-3xl">
                    {stat.value}
                  </h2>
                </div>

                <div
                  className={`${stat.background} shrink-0 rounded-xl p-2 sm:p-3`}
                >
                  <Icon className={stat.color} size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meal Confirmation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-50 p-3 rounded-xl">
            <Utensils className="text-green-600" size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Today's {selectedMeal}
            </h2>

            <p className="text-sm text-gray-500">Will you eat with us today?</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            aria-pressed={selectedStatus === "Eating"}
            onClick={() => {
              setSelectedStatuses((previous) => ({
                ...previous,
                [responseKey]: "Eating",
              }));
              setReasonDrafts((previous) => ({
                ...previous,
                [responseKey]: "",
              }));
              updateAttendance(currentUserId, "Eating");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-white transition hover:bg-green-700 sm:w-auto sm:px-6"
          >
            <CheckCircle2 size={20} />
            Yes, I'll Eat
          </button>

          <button
            aria-pressed={selectedStatus === "Not Eating"}
            onClick={() =>
              setSelectedStatuses((previous) => ({
                ...previous,
                [responseKey]: "Not Eating",
              }))
            }
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-white transition sm:w-auto sm:px-6 ${
              selectedStatus === "Not Eating"
                ? "bg-red-700"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            <XCircle size={20} />
            No, I Won't
          </button>
        </div>

        {selectedStatus === "Not Eating" && (
          <div className="mt-5 space-y-3">
            <label
              htmlFor="not-eating-reason"
              className="block text-sm font-medium text-gray-700"
            >
              Reason (optional)
            </label>
            <textarea
              id="not-eating-reason"
              value={reason}
              onChange={(event) =>
                setReasonDrafts((previous) => ({
                  ...previous,
                  [responseKey]: event.target.value,
                }))
              }
              maxLength={500}
              rows={3}
              placeholder="Let us know why you won't be eating"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
            />
            <button
              type="button"
              onClick={saveNotEating}
              className="rounded-xl bg-red-500 px-5 py-3 font-medium text-white transition hover:bg-red-600"
            >
              Save response
            </button>
          </div>
        )}

        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-500">Your Current Status</p>

          <p className="font-semibold text-gray-800 mt-1">
            {currentMember?.status || "Pending"}
          </p>
          {currentMember?.status === "Not Eating" && currentMember.reason && (
            <p className="mt-2 text-sm text-gray-600">
              Reason: {currentMember.reason}
            </p>
          )}
        </div>
      </div>

      {/* Member Attendance */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-800">
            Today's Attendance
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Members attending {selectedMeal.toLowerCase()}
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
                  {member.name.charAt(0)}
                </div>

                <span className="font-medium text-gray-700">{member.name}</span>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    member.status === "Eating"
                      ? "bg-green-100 text-green-700"
                      : member.status === "Not Eating"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {member.status}
                </span>
                {member.reason && (
                  <p className="mt-1 max-w-48 text-xs text-gray-500">
                    {member.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
