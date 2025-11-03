import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TextToSpeechProps {
  text: string;
  language: string;
}

export const TextToSpeech = ({ text, language }: TextToSpeechProps) => {
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

  const handleSpeak = async () => {
    if (isPlaying && audio) {
      // Stop current playback
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setAudio(null);
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
        
        utterance.lang = voiceLang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onstart = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          setIsLoading(false);
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