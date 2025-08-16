import { useNavigate } from "react-router-dom";
import { 
  Cloud, 
  Shield, 
  Zap, 
  Sparkles, 
  ArrowRight,
  Play,
  Upload,
  Share2,
  Lock,
  Globe,
  Users,
  Star,
  CheckCircle,
  Folder,
  FileText
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current user on mount
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setIsLoading(false);
        // Trigger animations after loading is complete
        setTimeout(() => setIsVisible(true), 100);
      }
    };

    checkUser();

    // Listen for sign-in/sign-out changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Military-Grade Security",
      desc: "End-to-end encryption keeps your files completely private and secure",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      desc: "Upload and sync files instantly with our optimized infrastructure",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Globe,
      title: "Global Access",
      desc: "Access your files from anywhere in the world, on any device",
      color: "from-blue-400 to-indigo-500"
    }
  ];

  const stats = [
    { number: "10M+", label: "Files Stored" },
    { number: "99.9%", label: "Uptime" },
    { number: "150+", label: "Countries" },
    { number: "24/7", label: "Support" }
  ];

  // Loading Spinner Component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        {/* Animated background elements for loading */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full filter blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full filter blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Main Loading Spinner */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Logo with spinner */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-4 bg-white rounded-2xl shadow-xl">
              <Cloud className="w-12 h-12 text-blue-600 animate-pulse" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-ping" />
            </div>
          </div>

          {/* Spinning Circle Loader */}
          <div className="relative">
            {/* Outer ring */}
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin">
              {/* Inner gradient ring */}
              <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 border-r-indigo-500 rounded-full animate-spin"></div>
            </div>
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </div>

          {/* Loading Text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-slate-800 animate-pulse">
              Nestify
            </h3>
            <p className="text-slate-600 font-medium">
              Preparing your experience...
            </p>
          </div>

          {/* Floating mini loaders */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animation: `float ${3 + Math.random() * 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${15 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          >
            {i % 3 === 0 ? (
              <Cloud className="w-8 h-8 text-blue-400" />
            ) : i % 3 === 1 ? (
              <Folder className="w-6 h-6 text-indigo-400" />
            ) : (
              <FileText className="w-5 h-5 text-purple-400" />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
          <div className={`text-center space-y-12 max-w-6xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            
            {/* Logo/Brand */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-white rounded-2xl shadow-xl">
                  <Cloud className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Nestify
                </h1>
                <p className="text-slate-600 text-sm font-medium">Cloud Storage Reimagined</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-bold text-slate-800 leading-tight">
                  Your Files,
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Everywhere
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Store, sync, and share your files with the world's most secure and intuitive cloud storage platform.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                <button
                  onClick={() => navigate(user ? "/dashboard" : "/signup")}
                  className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
                >
                  <span className="text-lg">
                    {user ? "Go to Dashboard" : "Start Free Trial"}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                <button className="group flex items-center space-x-3 px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center transform transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-slate-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h3 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Why Choose Nestify?
              </h3>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Experience the perfect blend of security, speed, and simplicity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-white/70 backdrop-blur-lg border border-white/50 rounded-3xl p-8 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h4 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors duration-300">
                      {feature.title}
                    </h4>
                    
                    <p className="text-slate-600 text-lg leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 px-6 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h3 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Get Started in Seconds
              </h3>
              <p className="text-xl text-slate-600">
                Three simple steps to secure cloud storage
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  icon: Users,
                  title: "Create Account",
                  desc: "Sign up with your email and verify your account instantly"
                },
                {
                  step: "02",
                  icon: Upload,
                  title: "Upload Files",
                  desc: "Drag and drop your files or folders for instant upload"
                },
                {
                  step: "03",
                  icon: Share2,
                  title: "Share & Collaborate",
                  desc: "Share files securely with team members or the world"
                }
              ].map((item, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                      <item.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-slate-800 font-bold text-sm rounded-full flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-4">
                    {item.title}
                  </h4>
                  <p className="text-slate-600 text-lg">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/50">
              <div className="text-center mb-8">
                <div className="flex justify-center space-x-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <h4 className="text-2xl font-bold text-slate-800 mb-4">
                  Trusted by millions worldwide
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Shield, label: "Bank-level Security" },
                  { icon: CheckCircle, label: "99.9% Uptime" },
                  { icon: Lock, label: "Zero-Knowledge" },
                  { icon: Globe, label: "Global CDN" }
                ].map((trust, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-300"
                  >
                    <trust.icon className="w-8 h-8 text-blue-600 mb-3" />
                    <span className="text-sm font-semibold text-slate-700">
                      {trust.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join millions of users who trust Nestify with their most important files
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(user ? "/dashboard" : "/signup")}
                className="px-10 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform text-lg"
              >
                {user ? "Go to Dashboard" : "Start Free Trial"}
              </button>
              <button className="px-10 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0.6;
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(90deg); 
            opacity: 0.8;
          }
          50% { 
            transform: translateY(0px) translateX(20px) rotate(180deg); 
            opacity: 0.4;
          }
          75% { 
            transform: translateY(10px) translateX(5px) rotate(270deg); 
            opacity: 0.7;
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
