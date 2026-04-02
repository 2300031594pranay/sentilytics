import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Analyzer", path: "/analyzer" },
  { label: "About", path: "/about" },
  { label: "Admin", path: "/admin" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary" />
          <span className="font-display text-lg font-bold gradient-text">Sentilytics</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
