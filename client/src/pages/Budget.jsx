
import { useEffect, useState } from "react";
import API from "../services/api";

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [amount, setAmount] = useState("");

  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  );

  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  // ==========================================
  // FETCH BUDGETS
  // ==========================================

  async function fetchBudgets() {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/budgets", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBudgets(response.data);
    } catch (error) {
      console.log("Budget fetch error:", error);
    }
  }

  // ==========================================
  // FETCH EXPENSES
  // ==========================================

  async function fetchExpenses() {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/expenses", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setExpenses(response.data);
    } catch (error) {
      console.log("Expense fetch error:", error);
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, []);

  // ==========================================
  // ADD BUDGET
  // ==========================================

  async function handleAddBudget(e) {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/budgets",
        {
          amount: Number(amount),
          month: Number(month),
          year: Number(year)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Budget added successfully");

      setAmount("");

      fetchBudgets();
    } catch (error) {
      console.log("Add budget error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to add budget"
      );
    }
  }

  // ==========================================
  // DELETE BUDGET
  // ==========================================

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/budgets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBudgets((currentBudgets) =>
        currentBudgets.filter(
          (budget) => budget._id !== id
        )
      );

      alert("Budget deleted successfully");
    } catch (error) {
      console.log("Delete budget error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to delete budget"
      );
    }
  }

  // ==========================================
  // MONTH NAME
  // ==========================================

  function getMonthName(monthNumber) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    return months[monthNumber - 1];
  }

  // ==========================================
  // CALCULATE SPENT AMOUNT
  // ==========================================

  function getSpentAmount(budget) {
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(
          expense.date
        );

        return (
          expenseDate.getMonth() + 1 ===
            budget.month &&
          expenseDate.getFullYear() ===
            budget.year
        );
      })
      .reduce(
        (total, expense) =>
          total + Number(expense.amount),
        0
      );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-full bg-slate-950 p-4 text-slate-100 md:p-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
          Budget Management
        </h1>

        <p className="mb-8 text-slate-400">
          Set and monitor your monthly budgets
        </p>

        {/* ADD BUDGET */}

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">

          <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">
            Set Monthly Budget
          </h2>

          <form
            onSubmit={handleAddBudget}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Budget Amount
              </label>

              <input
                type="number"
                min="1"
                placeholder="₹20,000"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Month
              </label>

              <select
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {Array.from(
                  { length: 12 },
                  (_, index) => (
                    <option
                      key={index + 1}
                      value={index + 1}
                    >
                      {getMonthName(index + 1)}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Year
              </label>

              <input
                type="number"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 p-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Set Budget
              </button>
            </div>

          </form>
        </div>

        {/* BUDGET LIST */}

        <div>

          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-white">
            Your Budgets
          </h2>

          {budgets.length === 0 ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-xl shadow-black/20">
              <p className="text-slate-400">
                No budgets found.
              </p>
            </div>

          ) : (

            <div className="space-y-6">

              {budgets.map((budget) => {

                const spent =
                  getSpentAmount(budget);

                const remaining =
                  Number(budget.amount) - spent;

                const percentage =
                  budget.amount > 0
                    ? (spent /
                        budget.amount) *
                      100
                    : 0;

                const progress =
                  Math.min(
                    percentage,
                    100
                  );

                return (

                  <div
                    key={budget._id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20 transition hover:border-slate-700"
                  >

                    {/* HEADER */}

                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {getMonthName(
                            budget.month
                          )}{" "}
                          {budget.year}
                        </h3>

                        <p className="text-slate-400">
                          Monthly Budget
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleDelete(
                            budget._id
                          )
                        }
                        className="rounded-xl border border-rose-900/70 bg-rose-950/50 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-900/60"
                      >
                        Delete
                      </button>

                    </div>

                    {/* BUDGET */}

                    <div className="mt-6">

                      <div className="mb-2 flex justify-between">

                        <span className="text-slate-400">
                          Budget
                        </span>

                        <span className="font-semibold text-slate-200">
                          ₹
                          {Number(
                            budget.amount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      {/* PROGRESS BAR */}

                      <div className="h-4 w-full rounded-full bg-slate-800">

                        <div
                          className={`h-4 rounded-full ${
                            percentage >= 100
                              ? "bg-rose-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${progress}%`
                          }}
                        />

                      </div>

                      {/* STATS */}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">

                          <p className="text-slate-400">
                            Spent
                          </p>

                          <p className="text-xl font-bold text-rose-400">
                            ₹
                            {spent.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">

                          <p className="text-slate-400">
                            Remaining
                          </p>

                          <p
                            className={`text-xl font-bold ${
                              remaining < 0
                                ? "text-rose-400"
                                : "text-emerald-400"
                            }`}
                          >
                            ₹
                            {remaining.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">

                          <p className="text-slate-400">
                            Used
                          </p>

                          <p className="text-xl font-bold text-sky-400">
                            {percentage.toFixed(1)}%
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

export default Budget;