"use client"

import React, { useState, useEffect, useRef } from "react"
import { Bot, Mic, Send } from "lucide-react"
import { Button } from "@component/components/ui/button"
import { Input } from "@component/components/ui/input"
import { ScrollArea } from "@component/components/ui/scroll-area"
import { cn } from "@component/lib/utils"

export default function AIAssistant() {
    const [query, setQuery] = useState('')
    const [isListening, setIsListening] = useState(false)
    const [messages, setMessages] = useState<any[]>([])
    const recognitionRef = useRef<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.lang = "en-IN"
            recognition.continuous = false
            recognition.interimResults = false

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setQuery(transcript)
                setIsListening(false)
            }

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error)
                setIsListening(false)
            }

            recognitionRef.current = recognition
        }
    }, [])

    const handleSend = async () => {
        const currentQuery = query.trim()
        if (!currentQuery) return

        const newMessages = [...messages, { role: 'user', content: currentQuery }]
        setMessages(newMessages)
        setQuery('')

        try {
            const res = await fetch('/api/LLM', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentQuery }),
            })
            const data = await res.json()

            const updatedMessages = [
                ...newMessages,
                { role: 'ai', content: data.response || 'Something went wrong...' },
            ]
            setMessages(updatedMessages)
        } catch (err) {
            const errorMessage = [
                ...newMessages,
                { role: 'ai', content: 'Failed to connect to AI server.' },
            ]
            setMessages(errorMessage)
        }
    }

    const handleVoice = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported in this browser.")
            return
        }
        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            recognitionRef.current.start()
            setIsListening(true)
        }
    }

    return (
        <div className="fixed bottom-5 right-5 z-20 w-80 h-96 shadow-2xl rounded-2xl bg-background border border-border flex flex-col">
            <div className="bg-green-100 px-4 py-2 rounded-t-2xl">
                Try AgriLink Assistant
            </div>

            <ScrollArea className="flex-1 p-3 h-70">
                <div className="space-y-2">
                    {messages.length === 0 ? (
                        <div className="flex h-50 flex-col gap-2 justify-center items-center">
                            <div><Bot size={30} /></div>
                            <span className="text-muted-foreground text-sm">Start a conversation with AgriBot</span>
                            <p className="text-muted-foreground text-center text-sm">Ask about your crops. Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                            >
                                <div
                                    className={cn(
                                        "px-3 py-2 rounded-xl max-w-[75%] text-sm",
                                        msg.role === "user"
                                            ? "bg-green-500 text-white"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <div className="flex items-center gap-2 border-t p-3">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about your crops..."
                    className="flex-1"
                />
                <Button
                    size="icon"
                    onClick={handleVoice}
                    variant={isListening ? "destructive" : "secondary"}
                >
                    <Mic size={18} />
                </Button>
                <Button size="icon" onClick={handleSend}>
                    <Send size={18} />
                </Button>
            </div>
        </div>
    )
}
