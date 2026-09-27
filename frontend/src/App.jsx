import React, { useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  LogIn,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { api, clearSession, saveSession } from "./api";
import Dashboard from "./pages/Dashboard";
import PublicPortfolio from "./pages/PublicPortfolio";

// =========================
// HEADER
// =========================

function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("portfolio_token");

  function logout() {
    clearSession();
    navigate("/login");
  }

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>

          <span>
            Portfolia<span className="dot">.</span>
          </span>
        </Link>

        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav
          className={open ? "nav-links mobile-open" : "nav-links"}
        >
          <a
            href="#features"
            onClick={() => setOpen(false)}
          >
            Features
          </a>

          <a
            href="#workflow"
            onClick={() => setOpen(false)}
          >
            Workflow
          </a>

          {token ? (
            <button
              className="nav-button"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard");
              }}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          ) : (
            <button
              className="nav-button"
              onClick={() => {
                setOpen(false);
                navigate("/login");
              }}
            >
              <LogIn size={16} />
              Creator Login
            </button>
          )}

          {token && (
            <button
              className="text-button"
              onClick={logout}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

// =========================
// HOME
// =========================

function Home() {
  return (
    <>
      <Header />

      <main>
        {/* HERO */}
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} />
              YOUR WORK, BEAUTIFULLY PRESENTED
            </div>

            <h1>
              Build a portfolio that feels{" "}
              <span>uniquely yours.</span>
            </h1>

            <p className="hero-text">
              Manage your professional story from one
              elegant dashboard and publish a fast,
              responsive portfolio with a unique
              username URL.
            </p>

            <div className="hero-actions">
              <Link
                to="/register"
                className="primary-button"
              >
                Create your portfolio
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/portfolio/sania"
                className="secondary-button"
              >
                View demo
                <ExternalLink size={17} />
              </Link>
            </div>

            <div className="trust-row">
              <span>
                <CheckCircle2 size={16} />
                REST API
              </span>

              <span>
                <CheckCircle2 size={16} />
                Secure dashboard
              </span>

              <span>
                <CheckCircle2 size={16} />
                Responsive
              </span>
            </div>
          </div>

          {/* HERO PREVIEW */}
          <div className="hero-preview">
            <div className="window-bar">
              <i></i>
              <i></i>
              <i></i>

              <span>
                portfolio / sania
              </span>
            </div>

            <div className="preview-card">
              <div className="preview-avatar">
                SA
              </div>

              <div>
                <span className="mini-label">
                  FULL STACK DEVELOPER
                </span>

                <h3>Sania Arif</h3>

                <p>
                  Building useful digital experiences
                  with code & design.
                </p>
              </div>

              <div className="preview-stats">
                <div>
                  <strong>08</strong>
                  <small>Projects</small>
                </div>

                <div>
                  <strong>12</strong>
                  <small>Skills</small>
                </div>

                <div>
                  <strong>03</strong>
                  <small>Years</small>
                </div>
              </div>

              <div className="preview-projects">
                <div className="tiny-project"></div>
                <div className="tiny-project second"></div>
                <div className="tiny-project third"></div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="section container"
        >
          <div className="section-heading">
            <span className="section-kicker">
              ONE PLACE. FULL CONTROL.
            </span>

            <h2>
              Everything you need to manage your
              professional presence.
            </h2>
          </div>

          <div className="feature-grid">
            <Feature
              icon={<LayoutDashboard />}
              title="Creator Dashboard"
              text="Update your profile, skills, social links and projects without touching code."
            />

            <Feature
              icon={<Globe2 />}
              title="Public Profile"
              text="Give your portfolio a memorable username URL that works beautifully on every screen."
            />

            <Feature
              icon={<BriefcaseBusiness />}
              title="Project Showcase"
              text="Add rich project details, technology tags, images and live or GitHub links."
            />
          </div>
        </section>

        {/* WORKFLOW */}
        <section
          id="workflow"
          className="section container workflow"
        >
          <div className="workflow-panel">
            <div>
              <span className="section-kicker">
                SIMPLE WORKFLOW
              </span>

              <h2>
                From idea to public profile
                in a few steps.
              </h2>
            </div>

            <div className="steps">
              <Step
                n="01"
                title="Create"
                text="Register and choose your unique username."
              />

              <Step
                n="02"
                title="Customize"
                text="Add your story, skills, links and projects."
              />

              <Step
                n="03"
                title="Publish"
                text="Share your public portfolio URL anywhere."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta container">
          <div>
            <span className="section-kicker">
              READY TO BUILD?
            </span>

            <h2>
              Your next opportunity deserves
              a great first impression.
            </h2>
          </div>

          <Link
            to="/register"
            className="primary-button"
          >
            Start building
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          Portfolia © 2026 · EncoderX Week 03 Project
        </div>
      </footer>
    </>
  );
}

// =========================
// FEATURE CARD
// =========================

function Feature({ icon, title, text }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

// =========================
// WORKFLOW STEP
// =========================

function Step({ n, title, text }) {
  return (
    <div className="step">
      <span>{n}</span>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

// =========================
// LOGIN / REGISTER
// =========================

function Auth({ mode }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();

  const [form, setForm] = useState(
    isLogin
      ? {
          email: "demo@portfolio.dev",
          password: "Demo@12345",
        }
      : {
          name: "",
          username: "",
          email: "",
          password: "",
        }
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin
        ? "/auth/login"
        : "/auth/register";

      const response = await api.post(
        endpoint,
        form
      );

      saveSession(response.data);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/">
        <span className="brand-mark">
          <Sparkles size={17} />
        </span>

        Portfolia
        <span className="dot">.</span>
      </Link>

      <div className="auth-card">
        <div className="auth-icon">
          <UserRound />
        </div>

        <span className="section-kicker">
          {isLogin
            ? "WELCOME BACK"
            : "CREATE YOUR SPACE"}
        </span>

        <h1>
          {isLogin
            ? "Creator login"
            : "Build your portfolio"}
        </h1>

        <p>
          {isLogin
            ? "Sign in to manage your professional profile."
            : "Set up your account and publish your own portfolio."}
        </p>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          {!isLogin && (
            <>
              <label>
                Full name

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Your name"
                  required
                />
              </label>

              <label>
                Username

                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      username: e.target.value,
                    })
                  }
                  placeholder="e.g. sania"
                  required
                />
              </label>
            </>
          )}

          <label>
            Email

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              placeholder="Minimum 8 characters"
              required
            />
          </label>

          <button
            className="primary-button full"
            disabled={loading}
            type="submit"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign in"
              : "Create account"}

            <ArrowRight size={17} />
          </button>
        </form>

        {isLogin ? (
          <p className="switch">
            New creator?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        ) : (
          <p className="switch">
            Already registered?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        )}
      </div>

      <p className="auth-note">
        Demo login is pre-filled.
        Seed the backend database first.
      </p>
    </div>
  );
}

// =========================
// PROTECTED ROUTE
// =========================

function Protected({ children }) {
  const token =
    localStorage.getItem("portfolio_token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

// =========================
// MAIN APP
// =========================

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={
          <Auth mode="login" />
        }
      />

      <Route
        path="/register"
        element={
          <Auth mode="register" />
        }
      />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />

      <Route
        path="/portfolio/:username"
        element={
          <PublicPortfolio />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}