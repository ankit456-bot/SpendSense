import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import API from "../services/api";

function Analytics() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [expenses, setExpenses] = useState([]);

  // ==========================================
  // FETCH EXPENSES
  // ==========================================

  async function fetchExpenses() {
    try {
      const response = await API.get(
        `/expenses/${user.id}`
      );

      setExpenses(response.data);

    } catch (error) {
      console.log(
        "Analytics expense fetch error:",
        error
      );
    }
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ==========================================
  // GROUP EXPENSES BY CATEGORY
  // ==========================================

  const categoryTotals = {};

  expenses.forEach((expense) => {
    const category = expense.category;

    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }

    categoryTotals[category] +=
      Number(expense.amount);
  });

  const chartData = Object.entries(
    categoryTotals
  ).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // ==========================================
  // TOTAL EXPENSE
  // ==========================================

  const totalExpense = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0
  );

  // ==========================================
  // GROUP EXPENSES BY MONTH
  // ==========================================

  const monthlyTotals = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);

    const monthName = date.toLocaleString(
      "en-IN",
      {
        month: "short"
      }
    );

    const year = date.getFullYear();

    const key = `${monthName} ${year}`;

    if (!monthlyTotals[key]) {
      monthlyTotals[key] = 0;
    }

    monthlyTotals[key] +=
      Number(expense.amount);
  });

  const monthlyChartData = Object.entries(
    monthlyTotals
  ).map(([month, amount]) => ({
    month,
    amount
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <h1 className="text-4xl font-bold mb-2">
          Analytics
        </h1>

        <p className="text-gray-600 mb-8">
          Understand your spending patterns
        </p>


        {/* ======================================
            TOTAL EXPENSE
        ====================================== */}

        <div className="bg-white p-6 rounded-xl shadow mb-8">

          <p className="text-gray-500">
            Total Expenses
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            ₹
            {totalExpense.toLocaleString(
              "en-IN"
            )}
          </h2>

        </div>


        {/* ======================================
            CATEGORY CHART
        ====================================== */}

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-2xl font-semibold mb-6">
            Expenses by Category
          </h2>

          {chartData.length === 0 ? (

            <p className="text-gray-500 text-center py-10">
              No expense data available.
            </p>

          ) : (

            <div className="w-full h-[400px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label
                  >

                    {chartData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>


        {/* ======================================
            MONTHLY EXPENSE CHART
        ====================================== */}

        <div className="bg-white p-6 rounded-xl shadow mt-8">

          <h2 className="text-2xl font-semibold mb-6">
            Monthly Expenses
          </h2>

          {monthlyChartData.length === 0 ? (

            <p className="text-gray-500 text-center py-10">
              No monthly expense data available.
            </p>

          ) : (

            <div className="w-full h-[400px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={monthlyChartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="amount"
                    name="Expenses"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Analytics;