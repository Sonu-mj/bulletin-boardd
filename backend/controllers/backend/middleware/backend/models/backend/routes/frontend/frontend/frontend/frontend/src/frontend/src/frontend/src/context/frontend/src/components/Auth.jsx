import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ink:       #0f0e0d;
    --ink-soft:  #2a2825;
    --ink-muted: #6b6560;
    --paper:     #f5f2ec;
    --paper-dim: #e8e4dc;
    --cream:     #faf8f4;
    --accent:    #c8401a;
    --accent-dim:#e8a088;
    --rule:      rgba(15,14,13,0.12);
    --modal-bg:  rgba(15,14,13,0.72);
    --radius:    2px;
    --font-serif: 'DM Serif Display', Georgia, serif;
    --font-mono:  'DM Mono', 'Courier New', monospace;
    --font-sans:  'DM Sans', system-ui, sans-serif;
  }

  .auth-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--modal-bg);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .auth-card {
    background: var(--cream);
    width: 100%;
    max-width: 400px;
    position: relative;
    border: 1px solid var(--rule);
    box-shadow: 0 0 0 1px rgba(15,14,13,0.04), 0 24px 64px rgba(15,14,13,0.22), 0 8px 24px rgba(15,14,13,0.12);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .auth-header {
    padding: 36px 36px 0;
    border-bottom: 1px solid var(--rule);
    padding-bottom: 0;
  }

  .auth-wordmark {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 20px;
  }

  .auth-wordmark span { color: var(--accent); }

  .auth-tabs {
    display: flex;
    gap: 0;
    position: relative;
  }

  .auth-tab {
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
    padding: 12px 20px 14px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink-muted);
    position: relative;
    transition: color 0.2s;
    flex: 1;
    text-align: center;
  }

  .auth-tab.active { color: var(--ink); }

  .auth-tab-indicator {
    position: absolute;
    bottom: 0;
    height: 2px;
    background: var(--ink);
    border-radius: 2px 2px 0 0;
  }

  .auth-body { padding: 32px 36px 36px; }

  .auth-headline {
    font-family: var(--font-serif);
    font-size: 26px;
    font-style: italic;
    color: var(--ink);
    margin: 0 0 6px;
    line-height: 1.2;
  }

  .auth-subtext {
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 300;
    color: var(--ink-muted);
    margin: 0 0 28px;
    line-height: 1.5;
  }

  .auth-field { margin-bottom: 16px; }

  .auth-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 6px;
  }

  .auth-input {
    width: 100%;
    padding: 11px 14px;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--ink);
    background: var(--paper);
    border: 1px solid var(--paper-dim);
    border-radius: var(--radius);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.18s, box-shadow 0.18s;
    -webkit-appearance: none;
  }

  .auth-input::placeholder { color: var(--ink-muted); opacity: 0.5; }
  .auth-input:focus { border-color: var(--ink-soft); box-shadow: 0 0 0 3px rgba(15,14,13,0.06); }
  .auth-input.error { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(200,64,26,0.08); }

  .auth-hint {
    font-family: var(--font-sans);
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 5px;
    font-weight: 300;
  }

  .auth-error {
    background: rgba(200,64,26,0.07);
    border: 1px solid rgba(200,64,26,0.18);
    border-radius: var(--radius);
    padding: 10px 14px;
    margin-bottom: 18px;
    font-family: var(--font-sans);
    font-size: 13px;
    color: var(--accent);
    font-weight: 400;
  }

  .auth-submit {
    width: 100%;
    padding: 13px;
    margin-top: 8px;
    background: var(--ink);
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    transition: background 0.18s, transform 0.12s;
  }

  .auth-submit:hover:not(:disabled) { background: var(--ink-soft); }
  .auth-submit:active:not(:disabled) { transform: scale(0.99); }
  .auth-submit:disabled { opacity: 0.55; cursor: not-allowed; }

  .auth-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 28px;
    height: 28px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.15s, color 0.15s;
    font-size: 18px;
    line-height: 1;
  }

  .auth-close:hover { background: var(--paper-dim); color: var(--ink); }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(245,242,236,0.3);
    border-top-color: var(--cream);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
  }

  .nav-auth { position: relative; display: inline-block; }

  .nav-user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px 7px 10px;
    background: none;
    border: 1px solid var(--rule);
    border-radius: 100px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    font-family: var(--font-sans);
    color: var(--ink);
  }

  .nav-user-btn:hover { background: var(--paper-dim); border-color: rgba(15,14,13,0.22); }

  .nav-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--cream);
    flex-shrink: 0;
    text-transform: uppercase;
  }

  .nav-display-name {
    font-size: 13px;
    font-weight: 500;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nav-chevron { width: 14px; height: 14px; color: var(--ink-muted); transition: transform 0.2s; flex-shrink: 0; }
  .nav-chevron.open { transform: rotate(180deg); }

  .nav-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 210px;
    background: var(--cream);
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    box-shadow: 0 4px 24px rgba(15,14,13,0.12), 0 1px 6px rgba(15,14,13,0.08);
    overflow: hidden;
    z-index: 500;
  }

  .nav-dropdown-header { padding: 14px 16px 10px; border-bottom: 1px solid var(--rule); }

  .nav-dropdown-role {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 2px;
  }

  .nav-dropdown-username { font-family: var(--font-mono); font-size: 13px; color: var(--ink); }
  .nav-dropdown-items { padding: 6px 0; }

  .nav-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 400;
    color: var(--ink-soft);
    text-align: left;
    text-decoration: none;
    transition: background 0.12s, color 0.12s;
  }

  .nav-dropdown-item:hover { background: var(--paper-dim); color: var(--ink); }
  .nav-dropdown-item.danger { color: var(--accent); }
  .nav-dropdown-item.danger:hover { background: rgba(200,64,26,0.07); }
  .nav-dropdown-divider { height: 1px; background: var(--rule); margin: 6px 0; }
  .nav-dropdown-icon { width: 15px; height: 15px; flex-shrink: 0; opacity: 0.65; }

  .nav-signin-btn {
    padding: 8px 18px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--cream);
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    transition: background 0.15s;
  }

  .nav-signin-btn:hover { background: var(--ink-soft); }
`;

function useInjectStyles(id, styles) {
  useEffect(() => {
    if (document.getElementById(id)) return;
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = styles;
    document.head.appendChild(tag);
  }, []);
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } },
  exit: { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.16, ease: "easeIn" } },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 500, damping: 32 } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.14 } },
};

const tabContentVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

export function AuthModal({ isOpen, onClose, defaultTab = "login" }) {
  useInjectStyles("anon-bulletin-auth-css", css);
  const [tab, setTab] = useState(defaultTab);
  const { register, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchTab(next) {
    setTab(next);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleSubmit() {
    setError("");
    if (!username.trim() || !password) return setError("Please fill in all fields.");
    if (tab === "register") {
      if (username.trim().length < 3) return setError("Username must be at least 3 characters.");
      if (!/^[a-z0-9_]+$/i.test(username.trim())) return setError("Username may only contain letters, numbers, and underscores.");
      if (password.length < 8) return setError("Password must be at least 8 characters.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
    }
    setLoading(true);
    try {
      if (tab === "register") {
        await register(username.trim().toLowerCase(), password);
      } else {
        await login(username.trim().toLowerCase(), password);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !loading) handleSubmit();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="auth-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit" onClick={handleBackdropClick}>
          <motion.div className="auth-card" variants={cardVariants} initial="hidden" animate="visible" exit="exit" role="dialog" aria-modal="true">
            <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
            <div className="auth-header">
              <div className="auth-wordmark"><span>///</span> Anonymous Board</div>
              <div className="auth-tabs" role="tablist">
                <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => switchTab("login")}>Log In</button>
                <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => switchTab("register")}>Create Account</button>
                <motion.div className="auth-tab-indicator" animate={{ left: tab === "login" ? "0%" : "50%", width: "50%" }} transition={{ type: "spring", stiffness: 500, damping: 38 }} />
              </div>
            </div>
            <div className="auth-body">
              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.div key="login" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    <p className="auth-headline">Welcome back.</p>
                    <p className="auth-subtext">No email. No tracking. Just your handle.</p>
                    {error && <div className="auth-error">{error}</div>}
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="login-username">Username</label>
                      <input id="login-username" className={`auth-input ${error ? "error" : ""}`} type="text" placeholder="your_handle" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />
                    </div>
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="login-password">Password</label>
                      <input id="login-password" className={`auth-input ${error ? "error" : ""}`} type="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />
                    </div>
                    <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
                      {loading ? <span className="spinner" /> : "Enter the board →"}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="register" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    <p className="auth-headline">Go anonymous.</p>
                    <p className="auth-subtext">No email, no phone, no verification — ever.</p>
                    {error && <div className="auth-error">{error}</div>}
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="reg-username">Choose a username</label>
                      <input id="reg-username" className={`auth-input ${error ? "error" : ""}`} type="text" placeholder="your_handle" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />
                      <p className="auth-hint">3–24 chars · letters, numbers, underscores only</p>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="reg-password">Password</label>
                      <input id="reg-password" className={`auth-input ${error ? "error" : ""}`} type="password" placeholder="Min 8 characters" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />
                    </div>
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="reg-confirm">Confirm password</label>
                      <input id="reg-confirm" className={`auth-input ${confirmPassword && confirmPassword !== password ? "error" : ""}`} type="password" placeholder="Repeat password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />
                    </div>
                    <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
                      {loading ? <span className="spinner" /> : "Create account →"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function UserDropdown({ onNavigate }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function go(path) {
    setOpen(false);
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/");
  }

  if (!user) return null;
  const initial = (user.displayName || user.username)?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="nav-auth" ref={ref}>
      <button className="nav-user-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open}>
        <div className="nav-avatar">{initial}</div>
        <span className="nav-display-name">{user.displayName || user.username}</span>
        <svg className={`nav-chevron ${open ? "open" : ""}`} viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="nav-dropdown" variants={dropdownVariants} initial="hidden" animate="visible" exit="exit" role="menu">
            <div className="nav-dropdown-header">
              <div className="nav-dropdown-role">{user.role === "admin" ? "● Admin" : "● Member"}</div>
              <div className="nav-dropdown-username">@{user.username}</div>
            </div>
            <div className="nav-dropdown-items">
              <button className="nav-dropdown-item" onClick={() => go(`/profile/${user.username}`)}>
                <svg className="nav-dropdown-icon" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="7" width="12" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="12" width="7" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.3"/></svg>
                My Posts
              </button>
              <button className="nav-dropdown-item" onClick={() => go("/settings")}>
                <svg className="nav-dropdown-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Profile Settings
              </button>
              <button className="nav-dropdown-item" onClick={() => go("/message-admin")}>
                <svg className="nav-dropdown-icon" viewBox="0 0 16 16" fill="none"><path d="M2 3h12v8H9l-3 2v-2H2V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                Message Admin
              </button>
              <div className="nav-dropdown-divider" />
              <button className="nav-dropdown-item danger" onClick={handleLogout}>
                <svg className="nav-dropdown-icon" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Logout
              </button>
            </div>
  
