import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse(""); // reset phản hồi

    try {
      // 1. Gọi API /api/embed
      await axios.post("http://localhost:5000/embed", { text: input });

      // 2. Gọi tiếp API /api/chat
      const res = await axios.post("http://localhost:5000/chat", {
        prompt: input,
      });

      setResponse(res.data.reply || "Không có phản hồi từ chatbot.");
    } catch (error) {
      console.error("Lỗi gọi API:", error.message);
      setResponse("Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
              {/* Icon lịch sử ở góc phải */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.navigate("Lịch Sử Chatbot")}>
          <Ionicons name="time-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Chat với AI</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập câu hỏi..."
          value={input}
          onChangeText={setInput}
          multiline
        />

        <Button title={loading ? "Đang gửi..." : "Gửi"} onPress={handleSend} disabled={loading} />

        <Text style={styles.responseTitle}>Phản hồi:</Text>
        <Text style={styles.responseText}>{response}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChatBot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    textAlignVertical: "top",
  },
  responseTitle: {
    fontWeight: "bold",
    marginTop: 20,
  },
  responseText: {
    marginTop: 8,
    fontSize: 16,
    color: "#333",
  },
});
