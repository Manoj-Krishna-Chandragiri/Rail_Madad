import { useState, useRef, useCallback } from 'react';

interface AudioTranscriptionProps {
  onTranscriptionComplete: (text: string) => void;
}

const AudioTranscription = ({ onTranscriptionComplete }: AudioTranscriptionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const detectSilence = useCallback((stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const checkAudioLevel = () => {
      if (!isRecording || !analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      // Reset silence timeout if sound is detected
      if (average > 5) {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
          }
        }, 1500); // Stop after 1.5 seconds of silence
      }

      requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  }, [isRecording]);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          await transcribeAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
          
          // Cleanup
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        detectSilence(stream);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Error accessing microphone. Please ensure microphone permissions are granted.');
      }
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await fetch('https://api.deepgram.com/v1/listen?model=general&language=en-US', {
        method: 'POST',
        headers: {
          'Authorization': 'Token 182927e9151ee1529063761d23186156bf13fcd5'
        },
        body: audioBlob
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Transcription response:', data); // Debug log

      if (data.results?.channels[0]?.alternatives[0]?.transcript) {
        const transcription = data.results.channels[0].alternatives[0].transcript;
        console.log('Transcribed text:', transcription); // Debug log
        onTranscriptionComplete(transcription);
      } else {
        console.error('No transcription in response:', data);
        alert('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Error transcribing audio. Please try again.');
    }
  };

  return { isRecording, toggleRecording };
};

export default AudioTranscription;
