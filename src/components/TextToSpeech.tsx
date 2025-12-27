import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TextToSpeechProps {
  text: string;
  language: string;
  theme?: string;
  onAudioRefChange?: (ref: { stop: () => void } | null) => void;
  autoPreload?: boolean; // New prop to preload audio automatically
}

export const TextToSpeech = ({ text, language, theme, onAudioRefChange, autoPreload = false }: TextToSpeechProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [preloadedAudioUrl, setPreloadedAudioUrl] = useState<string | null>(null);

  // Map themes to OpenAI voices for best character match
  const getVoiceForTheme = (themeStr?: string): string => {
    if (!themeStr) return "alloy";

    const themeLower = themeStr.toLowerCase();

    // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
    if (themeLower.includes("sarcastic") || themeLower.includes("sports commentator")) {
      return "echo"; // Energetic, confident
    } else if (themeLower.includes("brutally honest") || themeLower.includes("trash talk")) {
      return "onyx"; // Deep, authoritative
    } else if (themeLower.includes("dramatic") || themeLower.includes("shakespeare")) {
      return "fable"; // Expressive, theatrical
    } else if (themeLower.includes("passive aggressive")) {
      return "nova"; // Warm but with edge
    } else if (themeLower.includes("conspiracy")) {
      return "onyx"; // Mysterious, serious
    } else if (themeLower.includes("motivational")) {
      return "echo"; // Energetic, uplifting
    } else if (themeLower.includes("robot") || themeLower.includes("ai")) {
      return "alloy"; // Neutral, balanced
    } else if (themeLower.includes("nature documentary")) {
      return "shimmer"; // Calm, soothing
    } else if (themeLower.includes("fortune teller") || themeLower.includes("mystic")) {
      return "shimmer"; // Mysterious, gentle
    } else if (themeLower.includes("dad jokes")) {
      return "echo"; // Cheerful, friendly
    }

    return "alloy"; // Default balanced voice
  };

  // Function to generate and cache audio
  const generateAudio = async (): Promise<string | null> => {
    try {
      const voice = getVoiceForTheme(theme);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ text, voice }),
        }
      );

      if (!response.ok) {
        console.error('TTS preload error');
        return null;
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Failed to preload audio:', error);
      return null;
    }
  };

  // Preload audio when component mounts if autoPreload is true
  useEffect(() => {
    if (autoPreload && text && !preloadedAudioUrl) {
      setIsLoading(true);
      toast.info("Preparing audio...", { duration: 2000 });
      generateAudio().then((url) => {
        setPreloadedAudioUrl(url);
        setIsLoading(false);
      });
    }

    // Cleanup: revoke object URL when component unmounts
    return () => {
      if (preloadedAudioUrl) {
        URL.revokeObjectURL(preloadedAudioUrl);
      }
    };
  }, [autoPreload, text, theme]);

  const handleSpeak = async () => {
    if (isPlaying && audio) {
      // Stop current playback
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setAudio(null);
      if (onAudioRefChange) onAudioRefChange(null);
      return;
    }

    try {
      let audioUrl: string | null = preloadedAudioUrl;

      // If no preloaded audio, generate it now
      if (!audioUrl) {
        setIsLoading(true);
        toast.info("Generating speech...", { duration: 2000 });
        audioUrl = await generateAudio();

        if (!audioUrl) {
          throw new Error('Failed to generate speech');
        }
      }

      const audioElement = new Audio(audioUrl);

      // Use canplay instead of onloadeddata to start playing sooner
      audioElement.oncanplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setAudio(audioElement);

        if (onAudioRefChange) {
          onAudioRefChange({
            stop: () => {
              audioElement.pause();
              audioElement.currentTime = 0;
              setIsPlaying(false);
              setAudio(null);
            }
          });
        }

        audioElement.play();
      };

      audioElement.onended = () => {
        setIsPlaying(false);
        setAudio(null);
        URL.revokeObjectURL(audioUrl);
        if (onAudioRefChange) onAudioRefChange(null);
      };

      audioElement.onerror = (event) => {
        console.error('Audio playback error:', event);
        setIsPlaying(false);
        setIsLoading(false);
        setAudio(null);
        URL.revokeObjectURL(audioUrl);
        if (onAudioRefChange) onAudioRefChange(null);
        toast.error("Failed to play audio");
      };

    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error("Failed to generate speech. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleSpeak}
      disabled={isLoading}
      className="ml-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
};