"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Plus, Bot, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { saveSymptomLog } from "@/lib/symptom-storage"
import type { SymptomLog } from "@/types/symptom"
import ReactMarkdown from "react-markdown"

export default function ChatBot() {
  const router = useRouter()
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hi there! I'm your health assistant powered by Gemini 2.0 Flash. I can help you analyze your symptoms and log them. How are you feeling today?",
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    setIsLoading(true)

    try {
      // Call the AI endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add AI response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])

      // Check if the AI detected a symptom to log
      if (data.symptomToLog) {
        const { symptom, severity, notes } = data.symptomToLog

        // Create a new symptom log
        const newLog: SymptomLog = {
          id: Date.now().toString(),
          symptom,
          severity,
          notes,
          timestamp: new Date().toISOString(),
        }

        // Save the symptom log
        saveSymptomLog(newLog)

        toast({
          title: "Symptom logged",
          description: `${symptom} has been added to your health records`,
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogSymptom = () => {
    router.push("/log")
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>
        <Button onClick={handleLogSymptom} variant="outline" className="border-teal-200 text-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          Log Symptom Manually
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-teal-700 mb-4">
        Health Assistant{" "}
        <span className="text-sm font-normal bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
          Gemini 2.0 Flash
        </span>
      </h1>

      <Card className="flex-grow overflow-hidden flex flex-col">
        <CardContent className="p-4 flex-grow overflow-y-auto flex flex-col">
          <div className="flex-grow space-y-4 pb-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`
                    max-w-[80%] rounded-lg p-3 
                    ${
                      message.role === "assistant"
                        ? "bg-purple-50 border border-purple-100 text-slate-700"
                        : "bg-blue-500 text-white"
                    }
                  `}
                >
                  <div className="flex items-center mb-1">
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 mr-2" />
                    ) : (
                      <User className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-xs font-medium">
                      {message.role === "assistant" ? "Gemini Health Assistant" : "You"}
                    </span>
                  </div>
                  <div className="text-sm markdown-content">
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold my-2" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-md font-bold my-2" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-bold my-1" {...props} />,
                          p: ({ node, ...props }) => <p className="my-1" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                          li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
                          a: ({ node, ...props }) => <a className="text-purple-600 underline" {...props} />,
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-2 border-purple-300 pl-2 italic my-2" {...props} />
                          ),
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code className="bg-purple-100 px-1 rounded" {...props} />
                            ) : (
                              <code className="block bg-purple-100 p-2 rounded my-2 overflow-x-auto" {...props} />
                            ),
                          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                          em: ({ node, ...props }) => <em className="italic" {...props} />,
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-2">
                              <table className="min-w-full border-collapse" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => <thead className="bg-purple-100" {...props} />,
                          tbody: ({ node, ...props }) => <tbody {...props} />,
                          tr: ({ node, ...props }) => <tr className="border-b border-purple-200" {...props} />,
                          th: ({ node, ...props }) => <th className="p-2 text-left font-medium" {...props} />,
                          td: ({ node, ...props }) => <td className="p-2" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-purple-50 border border-purple-100">
                  <div className="flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    <span className="text-xs font-medium">Gemini Health Assistant</span>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <div
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <div className="p-4 border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms or ask for health advice..."
              className="flex-grow border-purple-200 focus-visible:ring-purple-500"
              disabled={isLoading}
            />
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

