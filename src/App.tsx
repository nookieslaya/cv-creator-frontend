import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import SkillsPage from "./pages/SkillsPage";
import ProjectsPage from "./pages/ProjectsPage";
import ExperiencePage from "./pages/ExperiencePage";
import EducationPage from "./pages/EducationPage";
import LanguagesPage from "./pages/LanguagesPage";
import CvGeneratorPage from "./pages/CvGeneratorPage";

export default function App() {
  return (
    <>
      <SignedOut>
        <AuthPage />
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="education" element={<EducationPage />} />
            <Route path="languages" element={<LanguagesPage />} />
            <Route path="cv" element={<CvGeneratorPage />} />
            <Route path="*" element={<Navigate to="/profile" replace />} />
          </Route>
        </Routes>
      </SignedIn>
    </>
  );
}
