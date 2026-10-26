import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AppStateProvider } from "./context/AppState";
import { resolveSubjectId } from "./lib/content";
import { Dashboard } from "./pages/Dashboard";
import { FlashcardsPage } from "./pages/FlashcardsPage";
import { Materials } from "./pages/Materials";
import { PracticePage } from "./pages/PracticePage";
import { ProgressPage } from "./pages/ProgressPage";
import { Subject } from "./pages/Subject";
import { Verb } from "./pages/Verb";

/** Old links (lessons, materials, cards) land on the subject-first routes. */
function ToSubject() {
  const { id = "" } = useParams();
  return <Navigate to={`/subjects/${resolveSubjectId(id)}`} replace />;
}

function ToStudy() {
  const { search } = useLocation();
  return <Navigate to={`/study${search}`} replace />;
}

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<Materials />} />
            <Route path="subjects/:subjectId" element={<Subject />} />
            <Route path="verbs/:verbId" element={<Verb />} />
            <Route path="study" element={<FlashcardsPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="materials" element={<Navigate to="/subjects" replace />} />
            <Route path="materials/:id" element={<ToSubject />} />
            <Route path="lessons" element={<Navigate to="/subjects" replace />} />
            <Route path="lessons/:id" element={<ToSubject />} />
            <Route path="cards" element={<ToStudy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}
