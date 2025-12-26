import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TextToSpeechProps {
  text: string;
  language: string;
  theme?: string;
  onAudioRefChange?: (ref: { stop: () => void } | null) => void;
}

export const TextToSpeech = ({ text, language, theme, onAudioRefChange }: TextToSpeechProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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
      setIsLoading(true);

      // Get the appropriate voice for the theme
      const voice = getVoiceForTheme(theme);

      // Get Supabase credentials from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      // Call Supabase edge function to get audio from OpenAI
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
        const errorText = await response.text();
        console.error('TTS error:', errorText);
        throw new Error('Failed to generate speech');
      }

      // Get the audio blob from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);

      audioElement.onloadeddata = () => {
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