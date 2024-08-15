import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOAuthCallback } from '../utils/OAuthCallback';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleOAuthCallback(code)
        .then(() => {
          // Redirect to the main application after successful authentication
          navigate('/scheduler');
        })
        .catch((error) => {
          console.error('Error in OAuth callback:', error);
          // Handle the error (e.g., show an error message to the user)
        });
    }
  }, [navigate]);

  return <div>Processing OAuth callback...</div>;
};

export default OAuthCallback;