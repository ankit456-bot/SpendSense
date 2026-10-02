import { useState } from "react";
import { Link } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">

      {/* Signup Card */}
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 shadow-2xl">

        {/* Logo / Brand */}
        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-[#00c98b] flex items-center justify-center">
              <span className="text-2xl font-bold text-[#020617]">
                S
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white">
            Smart<span className="text-[#00c98b]">Expense</span>
          </h1>

          <p className="text-[#94a3b8] mt-2">
            Create your account
          </p>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-[#cbd5e1] font-medium mb-2">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#020617] border border-[#334155] text-white placeholder-[#64748b] rounded-lg p-3 outline-none focus:border-[#00c98b] transition"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[#cbd5e1] font-medium mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#020617] border border-[#334155] text-white placeholder-[#64748b] rounded-lg p-3 outline-none focus:border-[#00c98b] transition"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[#cbd5e1] font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#020617] border border-[#334155] text-white placeholder-[#64748b] rounded-lg p-3 outline-none focus:border-[#00c98b] transition"
            />
          </div>

          {/* Create Account */}
          <button
            type="submit"
            className="w-full bg-[#00c98b] text-[#020617] font-semibold p-3 rounded-lg hover:bg-[#00b982] transition"
          >
            Create Account
          </button>

        </form>

        {/* Login */}
        <p className="text-center mt-6 text-[#94a3b8]">
          Already have an account?{" "}

          <Link
            to="/"
            className="text-[#00c98b] font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;