import { useState, useEffect, useRef } from "react"
import { MessageCircle, SendHorizonal, X } from "lucide-react"

interface Message {
  role: "user" | "bot"
  content: string
  timestamp?: string
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading])

  const getTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: getTime()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content:
                "You are CrypPT Bot, a friendly and expert assistant that only answers questions about cryptocurrency (like coins, market trends, and blockchain). If asked anything else, politely decline and guide the user back to crypto topics."
            },
            ...updatedMessages.map(({ role, content }) => ({
              role: role === "bot" ? "assistant" : "user",
              content
            }))
          ],
          temperature: 0.7
        })
      })

      let data
      try {
        data = await res.json()
      } catch (jsonErr) {
        throw new Error("Invalid JSON response from server.")
      }

      const botReply = data.choices?.[0]?.message?.content

      if (botReply) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: botReply, timestamp: getTime() }
        ])
      } else {
        throw new Error("Empty response")
      }
    } catch (err) {
      console.error("Chat error:", err)
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ Couldn't fetch a response. Please try again.",
          timestamp: getTime()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full p-3 shadow-lg bg-[#002200] border border-[#00ff00] hover:bg-[#003300]"
        >
          <MessageCircle className="text-[#00ff00]" />
        </button>
      )}

      {open && (
        <div className="w-[320px] bg-[#001a00] border border-[#00ff00] shadow-xl text-[#00ff00] font-mono rounded-lg">
          {/* Header */}
          <div className="flex justify-between items-center p-2 border-b border-[#00ff00]">
            <span className="text-sm">CrypPT Bot</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([])}
                className="text-xs underline hover:text-[#33ff33]"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-[#004400]"
                aria-label="Close chat"
              >
                <X size={18} className="text-[#00ff00]" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="p-2 h-48 overflow-y-auto space-y-2"
            role="log"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <p className="text-sm text-[#33ff33]">
                Ask about coins, market trends, or blockchain!
              </p>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm p-2 rounded whitespace-pre-wrap relative ${
                  msg.role === "user"
                    ? "bg-[#004400] text-right ml-auto max-w-[80%]"
                    : "bg-[#003300] text-left mr-auto max-w-[80%]"
                }`}
              >
                {msg.content}
                <span className="block text-xs text-[#66ff66] mt-1 opacity-60">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-sm p-2 bg-[#003300] text-left mr-auto max-w-[80%] rounded animate-pulse">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 flex gap-2 border-t border-[#00ff00]">
            <input
              className={`flex-1 p-1 bg-[#002200] border border-[#00ff00] text-[#00ff00] placeholder-[#33ff33] rounded ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask something..."
              disabled={loading}
              autoFocus
            />
            <button
              onClick={handleSend}
              className="p-1 rounded hover:bg-[#004400] disabled:opacity-50"
              aria-label="Send"
              disabled={loading}
            >
              <SendHorizonal size={16} className="text-[#00ff00]" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chatbot
