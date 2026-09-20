import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { AuthProvider } from './hooks/auth.jsx';
import { useScrollProgress } from './hooks/motion.js';

const Home = lazy(() => import('./pages/Home.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Sigma = lazy(() => import('./pages/Sigma.jsx'));
const Roadmap = lazy(() => import('./pages/Roadmap.jsx'));
const AgendaList = lazy(() => import('./pages/Agenda.jsx').then((m) => ({ default: m.AgendaList })));
const AgendaDetail = lazy(() => import('./pages/Agenda.jsx').then((m) => ({ default: m.AgendaDetail })));
const EventsList = lazy(() => import('./pages/Events.jsx').then((m) => ({ default: m.EventsList })));
const EventDetail = lazy(() => import('./pages/Events.jsx').then((m) => ({ default: m.EventDetail })));
const NewsList = lazy(() => import('./pages/News.jsx').then((m) => ({ default: m.NewsList })));
const NewsDetail = lazy(() => import('./pages/News.jsx').then((m) => ({ default: m.NewsDetail })));
const Media = lazy(() => import('./pages/Media.jsx'));
const VolunteerJoin = lazy(() => import('./pages/Volunteer.jsx').then((m) => ({ default: m.VolunteerJoin })));
const VolunteerLogin = lazy(() => import('./pages/Volunteer.jsx').then((m) => ({ default: m.VolunteerLogin })));
const Dashboard = lazy(() => import('./pages/Volunteer.jsx').then((m) => ({ default: m.Dashboard })));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function PageLoading() {
  const { t } = useTranslation();
  return (
    <div className="pt-40 pb-24 text-center" role="status" aria-live="polite">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-yellow/30 border-t-yellow" aria-hidden="true" />
      <p className="mt-4 text-sm font-semibold text-ink-500 dark:text-ink-200/70">{t('common.loading')}</p>
    </div>
  );
}

function ProgressBar() {
  const { t } = useTranslation();
  let progress = 0;
  useScrollProgress((p) => {
    progress = p;
    const el = document.getElementById('scroll-progress');
    if (el) el.style.transform = `scaleX(${p})`;
  });
  return (
    <div
      id="scroll-progress"
      className="scroll-progress fixed top-0 left-0 z-[60] h-[3px] w-full"
      style={{ transform: 'scaleX(0)' }}
      aria-hidden="true"
    />
  );
}

export default function App() {
  const { i18n } = useTranslation();
  useEffect(() => { document.documentElement.lang = i18n.language; }, [i18n.language]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <ProgressBar />
          <ErrorBoundary debug>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main id="main" className="grow">
                <Suspense fallback={<PageLoading />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/sigma" element={<Sigma />} />
                    <Route path="/roadmap" element={<Roadmap />} />
                    <Route path="/agenda" element={<AgendaList />} />
                    <Route path="/agenda/:slug" element={<AgendaDetail />} />
                    <Route path="/events" element={<EventsList />} />
                    <Route path="/events/:id" element={<EventDetail />} />
                    <Route path="/news" element={<NewsList />} />
                    <Route path="/news/:slug" element={<NewsDetail />} />
                    <Route path="/media" element={<Media />} />
                    <Route path="/volunteer" element={<VolunteerJoin />} />
                    <Route path="/volunteer/login" element={<VolunteerLogin />} />
                    <Route path="/login" element={<VolunteerLogin />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
