import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // OTP sent successfully - navigate to OTP verification page
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Register
        </h1>

        <p className="text-sm text-slate-400 text-center mb-8">
          Create your account to start attempting quizzes
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline cursor-pointer">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
