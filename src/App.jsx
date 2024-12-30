import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { App as SendbirdApp } from '@sendbird/uikit-react';
import '@sendbird/uikit-react/dist/index.css';
import SendBird from 'sendbird';
import { Button } from './components/ui/button';
import { FaSignalMessenger } from "react-icons/fa6";

const supabase = createClient(
  'https://gfyeqxvinopofqlzpiye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeWVxeHZpbm9wb2ZxbHpwaXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ3MjIsImV4cCI6MjA1MTA1MDcyMn0.zIfnHaOkUWw1_DMwSfwdzmUMmjjhMXM1Cs6XTRjbXt8'
);

const sb = new SendBird({ appId: '2AE3C9C0-397A-4B04-B19C-8EF9D2D0B05C' });

 const App = () => {
  
  const [session, setSession] = useState(null);
  const [sendbirdUserId, setSendbirdUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [isNicknameSet, setIsNicknameSet] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const userId = `sendbird_user_${session.user.id}`;
      setSendbirdUserId(userId);

      sb.connect(userId, (user, error) => {
        if (error) {
          console.error('Sendbird connection error:', error);
        } else {

          if (user.nickname) {
            setNickname(user.nickname);
            setIsNicknameSet(true);
          }

        }
      });
    }
  }, [session]);

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleNicknameSubmit = () => {
    if (!nickname) return; 

    sb.updateCurrentUserInfo(nickname, null, (response, error) => {
      if (error) {
        console.error('Error updating nickname:', error);
      } else {
        setIsNicknameSet(true);
        alert('Nickname Updated Successfully!');
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setSendbirdUserId('');
    setNickname('');
    setIsNicknameSet(false);
  };

  if (!session) {
    return <div className='absolute md:w-96 w-[100%] translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%] md:px-0 px-8'>
      <h2 className='text-4xl font-semibold text-center text-purple-500'>Groupify</h2>
      <Auth 
      supabaseClient={supabase} 
      appearance={{ theme: ThemeSupa, variables: {
        default: {
          colors: {
            brand: '#8e44ad',
            brandAccent: '#9b59b6',
          },
        },
      }, }}
      providers={['google', 'facebook', 'github']}
      />
    </div>
  }

  return (
    <div>
      <div className='flex items-center justify-between py-4 px-8'>
        <h1 className='text-2xl font-semibold uppercase flex items-center gap-1 text-purple-600'><FaSignalMessenger />Groupify</h1>
        <Button onClick={handleLogout} className='font-bold bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-100'>Log out</Button>
      </div>

      {!isNicknameSet && (
        <div className='flex items-center justify-center h-[70vh] flex-col gap-4'>
          <h3 className='text-3xl font-medium uppercase'>Set your Nickname:</h3>
          <input
          className='border border-primary p-3 rounded-lg placeholder-gray-500'
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="Enter your nickname"
            maxLength={80}
          />
          <Button className='font-semibold bg-purple-600 hover:bg-purple-700' onClick={handleNicknameSubmit}>Set Nickname</Button>
        </div>
      )}

      {isNicknameSet && sendbirdUserId && (
        <div style={{ height: '80vh', width: '100vw' }}>
          <SendbirdApp
            appId="2AE3C9C0-397A-4B04-B19C-8EF9D2D0B05C"
            userId={sendbirdUserId}
            accessToken="1d8b41cc1250b364de539d102ea2e6ad6ab16146"
          />
        </div>
      )}
    </div>
  );
}

export default App;