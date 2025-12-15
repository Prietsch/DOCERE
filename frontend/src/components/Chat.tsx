import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real application, you would fetch messages from the server
    // and set up a WebSocket connection for real-time updates
    const dummyMessages: Message[] = [
      {
        id: 1,
        sender: "John",
        content: "Hello everyone!",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: 2,
        sender: "Jane",
        content: "Hi John, how are you?",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
      },
    ];
    setMessages(dummyMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      const message: Message = {
        id: Date.now(),
        sender: user.nome,
        content: newMessage.trim(),
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage("");
      // In a real application, you would send the message to the server here
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {!isOpen && (
        <Button
          variant="contained"
          color="primary"
          onClick={toggleChat}
          style={{ position: "fixed", bottom: 16, right: 16 }}
        >
          Open Chat
        </Button>
      )}
      {isOpen && (
        <Paper
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            width: 300,
            height: 400,
            margin: 16,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottom: "1px solid #ccc",
            }}
          >
            <Typography variant="h6">Chat</Typography>
            <IconButton onClick={toggleChat} size="small">
              <CloseIcon />
            </IconButton>
          </div>
          <List style={{ flexGrow: 1, overflowY: "auto", padding: 16 }}>
            {messages.map((message) => (
              <ListItem key={message.id}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      {message.sender}{" "}
                      <span style={{ fontSize: "0.8em", color: "#666" }}>
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </Typography>
                  }
                  secondary={message.content}
                />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
          <div
            style={{
              display: "flex",
              padding: 16,
              borderTop: "1px solid #ccc",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              style={{ marginLeft: 8 }}
            >
              Send
            </Button>
          </div>
        </Paper>
      )}
    </>
  );
};

export default Chat;
