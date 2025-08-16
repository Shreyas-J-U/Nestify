import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Cloud, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  Home,
  LayoutDashboard,
  UserPlus,
  LogIn,
  User,
  ChevronDown
} from "lucide-react";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper for link classes - consistent clean design
  const linkClass = (path) => {
    const active = location.pathname === path;
    return (
      "relative group transition-all duration-300 px-4 py-2 rounded-xl font-medium flex items-center space-x-2 " +
      (active
        ? "bg-blue-100 text-blue-700 shadow-sm"
        : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
      )
    );
  };

  // Mobile link classes
  const mobileLinkClass = (path) => {
    const active = location.pathname === path;
    return (
      "flex items-center space-x-3 w-full text-left transition-all duration-300 px-4 py-3 rounded-xl font-medium " +
      (active
        ? "bg-blue-100 text-blue-700 shadow-sm"
        : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
      )
    );
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Close user menu when clicking outside
    const handleClickOutside = () => setShowUserMenu(false);
    document.addEventListener('click', handleClickOutside);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg" 
          : "bg-white/90 backdrop-blur-xl border-b border-slate-200/50"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Nestify
                </h1>
                <span className="text-xs font-medium text-slate-500 -mt-1">
                  Cloud Storage
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/" className={linkClass("/")}>
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              {!isAuthenticated ? (
                <>
                  <Link to="/login" className={linkClass("/login")}>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className={`group flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ml-2 ${
                      location.pathname === "/signup" ? "ring-2 ring-blue-300" : ""
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={linkClass("/dashboard")}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>

                  {/* User Profile Dropdown */}
                  <div className="relative ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserMenu(!showUserMenu);
                      }}
                      className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {user?.email?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-medium text-slate-800">
                          {user?.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {user?.email?.slice(0, 25)}...
                        </p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user?.email?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {user?.user_metadata?.full_name || "User"}
                              </p>
                              <p className="text-sm text-slate-600">{user?.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/dashboard"
                            className="flex items-center space-x-3 w-full px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-xl transition-all duration-300 text-slate-600 hover:bg-slate-100 ${
                  isMobileMenuOpen ? "bg-slate-100" : ""
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="px-4 py-6 space-y-3 bg-white/95 backdrop-blur-xl border-t border-slate-200">
            {/* User info for mobile */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl mb-4 border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {user.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-sm text-slate-600">{user.email}</p>
                </div>
              </div>
            )}

            <Link
              to="/"
              className={mobileLinkClass("/")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className={mobileLinkClass("/login")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className={`flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 ${
                    location.pathname === "/signup" ? "ring-2 ring-blue-300" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Sign Up</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={mobileLinkClass("/dashboard")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop for mobile menu */}
      <div className={`md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`} onClick={() => setIsMobileMenuOpen(false)} />

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
