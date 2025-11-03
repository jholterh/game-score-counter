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

  const getVoiceForLanguage = (lang: string): string => {
    const voiceMap: Record<string, string> = {
      en: "en-US",
      es: "es-ES",
      de: "de-DE",
    };
    return voiceMap[lang] || "en-US";
  };

  const getVoiceSettings = (themeStr?: string) => {
    if (!themeStr) return { rate: 0.9, pitch: 1 };
    
    const themeLower = themeStr.toLowerCase();
    
    // Match voice characteristics to theme
    if (themeLower.includes("sarcastic") || themeLower.includes("sports commentator")) {
      return { rate: 1.1, pitch: 1.1 }; // Faster, higher pitch
    } else if (themeLower.includes("brutally honest") || themeLower.includes("trash talk")) {
      return { rate: 1.0, pitch: 0.9 }; // Normal speed, lower pitch
    } else if (themeLower.includes("dramatic") || themeLower.includes("shakespeare")) {
      return { rate: 0.85, pitch: 1.2 }; // Slower, theatrical
    } else if (themeLower.includes("passive aggressive")) {
      return { rate: 0.9, pitch: 1.0 }; // Slightly slower, normal pitch
    } else if (themeLower.includes("conspiracy")) {
      return { rate: 0.95, pitch: 0.85 }; // Mysterious, lower
    } else if (themeLower.includes("motivational")) {
      return { rate: 1.05, pitch: 1.15 }; // Energetic
    } else if (themeLower.includes("robot") || themeLower.includes("ai")) {
      return { rate: 0.95, pitch: 0.8 }; // Robotic
    } else if (themeLower.includes("nature documentary")) {
      return { rate: 0.85, pitch: 0.9 }; // Calm, soothing
    } else if (themeLower.includes("fortune teller") || themeLower.includes("mystic")) {
      return { rate: 0.8, pitch: 1.1 }; // Slow, mysterious
    } else if (themeLower.includes("dad jokes")) {
      return { rate: 1.0, pitch: 1.05 }; // Cheerful
    }
    
    return { rate: 0.9, pitch: 1 }; // Default
  };

  const handleSpeak = async () => {
    if (isPlaying) {
      // Stop current playback
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      if (onAudioRefChange) onAudioRefChange(null);
      return;
    }

    try {
      setIsLoading(true);
      
      // Use browser's built-in speech synthesis
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voiceLang = getVoiceForLanguage(language);
        
        // Wait for voices to be loaded
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          // If voices aren't loaded yet, wait for them
          await new Promise<void>((resolve) => {
            window.speechSynthesis.onvoiceschanged = () => resolve();
            // Timeout after 1 second
            setTimeout(resolve, 1000);
          });
        }
        
        // Find a voice that matches the language
        const availableVoices = window.speechSynthesis.getVoices();
        const matchingVoice = availableVoices.find(voice => 
          voice.lang.startsWith(voiceLang.split('-')[0])
        );
        
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
        
        const voiceSettings = getVoiceSettings(theme);
        utterance.lang = voiceLang;
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        
        utterance.onstart = () => {
          setIsPlaying(true);
          setIsLoading(false);
          if (onAudioRefChange) {
            onAudioRefChange({
              stop: () => {
                window.speechSynthesis.cancel();
                setIsPlaying(false);
              }
            });
          }
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
          if (onAudioRefChange) onAudioRefChange(null);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          setIsLoading(false);
          if (onAudioRefChange) onAudioRefChange(null);
          toast.error("Failed to play audio");
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        throw new Error("Speech synthesis not supported");
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error("Text-to-speech is not supported in your browser");
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