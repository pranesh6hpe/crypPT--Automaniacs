// src/components/Chatbot.tsx

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { MessageCircle, SendHorizonal, X } from "lucide-react"

interface Message {
  role: "user" | "bot"
  content: string
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    const newMessage: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, newMessage])
    setInput("")

    // Fake bot response for now
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: newMessage.content },
        { role: "bot", content: "I'm a crypto assistant! Try asking about coins or trends 🧠" }
      ])
    }, 1000)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!open ? (
          <Button
            className="rounded-full p-3 shadow-lg bg-[#002200] border border-[#00ff00] hover:bg-[#003300]"
            onClick={() => setOpen(true)}
          >
            <MessageCircle className="text-[#00ff00]" />
          </Button>
        ) : (
          <Card className="w-[320px] sm:w-[360px] bg-[#001a00] border border-[#00ff00] shadow-xl text-[#00ff00] font-mono">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">CrypPT Bot</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-[#002200] text-[#00ff00]"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </Button>
            </CardHeader>

            <CardContent className="p-2 pt-0">
              <ScrollArea className="h-52 pr-2 space-y-2">
                {messages.length === 0 && (
                  <p className="text-sm text-[#33ff33]">Ask me about a coin or trend!</p>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`text-sm rounded-lg p-2 ${
                      msg.role === "user"
                        ? "bg-[#004400] text-right ml-auto max-w-[80%]"
                        : "bg-[#003300] text-left mr-auto max-w-[80%]"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>

            <CardFooter className="pt-2 flex items-center gap-2">
              <Input
                className="flex-1 bg-[#002200] border-[#00ff00] text-[#00ff00] placeholder:text-[#33ff33]"
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend()
                }}
              />
              <Button
                variant="outline"
                className="border-[#00ff00] hover:bg-[#004400] text-[#00ff00]"
                onClick={handleSend}
              >
                <SendHorizonal size={16} />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  )
}

export default Chatbot
