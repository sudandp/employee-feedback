import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UserCircle, Briefcase, Settings, LogOut, Target } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { name: "Admin", path: "/admin", icon: Settings },
    { name: "HR", path: "/hr", icon: Users },
    { name: "Manager", path: "/manager", icon: Briefcase },
    { name: "Employee", path: "/employee", icon: UserCircle },
    { name: "OKRs", path: "/okrs", icon: Target },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <LayoutDashboard className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-lg font-bold text-gray-900">EngageAnalytics</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.name} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-slate-100 rounded-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Link
                    to={item.path}
                    className={cn(
                      "relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors z-10",
                      isActive
                        ? "text-slate-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-slate-900" : "text-gray-400")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <LogOut className="w-5 h-5 mr-3 text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto py-8 px-8 min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
