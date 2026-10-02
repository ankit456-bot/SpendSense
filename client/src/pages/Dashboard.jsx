import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import API from "../services/api";

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

function Dashboard() {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [gmailMessages, setGmailMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [gmailLoading, setGmailLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
const [pendingOrders, setPendingOrders] = useState([]);
const [reviewLoading, setReviewLoading] = useState(false);
  // =========================
  // API HELPERS
  // =========================

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // =========================
  // FETCH FINANCIAL DATA
  // =========================

  async function fetchExpenses() {
    try {
      const response = await API.get(
        "/expenses",
        getAuthConfig()
      );

      setExpenses(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Expense fetch error:", error);
    }
  }

  async function fetchIncome() {
    try {
      const response = await API.get(
        "/income",
        getAuthConfig()
      );

      setIncomes(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Income fetch error:", error);
    }
  }

  async function fetchBudgets() {
    try {
      const response = await API.get(
        "/budgets",
        getAuthConfig()
      );

      setBudgets(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Budget fetch error:", error);
    }
  }

  async function loadDashboard() {
    setLoading(true);

    await Promise.all([
      fetchExpenses(),
      fetchIncome(),
      fetchBudgets(),
      fetchPendingOrders(),
    ]);

    setLoading(false);
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    loadDashboard();
  }, [navigate]);

  // =========================
  // FINANCIAL TOTALS
  // =========================

  const totalIncome = incomes.reduce(
    (total, income) =>
      total + Number(income.amount || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const balance = totalIncome - totalExpenses;

  // =========================
  // CURRENT MONTH
  // =========================

  const today = new Date();

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const currentBudget = budgets.find(
    (budget) =>
      Number(budget.month) === currentMonth &&
      Number(budget.year) === currentYear
  );

  const currentMonthExpenses = expenses
    .filter((expense) => {
      const date = new Date(expense.date);

      return (
        !isNaN(date.getTime()) &&
        date.getMonth() + 1 === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

  const budgetAmount = Number(currentBudget?.amount || 0);

  const budgetRemaining =
    budgetAmount - currentMonthExpenses;

  const budgetPercentage =
    budgetAmount > 0
      ? (currentMonthExpenses / budgetAmount) * 100
      : 0;

  const budgetProgress = Math.min(
    Math.max(budgetPercentage, 0),
    100
  );

  // =========================
  // MONTHLY SPENDING CHART
  // Last 6 months
  // =========================

  const monthlySpending = Array.from(
    { length: 6 },
    (_, index) => {
      const date = new Date(
        currentYear,
        currentDateMonthOffset(currentMonth) - (5 - index),
        1
      );

      const month = date.getMonth();
      const year = date.getFullYear();

      const amount = expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.date);

          return (
            !isNaN(expenseDate.getTime()) &&
            expenseDate.getMonth() === month &&
            expenseDate.getFullYear() === year
          );
        })
        .reduce(
          (total, expense) =>
            total + Number(expense.amount || 0),
          0
        );

      return {
        month: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        amount,
      };
    }
  );

  // =========================
  // CATEGORY PIE CHART
  // Current month
  // =========================

  const categoryTotals = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);

    if (
      isNaN(date.getTime()) ||
      date.getMonth() + 1 !== currentMonth ||
      date.getFullYear() !== currentYear
    ) {
      return;
    }

    const category = expense.category || "Other";

    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      Number(expense.amount || 0);
  });

  const categoryData = Object.entries(categoryTotals).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

async function fetchPendingOrders() {
  try {
    const response = await API.get(
      "/gmail/pending",
      getAuthConfig()
    );

    setPendingOrders(response.data.orders || []);
  } catch (error) {
    console.error("Pending orders error:", error);
  }
}

async function handleApproveOrder(orderId) {
  try {
    setReviewLoading(true);

    await API.post(
      `/gmail/approve/${orderId}`,
      {},
      getAuthConfig()
    );

    await Promise.all([
      fetchPendingOrders(),
      fetchExpenses(),
    ]);

    alert("Order approved and added to expenses!");
  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Failed to approve order"
    );
  } finally {
    setReviewLoading(false);
  }
}

async function handleIgnoreOrder(orderId) {
  try {
    setReviewLoading(true);

    await API.post(
      `/gmail/ignore/${orderId}`,
      {},
      getAuthConfig()
    );

    await fetchPendingOrders();

    alert("Order ignored.");
  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Failed to ignore order"
    );
  } finally {
    setReviewLoading(false);
  }
}
  // =========================
  // GMAIL
  // =========================

  async function handleConnectGmail() {
    try {
      const response = await API.get(
        "/gmail/auth",
        getAuthConfig()
      );

      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Gmail connection error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to connect Gmail"
      );
    }
  }

  async function fetchGmailMessages() {
    try {
      setGmailLoading(true);

      const response = await API.get(
        "/gmail/messages",
        getAuthConfig()
      );

      setGmailMessages(
        response.data.messages || []
      );

await fetchPendingOrders();
      alert("Gmail synced! Review your pending orders below.");
    } catch (error) {
      console.error("Gmail error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to read Gmail"
      );
    } finally {
      setGmailLoading(false);
    }
  }

  // =========================
  // LOGOUT
  // =========================

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  }

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your finances...</p>
        </div>
      </div>
    );
  }

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white">

      {/* SIDEBAR + MAIN LAYOUT */}
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-[#101827] border-r border-slate-800 p-6 z-20">

          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-xl font-black text-slate-950">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                SpendSense
              </h1>
              <p className="text-xs text-slate-500">
                Personal Finance
              </p>
            </div>
          </div>

          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
            Workspace
          </p>

<nav className="space-y-2">

  {/* Dashboard */}
  <button
    onClick={() => scrollToSection("overview")}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
    bg-emerald-500/10 text-emerald-400 font-semibold text-left
    border border-emerald-500/20 transition-all duration-300"
  >
    <span className="text-xl">▦</span>
    Dashboard
  </button>

  {/* Transactions */}
  <button
    onClick={() => scrollToSection("transactions")}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
    text-slate-400 hover:bg-slate-800 hover:text-emerald-400
    transition-all duration-300 text-left"
  >
    <span className="text-xl">↔</span>
    Transactions
  </button>

  {/* Budget */}
  <button
    onClick={() => navigate("/budget")}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
    text-slate-400 hover:bg-slate-800 hover:text-emerald-400
    transition-all duration-300 text-left"
  >
    <span className="text-xl">◷</span>
    Budget
  </button>

  {/* Analytics */}
  <button
    onClick={() => scrollToSection("analytics")}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
    text-slate-400 hover:bg-slate-800 hover:text-emerald-400
    transition-all duration-300 text-left"
  >
    <span className="text-xl">▥</span>
    Analytics
  </button>

  {/* Gmail */}
  <button
    onClick={() => scrollToSection("gmail")}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
    text-slate-400 hover:bg-slate-800 hover:text-emerald-400
    transition-all duration-300 text-left"
  >
    <span className="text-xl">✉</span>
    Gmail
  </button>

</nav>
          <div className="mt-auto">
            <div className="bg-slate-800/60 rounded-2xl p-4 mb-5">
              <p className="text-xs text-slate-400 mb-2">
                Signed in as
              </p>
              <p className="font-semibold truncate">
                {user?.name || "User"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 px-4 py-3 transition text-left"
            >
              ↪ &nbsp; Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 lg:ml-64 p-4 sm:p-6 lg:p-10">

          {/* TOP NAVBAR */}
          <nav
            className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-10
              mb-8 px-4 sm:px-6 lg:px-10 py-4
              bg-[#101827]/95 backdrop-blur-xl
              border-b border-slate-800"
          >
            <div className="flex items-center justify-end gap-2 sm:gap-3 overflow-x-auto">
              <button
                onClick={() => scrollToSection("overview")}
                className="shrink-0 px-4 sm:px-6 py-3 rounded-xl
                  bg-emerald-500 text-slate-950 font-semibold
                  hover:bg-emerald-400 transition-all duration-300"
              >
                Dashboard
              </button>

              <button
                onClick={() => scrollToSection("transactions")}
                className="shrink-0 px-4 sm:px-6 py-3 rounded-xl
                  text-slate-300 font-medium
                  hover:bg-slate-800 hover:text-emerald-400
                  transition-all duration-300"
              >
                Expenses
              </button>

              <button
                onClick={() => navigate("/income")}
                className="shrink-0 px-4 sm:px-6 py-3 rounded-xl
                  text-slate-300 font-medium
                  hover:bg-slate-800 hover:text-emerald-400
                  transition-all duration-300"
              >
                Income
              </button>

              <button
                onClick={() => navigate("/budget")}
                className="shrink-0 px-4 sm:px-6 py-3 rounded-xl
                  text-slate-300 font-medium
                  hover:bg-slate-800 hover:text-emerald-400
                  transition-all duration-300"
              >
                Budget
              </button>

              <button
                onClick={() => scrollToSection("analytics")}
                className="shrink-0 px-4 sm:px-6 py-3 rounded-xl
                  text-slate-300 font-medium
                  hover:bg-slate-800 hover:text-emerald-400
                  transition-all duration-300"
              >
                Analytics
              </button>
            </div>
          </nav>

          {/* HEADER */}
          <header
            id="overview"
            className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8"
          >
            <div>
              <p className="text-sm text-emerald-400 font-medium mb-2">
                YOUR FINANCIAL OVERVIEW
              </p>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome back, {user?.name || "User"} 👋
              </h1>

              <p className="text-slate-400 mt-2">
                Here's what's happening with your money.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleConnectGmail}
                className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition text-sm font-medium"
              >
                ✉ Connect Gmail
              </button>

              <button
                onClick={fetchGmailMessages}
                disabled={gmailLoading}
                className="px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition text-sm font-bold"
              >
                {gmailLoading ? "Reading..." : "↓ Read Gmail"}
              </button>

              <button
                onClick={handleLogout}
                className="lg:hidden px-4 py-3 rounded-xl bg-slate-800 text-red-400 border border-slate-700"
              >
                Logout
              </button>
            </div>
          </header>

          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">

            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-slate-950 shadow-lg shadow-emerald-900/20">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm opacity-80">
                  Total Balance
                </p>
                <span className="text-2xl">◈</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black mt-5 break-words">
                {formatCurrency(balance)}
              </h2>

              <p className="text-sm mt-4 opacity-80">
                Income minus expenses
              </p>
            </div>

            <SummaryCard
              title="Total Income"
              amount={totalIncome}
              icon="↗"
              accent="emerald"
              subtitle="All recorded income"
            />

            <SummaryCard
              title="Total Expenses"
              amount={totalExpenses}
              icon="↘"
              accent="rose"
              subtitle="All recorded expenses"
            />
          </section>

          {/* CHARTS */}
          <section
            id="analytics"
            className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-8"
          >

            {/* MONTHLY SPENDING */}
            <div className="xl:col-span-3 bg-[#111b2c] border border-slate-800 rounded-2xl p-5 sm:p-7">

              <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-bold">
                    Spending Overview
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Your expenses over the last 6 months
                  </p>
                </div>

                <span className="text-xs px-3 py-2 rounded-lg bg-slate-800 text-emerald-400">
                  Last 6 months
                </span>
              </div>

              {expenses.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-slate-500 text-center">
                  Add expenses to view your spending chart.
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlySpending}
                      margin={{ top: 10, right: 5, left: 5, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#263247"
                      />

                      <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        stroke="#64748b"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickFormatter={(value) =>
                          value >= 1000
                            ? `₹${(value / 1000).toFixed(0)}k`
                            : `₹${value}`
                        }
                        axisLine={false}
                        tickLine={false}
                        width={55}
                      />

                      <Tooltip
                        cursor={{ fill: "#1e293b" }}
                        contentStyle={{
                          backgroundColor: "#101827",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                        formatter={(value) => [
                          formatCurrency(value),
                          "Expenses",
                        ]}
                      />

                      <Bar
                        dataKey="amount"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* CATEGORY BREAKDOWN */}
            <div className="xl:col-span-2 bg-[#111b2c] border border-slate-800 rounded-2xl p-5 sm:p-7">

              <div className="mb-4">
                <h2 className="text-lg font-bold">
                  Spending by Category
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Current month breakdown
                </p>
              </div>

              {categoryData.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-slate-500 text-center">
                  No expenses recorded this month.
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              CHART_COLORS[
                                index % CHART_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#101827",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                        formatter={(value) =>
                          formatCurrency(value)
                        }
                      />

                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: "12px",
                          color: "#cbd5e1",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          {/* MONTHLY BUDGET */}
          {currentBudget && (
            <section className="bg-[#111b2c] border border-slate-800 rounded-2xl p-5 sm:p-7 mb-8">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-400">
                    Monthly Budget
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {formatCurrency(budgetAmount)}
                  </h2>
                </div>

                <button
                  onClick={() => navigate("/budget")}
                  className="px-5 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold transition"
                >
                  Manage Budget →
                </button>
              </div>

              <div className="flex justify-between gap-3 mb-3 text-sm">
                <span className="text-slate-400">
                  Spent this month
                </span>
                <span className="font-semibold">
                  {formatCurrency(currentMonthExpenses)}
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    budgetPercentage >= 100
                      ? "bg-rose-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${budgetProgress}%` }}
                />
              </div>

              <div className="flex flex-wrap justify-between gap-3 mt-4 text-sm">
                <p className="text-slate-400">
                  {budgetPercentage.toFixed(1)}% used
                </p>

                <p
                  className={`font-semibold ${
                    budgetRemaining < 0
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {formatCurrency(budgetRemaining)} remaining
                </p>
              </div>
            </section>
          )}

          {/* TRANSACTIONS */}
          <section
            id="transactions"
            className="bg-[#111b2c] border border-slate-800 rounded-2xl p-5 sm:p-7 mb-8"
          >
            <div className="flex justify-between items-center gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold">
                  Recent Transactions
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Your latest recorded expenses
                </p>
              </div>

              <span className="text-xs text-slate-400 bg-slate-800 px-3 py-2 rounded-lg">
                {expenses.length} total
              </span>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No expenses found.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 shrink-0 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl">
                        ↘
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">
                          {expense.title || "Expense"}
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          {expense.category || "Other"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-rose-400">
                        -{formatCurrency(expense.amount)}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {expense.date
                          ? new Date(
                              expense.date
                            ).toLocaleDateString("en-IN")
                          : "Unknown date"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
{/* PENDING GMAIL ORDERS */}
<section
  id="pending-orders"
  className="bg-[#111b2c] border border-slate-800
  rounded-2xl p-5 sm:p-7 mb-8"
>
  <h2 className="text-lg font-bold">
    Orders Awaiting Review
  </h2>

  <p className="text-sm text-slate-400 mt-1 mb-6">
    Confirm imported purchases before adding them
    to your expenses.
  </p>

  {pendingOrders.length === 0 ? (
    <p className="py-8 text-center text-slate-500">
      No pending orders. Click Read Gmail to sync.
    </p>
  ) : (
    <div className="space-y-4">
      {pendingOrders.map((order) => (
        <div
          key={order._id}
          className="p-4 rounded-xl bg-slate-800/50
          border border-slate-700"
        >
          <div className="flex flex-col sm:flex-row
          sm:items-center sm:justify-between gap-4">

            <div className="min-w-0">
              <h3 className="font-semibold">
                {order.merchant} — {order.title}
              </h3>

              <p className="text-emerald-400 font-bold mt-2">
                {formatCurrency(order.amount)}
              </p>

              <p className="text-sm text-slate-400 mt-1">
                {order.category} ·{" "}
                {new Date(order.date).toLocaleDateString("en-IN")}
              </p>

              <p className="text-xs text-slate-500 mt-2 break-words">
                {order.subject}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                disabled={reviewLoading}
                onClick={() => handleApproveOrder(order._id)}
                className="px-4 py-2 rounded-lg bg-emerald-500
                text-slate-950 font-semibold
                hover:bg-emerald-400 disabled:opacity-50"
              >
                Approve
              </button>

              <button
                disabled={reviewLoading}
                onClick={() => handleIgnoreOrder(order._id)}
                className="px-4 py-2 rounded-lg bg-slate-700
                text-white hover:bg-red-500/20
                hover:text-red-400 disabled:opacity-50"
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</section>
          {/* GMAIL TRANSACTIONS */}
          <section
            id="gmail"
            className="bg-[#111b2c] border border-slate-800 rounded-2xl p-5 sm:p-7"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
                ✉
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Gmail Transactions
                </h2>
                <p className="text-sm text-slate-400">
                  Financial emails retrieved from Gmail
                </p>
              </div>
            </div>

            {gmailMessages.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                No transaction emails loaded.
                <p className="text-sm mt-2">
                  Connect Gmail to retrieve your financial emails.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {gmailMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                  >
                    <h3 className="font-semibold">
                      {message.subject || "No Subject"}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      {message.from}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {message.date
                        ? new Date(
                            message.date
                          ).toLocaleDateString("en-IN")
                        : "Unknown date"}
                    </p>

                    <p className="text-sm text-slate-300 mt-3">
                      {message.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="text-center text-xs text-slate-600 mt-10">
            SpendSense · Personal Finance Dashboard
          </footer>
        </main>
      </div>
    </div>
  );
}

// =========================
// REUSABLE SUMMARY CARD
// =========================

function SummaryCard({
  title,
  amount,
  icon,
  accent,
  subtitle,
}) {
  const accentStyles = {
    emerald: {
      icon: "bg-emerald-500/10 text-emerald-400",
      amount: "text-emerald-400",
    },
    rose: {
      icon: "bg-rose-500/10 text-rose-400",
      amount: "text-rose-400",
    },
  };

  const styles = accentStyles[accent] || accentStyles.emerald;

  return (
    <div className="bg-[#111b2c] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-400 font-medium">
          {title}
        </p>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${styles.icon}`}
        >
          {icon}
        </div>
      </div>

      <h2 className={`text-3xl font-bold mt-5 break-words ${styles.amount}`}>
        {formatCurrency(amount)}
      </h2>

      <p className="text-xs text-slate-500 mt-3">
        {subtitle}
      </p>
    </div>
  );
}

// Helper for the month offset used by the 6-month chart.
function currentDateMonthOffset(month) {
  return month - 1;
}

export default Dashboard;