import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      console.log("AuthCallback: Processing OAuth callback...");

      // Extract tokens from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (error) {
        console.error("AuthCallback: OAuth error:", error, errorDescription);
        navigate("/", { replace: true });
        return;
      }

      console.log("AuthCallback: Tokens found:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });

      if (accessToken && refreshToken) {
        try {
          // Manually set the session with extracted tokens
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            console.error("AuthCallback: Error setting session:", setSessionError);
            navigate("/", { replace: true });
            return;
          }

          if (data.session) {
            console.log("AuthCallback: ✅ Session established successfully!");
            console.log("AuthCallback: User:", data.session.user.email);
            setIsProcessing(false);
            // Redirect to home
            setTimeout(() => navigate("/", { replace: true }), 500);
          } else {
            console.log("AuthCallback: ❌ No session after setSession");
            navigate("/", { replace: true });
          }
        } catch (err) {
          console.error("AuthCallback: Unexpected error:", err);
          navigate("/", { replace: true });
        }
      } else {
        console.log("AuthCallback: ❌ No tokens in URL");
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-game-purple via-game-pink to-game-blue">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
