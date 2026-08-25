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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white w-96 p-8 rounded-xl shadow-lg">

        <h1 className="text-3xl font-bold text-blue-600 text-center">
          SpendSense
        </h1>

        <h2 className="text-xl font-semibold text-center mt-2 mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <label className="block mb-2 font-medium">
            Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 outline-none focus:border-blue-500"
          />

          {/* Email */}
          <label className="block mb-2 font-medium">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 outline-none focus:border-blue-500"
          />

          {/* Password */}
          <label className="block mb-2 font-medium">
            Password
          </label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-5 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Create Account
          </button>

        </form>

        <p className="text-center mt-5 text-gray-600">
          Already have an account?{" "}

          <Link
            to="/"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;