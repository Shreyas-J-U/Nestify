import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import Dashboard from "./pages/Dashboard/index"; // Updated import path
import AuthSuccess from "./pages/AuthSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import SharedFile from "./pages/SharedFile.jsx";
import SharedDrive from "./pages/SharedDrive.jsx"; 
import SharedFolder from './pages/SharedFolder'; 

function AppWrapper() {
  const location = useLocation();
  
  // Hide Navbar on shared file, shared drive, or shared folder pages
  const hideNavbar =
    location.pathname.startsWith("/share/file/") ||
    location.pathname.startsWith("/share/drive/") ||
    location.pathname.startsWith("/share/folder/"); // Added shared folder path
    
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/share/file/:token" element={<SharedFile />} />
        <Route path="/share/drive/:token" element={<SharedDrive />} />
        <Route path="/share/folder/:token" element={<SharedFolder />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
