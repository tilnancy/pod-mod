import React from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';
import { FileAudio } from 'lucide-react';

const Auth: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-spotify-green rounded-full flex items-center justify-center">
            <FileAudio className="h-6 w-6 text-black" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome to PodModerator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to start moderating your podcasts
          </p>
        </div>
        
        <div className="mt-8 bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1DB954',
                    brandAccent: '#1ed760',
                    inputBackground: '#282828',
                    inputText: 'white',
                    inputPlaceholder: '#9CA3AF',
                    inputBorder: '#374151',
                    inputBorderHover: '#4B5563',
                    inputBorderFocus: '#1DB954',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
                label: 'auth-label',
              },
            }}
            theme="dark"
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;