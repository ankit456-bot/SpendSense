import { useEffect, useState } from "react";
import API from "../services/api";

function Income() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [incomes, setIncomes] = useState([]);

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const [editingIncome, setEditingIncome] = useState(null);
  const [editSource, setEditSource] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // AUTH CONFIG
  // ==========================================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==========================================
  // DATE HELPER
  // ==========================================

  function formatDate(dateValue) {
    if (!dateValue) return "";

    const d = new Date(dateValue);

    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // ==========================================
  // FETCH INCOME
  // ==========================================

  async function fetchIncome() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again. No token provided.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.get(
        "/income",
        getAuthConfig()
      );

      setIncomes(
        Array.isArray(response.data)
          ? response.data
          : response.data.income || []
      );
    } catch (error) {
      console.error("Income fetch error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch income"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      alert("Please login to continue.");
      return;
    }

    fetchIncome();
  }, []);

  // ==========================================
  // ADD INCOME
  // ==========================================

  async function handleAddIncome(e) {
    e.preventDefault();

    if (!source || !amount || !date) {
      alert("Please fill all fields");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than zero");
      return;
    }

    if (!localStorage.getItem("token")) {
      alert("Please login again.");
      return;
    }

    try {
      setSubmitting(true);

      await API.post(
        "/income",
        {
          userId: user?.id,
          source,
          amount: Number(amount),
          date,
        },
        getAuthConfig()
      );

      alert("Income added successfully");

      setSource("");
      setAmount("");
      setDate("");

      await fetchIncome();
    } catch (error) {
      console.error("Add income error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add income"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // EDIT INCOME
  // ==========================================

  function handleEdit(income) {
    setEditingIncome(income);

    setEditSource(income.source || "");
    setEditAmount(income.amount || "");
    setEditDate(formatDate(income.date));
  }

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  function cancelEdit() {
    setEditingIncome(null);
    setEditSource("");
    setEditAmount("");
    setEditDate("");
  }

  // ==========================================
  // UPDATE INCOME
  // ==========================================

  async function handleUpdate() {
    if (!editSource || !editAmount || !editDate) {
      alert("Please fill all fields");
      return;
    }

    if (Number(editAmount) <= 0) {
      alert("Amount must be greater than zero");
      return;
    }

    try {
      setSubmitting(true);

      await API.put(
        `/income/${editingIncome._id}`,
        {
          source: editSource,
          amount: Number(editAmount),
          date: editDate,
        },
        getAuthConfig()
      );

      alert("Income updated successfully");

      cancelEdit();

      await fetchIncome();
    } catch (error) {
      console.error("Update income error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update income"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // DELETE INCOME
  // ==========================================

  async function handleDelete(income) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${income.source}" income?`
    );

    if (!confirmed) return;

    try {
      await API.delete(
        `/income/${income._id}`,
        getAuthConfig()
      );

      alert("Income deleted successfully");

      setIncomes((currentIncomes) =>
        currentIncomes.filter(
          (item) => item._id !== income._id
        )
      );
    } catch (error) {
      console.error("Delete income error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete income"
      );
    }
  }

  // ==========================================
  // FILTER INCOME
  // ==========================================

  const filteredIncome = incomes.filter((income) => {
    const matchesSearch = (income.source || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const incomeDate = formatDate(income.date);

    const matchesDate =
      !dateFilter || incomeDate === dateFilter;

    return matchesSearch && matchesDate;
  });

  // ==========================================
  // TOTAL INCOME
  // ==========================================

  const totalIncome = incomes.reduce(
    (total, income) =>
      total + Number(income.amount || 0),
    0
  );

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  function clearFilters() {
    setSearch("");
    setDateFilter("");
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-full bg-slate-950 p-4 text-slate-100 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white tracking-tight text-white">
            Income
          </h1>

          <p className="text-slate-400">
            Manage your income
          </p>
        </div>

        {/* TOTAL INCOME */}

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <p className="text-slate-400">
            Total Income
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white tracking-tight text-emerald-400">
            ₹
            {totalIncome.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </h2>
        </div>

        {/* ADD INCOME */}

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <h2 className="mb-6 text-2xl font-bold text-white tracking-tight text-white">
            Add Income
          </h2>

          <form
            onSubmit={handleAddIncome}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Source
              </label>

              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                required
              >
                <option value="">Select Source</option>
                <option value="Salary">Salary</option>
                <option value="Freelancing">Freelancing</option>
                <option value="Business">Business</option>
                <option value="Investment">Investment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Amount
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="₹50,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-emerald-500 p-3 font-semibold text-slate-200 text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Income"}
              </button>
            </div>
          </form>
        </div>

        {/* SEARCH & FILTER */}

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <h2 className="mb-4 text-xl font-semibold text-slate-200 text-white">
            Search & Filter
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search income source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />

            <button
              onClick={clearFilters}
              className="rounded-xl border border-slate-700 bg-slate-800 p-3 font-medium text-slate-200 transition hover:bg-slate-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* EDIT INCOME */}

        {editingIncome && (
          <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-6 text-2xl font-bold text-white tracking-tight text-white">
              Edit Income
            </h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Source
              </label>

              <select
                value={editSource}
                onChange={(e) => setEditSource(e.target.value)}
                className="w-full w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Salary">Salary</option>
                <option value="Freelancing">Freelancing</option>
                <option value="Business">Business</option>
                <option value="Investment">Investment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Amount
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Date
              </label>

              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                disabled={submitting}
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 font-medium text-slate-200 transition hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-slate-200 text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* INCOME COUNT */}

        <p className="text-slate-400 mb-4">
          Showing{" "}
          <span className="font-semibold text-slate-200">
            {filteredIncome.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-200">
            {incomes.length}
          </span>{" "}
          income records
        </p>

        {/* INCOME LIST */}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-xl shadow-black/20">
            Loading income...
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncome.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-xl shadow-black/20">
                <p className="text-slate-400">
                  No income records match your filters.
                </p>
              </div>
            ) : (
              filteredIncome.map((income) => (
                <div
                  key={income._id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/20 transition hover:border-slate-700 md:flex-row md:items-center md:justify-between md:p-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-white text-white">
                      {income.source}
                    </h2>

                    <p className="text-slate-400">
                      {new Date(income.date).toLocaleDateString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:gap-6">
                    <p className="text-xl font-bold text-white text-white text-emerald-400">
                      ₹
                      {Number(income.amount).toLocaleString(
                        "en-IN",
                        { maximumFractionDigits: 2 }
                      )}
                    </p>

                    <button
                      onClick={() => handleEdit(income)}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-medium text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(income)}
                      className="rounded-xl border border-rose-900/70 bg-rose-950/50 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-900/60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Income;



