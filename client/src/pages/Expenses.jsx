import { useEffect, useState } from "react";
import API from "../services/api";

function Expenses() {
  const [expenses, setExpenses] = useState([]);

  const [editingExpense, setEditingExpense] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");

  // ==========================================
  // FETCH EXPENSES
  // ==========================================
async function fetchExpenses() {
  try {
    const token = localStorage.getItem("token");

    const response = await API.get(
      "/expenses",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setExpenses(response.data);

  } catch (error) {
    console.log(
      "Expense fetch error:",
      error
    );
  }
}

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ==========================================
  // START EDITING
  // ==========================================

  function handleEdit(expense) {
    setEditingExpense(expense);

    setEditTitle(expense.title);
    setEditAmount(expense.amount);
    setEditCategory(expense.category);

    setEditDate(
      new Date(expense.date)
        .toISOString()
        .split("T")[0]
    );
  }

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  function cancelEdit() {
    setEditingExpense(null);

    setEditTitle("");
    setEditAmount("");
    setEditCategory("");
    setEditDate("");
  }

  // ==========================================
  // UPDATE EXPENSE
  // ==========================================

  async function handleUpdate() {
    try {
      const response = await API.put(
        `/expenses/${editingExpense._id}`,
        {
          title: editTitle,
          amount: Number(editAmount),
          category: editCategory,
          date: editDate
        }
      );

      setExpenses((currentExpenses) =>
        currentExpenses.map((expense) =>
          expense._id === editingExpense._id
            ? response.data.expense
            : expense
        )
      );

      cancelEdit();

      alert("Expense updated successfully");

    } catch (error) {
      console.log(
        "Update expense error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to update expense"
      );
    }
  }

  // ==========================================
  // DELETE EXPENSE
  // ==========================================

  async function handleDelete(expense) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/expenses/${expense._id}`
      );

      setExpenses((currentExpenses) =>
        currentExpenses.filter(
          (item) => item._id !== expense._id
        )
      );

      alert("Expense deleted successfully");

    } catch (error) {
      console.log(
        "Delete expense error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to delete expense"
      );
    }
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <h1 className="text-4xl font-bold mb-2">
          Expenses
        </h1>

        <p className="text-gray-600 mb-8">
          Manage your expenses
        </p>


        {/* ======================================
            EDIT FORM
        ====================================== */}

        {editingExpense && (
          <div className="bg-white p-6 rounded-xl shadow mb-8">

            <h2 className="text-2xl font-bold mb-6">
              Edit Expense
            </h2>


            {/* TITLE */}

            <div className="mb-4">

              <label className="block font-medium mb-2">
                Title
              </label>

              <input
                type="text"
                value={editTitle}
                onChange={(e) =>
                  setEditTitle(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

            </div>


            {/* AMOUNT */}

            <div className="mb-4">

              <label className="block font-medium mb-2">
                Amount
              </label>

              <input
                type="number"
                value={editAmount}
                onChange={(e) =>
                  setEditAmount(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

            </div>


            {/* CATEGORY */}

            <div className="mb-4">

              <label className="block font-medium mb-2">
                Category
              </label>

              <select
                value={editCategory}
                onChange={(e) =>
                  setEditCategory(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              >
                <option value="Food">
                  Food
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Transport">
                  Transport
                </option>

                <option value="Subscription">
                  Subscription
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>


            {/* DATE */}

            <div className="mb-6">

              <label className="block font-medium mb-2">
                Date
              </label>

              <input
                type="date"
                value={editDate}
                onChange={(e) =>
                  setEditDate(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

            </div>


            {/* BUTTONS */}

            <div className="flex gap-3">

              <button
                onClick={cancelEdit}
                className="px-5 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>

            </div>

          </div>
        )}


        {/* ======================================
            EXPENSE LIST
        ====================================== */}

        <div className="space-y-4">

          {expenses.length === 0 ? (

            <div className="bg-white p-8 rounded-xl shadow text-center">

              <p className="text-gray-500">
                No expenses found.
              </p>

            </div>

          ) : (

            expenses.map((expense) => (

              <div
                key={expense._id}
                className="bg-white p-6 rounded-xl shadow flex items-center justify-between"
              >

                {/* EXPENSE INFORMATION */}

                <div>

                  <h2 className="text-xl font-bold">
                    {expense.title}
                  </h2>

                  <p className="text-gray-500">
                    {expense.category}
                  </p>

                  <p className="text-gray-500">
                    {new Date(
                      expense.date
                    ).toLocaleDateString("en-IN")}
                  </p>

                </div>


                {/* RIGHT SIDE */}

                <div className="flex items-center gap-6">

                  <p className="text-xl font-bold text-red-600">
                    ₹{expense.amount}
                  </p>


                  {/* EDIT */}

                  <button
                    onClick={() =>
                      handleEdit(expense)
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>


                  {/* DELETE */}

                  <button
                    onClick={() =>
                      handleDelete(expense)
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default Expenses;