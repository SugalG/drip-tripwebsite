import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin login will be implemented with Lovable Cloud
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        <div className="p-8 rounded-3xl gradient-card shadow-card border border-border/50">
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl gradient-button flex items-center justify-center mx-auto mb-4 shadow-button"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Lock className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold gradient-text">
              Admin Login
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to manage your store
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="admin@vapecloud.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <motion.button
              type="submit"
              className="w-full py-4 rounded-xl gradient-button text-primary-foreground font-semibold shadow-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Contact support if you need access
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Admin;
