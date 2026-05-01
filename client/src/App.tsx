// STEP 10 — App shell with routes.

import { Routes, Route } from "react-router-dom";
import { Nav } from "./components/Nav";
import { Home } from "./pages/Home";
import { Detail } from "./pages/Detail";

function NotFound() {
  return (
    <section className="state state-empty">
      <h2>404</h2>
      <p>That page doesn't exist. Try the navigation above.</p>
    </section>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Nav />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word/:word" element={<Detail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <span>grpc-from-zero · Day 26 · TechFromZero series</span>
        <span>Data: Free Dictionary API · Transport: Connect-RPC</span>
      </footer>
    </div>
  );
}
