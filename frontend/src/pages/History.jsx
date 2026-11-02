import { useMemo, useState } from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  History as HistoryIcon,
} from "lucide-react";

import { useAttendance } from "../context/useAttendance";

const PAGE_SIZE = 20;

const statusColors = {
  Eating: "bg-green-100 text-green-700",
  "Not Eating": "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

function History() {
  const { attendance, members } = useAttendance();
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);

  const historyRows = useMemo(
    () =>
      Object.entries(attendance)
        .flatMap(([key, records]) => {
          const separatorIndex = key.lastIndexOf("_");

          if (separatorIndex === -1) {
            return [];
          }

          const date = key.slice(0, separatorIndex);
          const meal = key.slice(separatorIndex + 1);

          if (!date || !meal) {
            return [];
          }

          return members.map((member) => ({
            id: `${key}-${member.id}`,
            date,
            meal,
            member,
            status: records[member.id] || "Pending",
          }));
        })
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            a.meal.localeCompare(b.meal) ||
            a.member.name.localeCompare(b.member.name),
        ),
    [attendance, members],
  );

  const filteredRows = useMemo(
    () =>
      selectedDate
        ? historyRows.filter((row) => row.date === selectedDate)
        : historyRows,
    [historyRows, selectedDate],
  );

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const firstRowIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredRows.slice(
    firstRowIndex,
    firstRowIndex + PAGE_SIZE,
  );

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <HistoryIcon size={20} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
            Attendance History
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Browse attendance records by date.
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              All attendance records
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredRows.length}{" "}
              {filteredRows.length === 1 ? "record" : "records"}
              {selectedDate ? ` for ${formatDate(selectedDate)}` : " in total"}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div>
              <label
                htmlFor="history-date"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <CalendarDays size={16} aria-hidden="true" />
                Search by date
              </label>
              <input
                id="history-date"
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 sm:w-56"
              />
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDate("");
                  setPage(1);
                }}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                Clear date
              </button>
            )}
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3.5 sm:px-6">
                  #
                </th>
                <th scope="col" className="px-5 py-3.5 sm:px-6">
                  Date
                </th>
                <th scope="col" className="px-5 py-3.5 sm:px-6">
                  Meal
                </th>
                <th scope="col" className="px-5 py-3.5 sm:px-6">
                  Member
                </th>
                <th scope="col" className="px-5 py-3.5 sm:px-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length > 0 ? (
                pageRows.map((row, index) => (
                  <tr key={row.id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500 sm:px-6">
                      {firstRowIndex + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 sm:px-6">
                      <time dateTime={row.date}>{formatDate(row.date)}</time>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600 sm:px-6">
                      {row.meal}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-9 items-center justify-center rounded-full bg-green-50 font-semibold text-green-700"
                          aria-hidden="true"
                        >
                          {row.member.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {row.member.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          statusColors[row.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center sm:px-6"
                  >
                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                      <HistoryIcon size={22} aria-hidden="true" />
                    </div>
                    <p className="mt-3 font-medium text-gray-700">
                      {selectedDate
                        ? "No records found for this date"
                        : "No attendance records yet"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedDate
                        ? "Try another date or clear the date filter."
                        : "Attendance records will appear here once they are saved."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-gray-100 md:hidden">
          {pageRows.length > 0 ? (
            pageRows.map((row, index) => (
              <article
                key={row.id}
                className="space-y-3 px-4 py-4 transition hover:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <time
                    dateTime={row.date}
                    className="text-sm font-semibold text-gray-800"
                  >
                    {formatDate(row.date)}
                  </time>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      statusColors[row.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 font-semibold text-green-700"
                    aria-hidden="true"
                  >
                    {row.member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {row.member.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {row.meal} · Record {firstRowIndex + index + 1}
                    </p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                <HistoryIcon size={22} aria-hidden="true" />
              </div>
              <p className="mt-3 font-medium text-gray-700">
                {selectedDate
                  ? "No records found for this date"
                  : "No attendance records yet"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {selectedDate
                  ? "Try another date or clear the date filter."
                  : "Attendance records will appear here once they are saved."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-center text-sm text-gray-500 sm:text-left" aria-live="polite">
            {filteredRows.length === 0
              ? "Showing 0 records"
              : `Showing ${firstRowIndex + 1}-${Math.min(
                  firstRowIndex + PAGE_SIZE,
                  filteredRows.length,
                )} of ${filteredRows.length} records`}
          </p>
          <nav
            className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start"
            aria-label="History pagination"
          >
            <button
              type="button"
              onClick={() => setPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Previous
            </button>
            <span className="min-w-16 text-center text-sm text-gray-600">
              {totalPages === 0 ? 0 : currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </section>
    </div>
  );
}

export default History;
