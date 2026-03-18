"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, Mic, Minimize2, Maximize2, Send, Loader2, Trash2, SpeakerIcon, Speaker } from "lucide-react";
import { Button } from "@component/components/ui/button";
import { Input } from "@component/components/ui/input";
import { ScrollArea } from "@component/components/ui/scroll-area";
import { cn } from "@component/lib/utils";
import { AutoTranslate } from "./AutoTranslate";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Message {
  role: "user" | "ai";
  content: string;
}

function formatJobParagraph(paragraph: string) {
  const lines = paragraph.split('\n').map(line => line.trim()).filter(Boolean);

  const output: string[] = [];
  let introComplete = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('http')) {
      let last: string | undefined = output.pop();
      output.push(`${last}<a href="${line}" class="text-blue-600 font-medium text-sm" target="_blank">${line}</a><br/>`);
    } else if (!introComplete && line.match(/job titles|roles|based on/i)) {
      output.push(`<p class="font-semibold ">${line}</p>`);
      introComplete = true;
    } else if (!line.startsWith('http')) {
      output.push(`<strong>${line}</strong><br/>`);
    }
  }

  return output.join('\n');
}


export default function AIAssistant() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("hi-IN");
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState<number | null>(null);

  const languageMap: Record<string, string> = {
    en: "en-IN",
    hi: "hi-IN",
    mr: "mr-IN",
    gu: "gu-IN"
  };


  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const API_URL = "http://localhost:8000";

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Handle voice input
  const handleVoice = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };



  const speakText = (text: string, messageIndex: number) => {
    window.speechSynthesis.cancel();

    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech not supported");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // 🔥 Dynamic Language
    utterance.lang = currentLanguage;

    // Pick best voice
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang === currentLanguage);
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingIndex(messageIndex);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };


  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentSpeakingIndex(null);
  };

  // Send message
  const handleSend = async () => {
    const currentQuery = query.trim();
    if (!currentQuery) return;

    const userMessage: Message = { role: "user", content: currentQuery };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentQuery,
          session_id: sessionId ?? null,
          model: "sike_aditya/AgriLlama",
        })
      });


      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      if (data.session_id && !sessionId) setSessionId(data.session_id);

      const aiMessage: Message = {
        role: "ai",
        content: data.message || "Oops! Something went wrong..."
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: Message = {
        role: "ai",
        content: "Failed to connect to AI server. Make sure backend is running."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear chat
  const handleClearChat = () => {
    if (messages.length > 0 && confirm("Clear all messages?")) {
      setMessages([]);
    }
  };


  const quickQuestions = [
    "Which crop is best to grow this season in my area?",
    "What is today’s market price for my crops?",
    "How can I sell my crops directly to buyers?"
  ];


  return (
    <AutoTranslate>
      <div className={cn(
        isExpanded ? "md:w-[700px] h-[600px]" : "md:w-96 h-96",
        "w-80 fixed bottom-5 right-5 z-40 shadow-2xl rounded-2xl bg-white border flex flex-col transition-all duration-300"
      )}>
        {/* Header */}
        <div className="bg-[#038b7e] px-4 py-2 rounded-t-2xl flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold text-sm">AgriLink Assis</h3>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button size="icon" variant="ghost" className="text-white" onClick={handleClearChat}>
                <Trash2 size={16} />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="text-white" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 bg-gray-50 h-50">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center text-gray-500">
                <Bot size={36} className="text-[#04a091] mb-2 animate-pulse" />
                <p className="text-sm font-medium">Start a conversation with AgriBot</p>
                <p className="text-xs mt-1">Ask about crops, farming, prices, or transport.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(q)}
                      className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 hover:bg-green-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm",
                  msg.role === "user" ? "bg-[#04a091] text-white rounded-tr-sm" : "bg-white rounded-tl-sm"
                )}>
                  <AutoTranslate>


                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        // Style tables
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4">
                            <table
                              className="min-w-full divide-y divide-gray-200 border border-gray-300"
                              {...props}
                            />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-gray-50" {...props} />
                        ),
                        tbody: ({ node, ...props }) => (
                          <tbody className="bg-white divide-y divide-gray-200" {...props} />
                        ),
                        tr: ({ node, ...props }) => (
                          <tr className="hover:bg-gray-50" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-gray-300"
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200"
                            {...props}
                          />
                        ),
                        // Style other elements
                        h1: ({ node, ...props }) => (
                          <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-xl font-bold mb-3 mt-5" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-lg font-bold mb-2 mt-4" {...props} />
                        ),
                        p: ({ node, ...props }) => <p className="mb-3" {...props} />,
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
                        ),
                        li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                        code: ({ node, inline, ...props }: any) =>
                          inline ? (
                            <code
                              className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600"
                              {...props}
                            />
                          ) : (
                            <code
                              className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3 font-mono text-sm"
                              {...props}
                            />
                          ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-blue-500 pl-4 italic my-3 text-gray-700"
                            {...props}
                          />
                        ),
                        strong: ({node, ...props }) => (
                        <strong className="font-bold text-gray-900" {...props} />
                        ),
                        em: ({node, ...props }) => (
                        <em className="italic text-gray-700" {...props} />
                        ),
      }}
    >
                    {msg.content}
                  </ReactMarkdown>



                </AutoTranslate>
                <span>
                  {msg.role === "ai" && (
                    isSpeaking && currentSpeakingIndex === idx ? (
                      <Button size="icon" variant="ghost" className="ml-2 text-gray-500" onClick={stopSpeaking}>
                        <Loader2 size={12} className="animate-spin" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" className="ml-2 text-gray-500" onClick={() => speakText(msg.content, idx)}>
                        <Speaker size={12} />
                      </Button>
                    )
                  )}
                </span>
              </div>
              </div>
            ))}

          {isTyping && (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="bg-green-100 p-1.5 rounded-full">
                <Bot size={16} className="text-[#04a091]" />
              </div>
              <div className="rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#04a091] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#04a091] rounded-full animate-bounce delay-150" />
                  <div className="w-2 h-2 bg-[#04a091] rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
      </div>
    </ScrollArea>

        {/* Input */ }
  <div className="flex items-center bg-gray-50 gap-2 p-3 rounded-b-2xl">
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Ask about your crops..."
      className="flex-1"
    />
    <Button size="icon" onClick={handleVoice} variant={isListening ? "destructive" : "secondary"}>
      <Mic size={18} />
    </Button>
    <Button size="icon" onClick={handleSend} disabled={isTyping}>
      <Send size={18} />
    </Button>
  </div>
      </div >
    </AutoTranslate >
  );
}
