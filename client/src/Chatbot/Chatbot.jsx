import { useState, useEffect } from "react";
import axios from "axios";
import "./ChatBot.css";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi there! Ask me about our products 😊" }
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/chat/history", { withCredentials: true })
      .then((res) => {
        const history = res.data.map((item) => [
          { sender: "user", text: item.message },
          { sender: "bot", text: item.response }
        ]).flat();
        setMessages([
          { sender: "bot", text: "Hi there! Ask me about our products 😊" },
          ...history
        ]);
      })
      .catch((err) => {
        console.error("Failed to load chat history", err);
        setMessages([
          { sender: "bot", text: "Hi there! Ask me about our products 😊" },
          { sender: "bot", text: "⚠️ Please login to use the chatbot." }
        ]);
      });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    try {
      const res = await axios.post(
        "http://localhost:5000/chat",
        { message: input },
        { withCredentials: true }
      );

      const reply = res.data.reply || "Sorry, I didn't understand that.";
      setMessages([...newMessages, { sender: "bot", text: reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Oops! Something went wrong." }
      ]);
      console.error(err);
    }

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const resetChat = async () => {
    try {
      await axios.post(
        "http://localhost:5000/chat/reset",
        {},
        { withCredentials: true }
      );
      setMessages([
        { sender: "bot", text: "Chat history reset. How can I help you now? 😊" }
      ]);
    } catch (err) {
      console.error("Failed to reset chat", err);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbox">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.sender === "user" ? "user" : "bot"}`}
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage}>Send</button>
          <button className="reset-button" onClick={resetChat}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
