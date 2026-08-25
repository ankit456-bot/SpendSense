function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r min-h-screen p-5">

        <h1 className="text-2xl font-bold text-blue-600 mb-8">
          SpendSense
        </h1>

        <nav className="space-y-2">

          <button className="w-full text-left p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
            🏠 Dashboard
          </button>

          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">
            💳 Expenses
          </button>

          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">
            🎯 Budget
          </button>

          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">
            📊 Analytics
          </button>

          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">
            📧 Gmail
          </button>

          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">
            👤 Profile
          </button>

        </nav>

        <div className="mt-10">

          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">
            ⚙️ Settings
          </button>

          <button className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-red-500">
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* Main Content */}
      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center">

          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Good evening, Ankit 👋
            </h2>

            <p className="text-slate-500 mt-1">
              Here's your financial overview.
            </p>
          </div>

          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            👤 Ankit
          </div>

        </div>


        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mt-8">

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500">
              Total Expenses
            </p>

            <h3 className="text-3xl font-bold mt-2">
              ₹25,400
            </h3>

            <p className="text-green-600 text-sm mt-2">
              ↓ 8% from last month
            </p>
          </div>


          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500">
              Monthly Budget
            </p>

            <h3 className="text-3xl font-bold mt-2">
              ₹30,000
            </h3>

            <p className="text-blue-600 text-sm mt-2">
              85% used
            </p>
          </div>


          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500">
              Remaining
            </p>

            <h3 className="text-3xl font-bold text-green-600 mt-2">
              ₹4,600
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Available this month
            </p>
          </div>

        </div>


        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mt-8">

          <div className="bg-white rounded-xl shadow-sm p-6 h-80">

            <h3 className="text-lg font-semibold">
              Spending Overview
            </h3>

            <div className="h-full flex items-center justify-center text-gray-400">
              Chart will appear here
            </div>

          </div>


          <div className="bg-white rounded-xl shadow-sm p-6 h-80">

            <h3 className="text-lg font-semibold">
              Expense Categories
            </h3>

            <div className="h-full flex items-center justify-center text-gray-400">
              Category chart will appear here
            </div>

          </div>

        </div>


        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">

          <h3 className="text-lg font-semibold mb-4">
            Recent Transactions
          </h3>

          <div className="space-y-4">

            <div className="flex justify-between border-b pb-3">
              <div>
                <p className="font-medium">Amazon</p>
                <p className="text-sm text-gray-500">
                  Shopping
                </p>
              </div>

              <p className="font-semibold">
                - ₹1,299
              </p>
            </div>


            <div className="flex justify-between border-b pb-3">
              <div>
                <p className="font-medium">Swiggy</p>
                <p className="text-sm text-gray-500">
                  Food
                </p>
              </div>

              <p className="font-semibold">
                - ₹450
              </p>
            </div>


            <div className="flex justify-between">
              <div>
                <p className="font-medium">Netflix</p>
                <p className="text-sm text-gray-500">
                  Entertainment
                </p>
              </div>

              <p className="font-semibold">
                - ₹649
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;