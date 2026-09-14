import { useState, useEffect, useRef, useCallback } from 'react';
import { matchVoiceCommand, playVoiceAudioCue, VoiceCommandMatch } from '../utils/voiceNavigation';
import { triggerHaptic } from '../utils/haptics';
import { HaevyMode } from '../App';

interface UseVoiceCommanderProps {
  onNavigateMode: (mode: string, subTab?: string) => void;
  onToggleFullscreen?: () => void;
  onOpenNotifications?: () => void;
  onOpenShortcuts?: () => void;
  onOpenAuth?: () => void;
  onShowHUDFeedback?: (title: string, subtitle?: string) => void;
}

export function useVoiceCommander({
  onNavigateMode,
  onToggleFullscreen,
  onOpenNotifications,
  onOpenShortcuts,
  onOpenAuth,
  onShowHUDFeedback
}: UseVoiceCommanderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastMatchedCommand, setLastMatchedCommand] = useState<VoiceCommandMatch | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const debounceTimerRef = useRef<any>(null);
  const errorTimeoutRef = useRef<any>(null);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const setTimedErrorMessage = useCallback((msg: string) => {
    setErrorMessage(msg);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage(null);
    }, 6000);
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Clean up error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  // Check SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
    }
  }, []);

  const executeCommand = useCallback((match: VoiceCommandMatch, rawTranscript: string) => {
    playVoiceAudioCue('match');
    triggerHaptic('success');
    setLastMatchedCommand(match);

    if (onShowHUDFeedback) {
      onShowHUDFeedback(match.label, match.feedbackText);
    }

    if (match.type === 'navigate' && match.mode) {
      onNavigateMode(match.mode, match.subTab);
    } else if (match.type === 'action') {
      if (match.action === 'fullscreen' && onToggleFullscreen) {
        onToggleFullscreen();
      } else if (match.action === 'notifications' && onOpenNotifications) {
        onOpenNotifications();
      } else if (match.action === 'shortcuts' && onOpenShortcuts) {
        onOpenShortcuts();
      } else if (match.action === 'auth' && onOpenAuth) {
        onOpenAuth();
      } else if (match.action === 'stop_listening') {
        stopListening();
      }
    }

    // Clear matched state after 2.5 seconds
    setTimeout(() => {
      setLastMatchedCommand(prev => (prev === match ? null : prev));
      setTranscript('');
    }, 2500);
  }, [onNavigateMode, onToggleFullscreen, onOpenNotifications, onOpenShortcuts, onOpenAuth, onShowHUDFeedback]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }
    playVoiceAudioCue('stop');
    triggerHaptic('toggle');
  }, []);

  const startListening = useCallback(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
      setTimedErrorMessage('Trình duyệt chưa hỗ trợ Web Speech API. Hãy dùng Google Chrome hoặc Microsoft Edge.');
      triggerHaptic('error');
      return;
    }

    clearError();
    setTranscript('');
    setLastMatchedCommand(null);

    try {
      if (!recognitionRef.current) {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'vi-VN'; // Primary Vietnamese speech recognition

        recognition.onstart = () => {
          setIsListening(true);
          isListeningRef.current = true;
          playVoiceAudioCue('start');
          triggerHaptic('light');
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0].transcript;
            if (result.isFinal) {
              finalTranscript += text;
            } else {
              currentInterim += text;
            }
          }

          const activeText = (finalTranscript || currentInterim).trim();
          if (activeText) {
            setTranscript(activeText);

            // Check for matched voice command
            const match = matchVoiceCommand(activeText);
            if (match) {
              // Debounce slightly so user can finish phrase if needed
              if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = setTimeout(() => {
                executeCommand(match, activeText);
              }, 400);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setTimedErrorMessage('Vui lòng cấp quyền Micro trong trình duyệt để dùng giọng nói.');
            setIsListening(false);
            isListeningRef.current = false;
            playVoiceAudioCue('error');
          } else if (event.error === 'network') {
            setTimedErrorMessage('Lỗi mạng nhận diện giọng nói.');
          } else if (event.error === 'no-speech') {
            // Keep listening quietly
          }
        };

        recognition.onend = () => {
          // If still marked as listening by user, restart recognition automatically
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch {
              // Wait and restart if busy
              setTimeout(() => {
                if (isListeningRef.current) {
                  try {
                    recognition.start();
                  } catch {
                    setIsListening(false);
                    isListeningRef.current = false;
                  }
                }
              }, 500);
            }
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      }

      recognitionRef.current.start();
      setIsListening(true);
      isListeningRef.current = true;
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      // Already running or permission issue
      setIsListening(true);
      isListeningRef.current = true;
    }
  }, [executeCommand]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Execute artificial text command (for suggestion chips)
  const simulateCommand = useCallback((commandText: string) => {
    setTranscript(commandText);
    const match = matchVoiceCommand(commandText);
    if (match) {
      executeCommand(match, commandText);
    }
  }, [executeCommand]);

  // Cleanly dismiss HUD immediately and clear any error/matched states
  const dismissHUD = useCallback(() => {
    stopListening();
    clearError();
    setLastMatchedCommand(null);
    setTranscript('');
  }, [stopListening, clearError]);

  return {
    isListening,
    transcript,
    lastMatchedCommand,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    simulateCommand,
    clearError,
    dismissHUD
  };
}
