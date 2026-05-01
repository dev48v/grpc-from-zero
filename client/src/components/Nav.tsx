// STEP 9 — Top nav bar.

import { Link, NavLink } from "react-router-dom";

export function Nav() {
  return (
    <header className="nav">
      <Link to="/" className="brand">
        <span className="brand-mark">W</span>
        <span className="brand-text">
          Word Library<span className="brand-suffix"> · gRPC</span>
        </span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <a
          className="nav-external"
          href="https://github.com/dev48v/grpc-from-zero"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}
