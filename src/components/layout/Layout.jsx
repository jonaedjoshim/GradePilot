import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div
      className="flex min-h-screen w-full"
      style={{ background: "var(--gp-bg)" }}
    >
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />

        <main
          id="main-content"
          className="mx-auto w-full max-w-360 min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9"
        >
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
