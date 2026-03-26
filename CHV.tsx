import React, { useState, useRef } from 'react';
import { Camera, Upload, Send, Loader2, AlertCircle, Mic, MicOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { Diagnosis } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface CHVFormProps {
  onAnalysisComplete: (diagnosis: Diagnosis) => void;
}

export const CHVForm: React.FC<CHVFormProps> = ({ onAnalysisComplete }) => {
  const [symptoms, setSymptoms] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    setSpeechError(null);

    // Try to "prime" microphone permission if not already granted
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Microphone access denied:", err);
      setSpeechError("Microphone access denied. Please check your browser permissions.");
      toast.error("Microphone access denied", {
        description: "Please allow microphone access in your browser settings to use voice input."
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser.");
      toast.error("Not Supported", {
        description: "Your browser does not support speech recognition. Try using Chrome."
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
      toast.info("Listening...", { id: 'speech-toast' });
    };

    recognition.onend = () => {
      setIsListening(false);
      toast.dismiss('speech-toast');
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      toast.dismiss('speech-toast');
      
      if (event.error === 'not-allowed') {
        setSpeechError("Permission denied. Please click the lock icon in your browser address bar and allow the microphone.");
        toast.error("Permission Denied", {
          description: "Speech recognition was blocked. Please allow microphone access for this site."
        });
      } else {
        setSpeechError(`Speech recognition error: ${event.error}`);
        toast.error("Speech Recognition Error", {
          description: `An error occurred: ${event.error}`
        });
      }
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setSymptoms(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsListening(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    try {
      // Using the provided API key for the presentation
      const apiKey = "AIzaSyDYSUAvaFGJxeVE4_G5h5znOurdSjX2ZZc";
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = "You are a medical AI assistant for rural CHVs. Analyze these symptoms and this image. Return a JSON with: 1. Suspected Illness, 2. Confidence Percentage, 3. Recommended Action.";

      const parts: any[] = [{ text: `Symptoms: ${symptoms}` }];
      if (image) {
        parts.push({
          inlineData: {
            data: image.split(',')[1],
            mimeType: "image/jpeg"
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suspectedIllness: { type: Type.STRING },
              confidencePercentage: { type: Type.NUMBER },
              recommendedAction: { type: Type.STRING },
              malnutritionRisk: { type: Type.STRING, enum: ["High", "Low"] }
            },
            required: ["suspectedIllness", "confidencePercentage", "recommendedAction", "malnutritionRisk"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      const newDiagnosis: Diagnosis = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        symptoms,
        suspectedIllness: result.suspectedIllness || 'Unknown',
        malnutritionRisk: result.malnutritionRisk || 'Low',
        confidencePercentage: result.confidencePercentage || 0,
        recommendedAction: result.recommendedAction || 'Refer to nearest clinic',
        district: 'Turkana West' // Hardcoded for demo
      };

      onAnalysisComplete(newDiagnosis);
      setSymptoms('');
      setImage(null);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error("Analysis failed. Please check your connection and API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Patient Assessment</h2>
        <p className="text-slate-500 text-sm">Enter symptoms and upload a photo for malnutrition screening.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">Symptoms</label>
            <button
              onClick={toggleListening}
              className={cn(
                "p-2 rounded-full transition-all",
                isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                speechError && "ring-2 ring-red-500"
              )}
              title={isListening ? "Stop Listening" : "Start Voice Input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <AnimatePresence>
            {speechError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{speechError}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. High fever, cough, fatigue for 3 days..."
            className="w-full h-32 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none bg-white shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Physical Assessment (Optional)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative h-48 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all overflow-hidden",
              image && "border-none"
            )}
          >
            {image ? (
              <>
                <img src={image} alt="Patient" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium">Change Photo</p>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-2">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-sm text-slate-600 font-medium">Tap to take or upload photo</p>
                <p className="text-xs text-slate-400">Used for malnutrition visual check</p>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !symptoms.trim()}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2",
            isAnalyzing || !symptoms.trim() 
              ? "bg-slate-300 cursor-not-allowed" 
              : "bg-brand-600 hover:bg-brand-700 active:scale-[0.98]"
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing with Gemini...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Run Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
};
