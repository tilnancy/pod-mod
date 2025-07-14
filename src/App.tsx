import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import AudioPlayer from './components/AudioPlayer';
import ProcessingIndicator from './components/ProcessingIndicator';
import Auth from './components/Auth';
import { supabase } from './lib/supabaseClient';

const AppContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSectionChange={setActiveSection} activeSection={activeSection} />
        <MainContent activeSection={activeSection} />
      </div>
      <AudioPlayer />
      <ProcessingIndicator />
    </div>
  );
};

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <AudioProvider>
        {!session ? <Auth /> : <AppContent />}
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;