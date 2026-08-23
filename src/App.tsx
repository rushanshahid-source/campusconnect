import { Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import ItemDetail from "./pages/ItemDetail";
import ProjectGraveyard from "./pages/ProjectGraveyard";
import AcademicMarketplace from "./pages/AcademicMarketplace";
import SkillsMarketplace from "./pages/SkillsMarketplace";
import Subscriptions from "./pages/Subscriptions";
import Chat from "./pages/Chat";
import Deals from "./pages/Deals";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminCenter from "./pages/AdminCenter";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/market" element={<Market />} />
      <Route path="/market/:id" element={<ItemDetail />} />
      <Route path="/projects" element={<ProjectGraveyard />} />
      <Route path="/academic" element={<AcademicMarketplace />} />
      <Route path="/skills" element={<SkillsMarketplace />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/deals" element={<Deals />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/control-center" element={<AdminCenter />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
