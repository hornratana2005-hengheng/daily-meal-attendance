import { Users } from "lucide-react";

import { useAttendance } from "../context/useAttendance";

function Members() {
  const { selectedMeal, getMembersWithStatus } = useAttendance();

  const members = getMembersWithStatus();

  const statusColors = {
    Eating: "bg-green-100 text-green-700",
    "Not Eating": "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Group Members</h1>

        <p className="text-gray-500 mt-1">
          Today's {selectedMeal.toLowerCase()} attendance.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b flex items-center gap-2">
          <Users size={20} className="text-green-600" />

          <h2 className="font-semibold">Members ({members.length})</h2>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Member Name</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member, index) => (
                <tr key={member.id} className="border-t border-gray-100">
                  <td className="px-6 py-4">{index + 1}</td>

                  <td className="px-6 py-4 font-medium">{member.name}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[member.status]
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-gray-100 md:hidden">
          {members.map((member, index) => (
            <article
              key={member.id}
              className="flex items-center justify-between gap-3 px-4 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 font-semibold text-green-700">
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {member.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    #{index + 1}
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  statusColors[member.status]
                }`}
              >
                {member.status}
              </span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Members;
