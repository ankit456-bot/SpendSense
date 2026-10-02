import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  // Google Sign-In
  async function handleGoogleSuccess(credentialResponse) {
    try {
      const response = await API.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      console.log("Google login error:", error);
      alert(
        error.response?.data?.message || "Google login failed"
      );
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      {/* Background accents */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 shadow-lg shadow-emerald-950/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7 text-emerald-400"
              aria-hidden="true"
            >
              <path
                d="M4 18V6M4 18H20M8 15V11M12 15V7M16 15V9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Spend<span className="text-emerald-400">Sense</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Take control of your money, one step at a time.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to continue to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-20 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
              or continue with
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="flex justify-center overflow-hidden rounded-xl">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                alert("Google Sign-In failed. Please try again.");
              }}
              text="continue_with"
              shape="rectangular"
              width="320"
              theme="filled_black"
            />
          </div>

          <p className="mt-7 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-emerald-400 transition hover:text-emerald-300 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Spend smarter. Feel more in control.
        </p>
      </div>
    </div>
  );
}

export default Login;
