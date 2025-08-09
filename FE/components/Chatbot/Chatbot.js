import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/Auth";

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // lưu tất cả hội thoại
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { token } = useAuth();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Gửi embedding trước (nếu cần)
      await axios.post("http://192.168.100.9:3000/api/embed", { text: input }, config);

      // Gửi prompt
      const res = await axios.post("http://192.168.100.9:3000/api/chat", { prompt: input }, config);

      const botMessage = {
        sender: "bot",
        text: res.data.response || "Không có phản hồi từ chatbot.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi gọi API:", error.message);
      setMessages((prev) => [...prev, { sender: "bot", text: "Đã xảy ra lỗi." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      {/* Header có icon lịch sử */}
      <View style={styles.header}>
        <Text style={styles.title}>Chat với AI</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Lịch Sử Chatbot")}>
          <Ionicons name="time-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Khung tin nhắn */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.bubble,
              msg.sender === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text style={styles.bubbleText}>{msg.text}</Text>
          </View>
        ))}

        {loading && (
          <View style={styles.botBubble}>
            <ActivityIndicator size="small" color="#555" />
          </View>
        )}
      </ScrollView>

      {/* Nhập liệu */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập câu hỏi..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatBot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 40,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  chatContainer: {
    flex: 1,
  },
  bubble: {
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 8,
    borderRadius: 16,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start",
  },
  bubbleText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 10,
  },
});
