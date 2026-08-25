import { useState } from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

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
          Login
        </h2>

        <form onSubmit={handleSubmit}>

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

          <label className="block mb-2 font-medium">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-5 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>

        </form>

        <p className="text-center mt-5 text-gray-600">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:underline"
          >
            
            Sign Up
          </Link>
          
<div className="flex items-center my-5">
  <div className="flex-1 h-px bg-gray-300"></div>

  <span className="px-3 text-gray-500 text-sm">
    OR
  </span>

  <div className="flex-1 h-px bg-gray-300"></div>
</div>

<button
  type="button"
  className="w-full border border-gray-300 p-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50"
>
  <FcGoogle size={22} />
  Continue with Google
</button>

        </p>

      </div>

    </div>
  );
}

export default Login;