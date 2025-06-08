// components/Chatbot.tsx
import { Widget } from "react-chat-widget"
import "react-chat-widget/lib/styles.css"

function Chatbot() {
  return (
    <Widget
      title="CrypPT Assistant"
      subtitle="Ask about prices, trends, or anything crypto!"
      handleNewUserMessage={(message: any) => {
        console.log("User:", message)
        setTimeout(() => {
          alert("🤖 Bot: I'm still learning to respond. Custom replies coming soon!")
        }, 400)
      }}
    />
  )
}

export default Chatbot
