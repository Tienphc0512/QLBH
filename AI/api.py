from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, AutoModel
import torch
# thư viện transformers sẽ cài sẵn huggingface_hub như một dependency.
app = Flask(__name__)

# Load LLM nhỏ (chatbot thông minh)
chat_tokenizer = AutoTokenizer.from_pretrained("EleutherAI/gpt-neo-125M")
chat_tokenizer.pad_token = chat_tokenizer.eos_token
chat_model = AutoModelForCausalLM.from_pretrained("EleutherAI/gpt-neo-125M")
chat_model.eval()
# LLM nhỏ này là GPT-Neo 125M, một mô hình ngôn ngữ mã nguồn mở được phát triển bởi EleutherAI.


# Load embedding model
embedding_tokenizer = AutoTokenizer.from_pretrained("thenlper/gte-small") #từ nền tảng Hugging Face Hub
embedding_model = AutoModel.from_pretrained("thenlper/gte-small") #(để biểu diễn văn bản thành vector) của nhóm nghiên cứu The NLPers (Viện AI KAIST Hàn Quốc).

# Generate embedding
def get_embedding(text):
    inputs = embedding_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        model_output = embedding_model(**inputs)
    embeddings = model_output.last_hidden_state.mean(dim=1)
    return embeddings[0].tolist()

# Chatbot trả lời thông minh
def generate_response(prompt):
    inputs = chat_tokenizer(prompt, return_tensors="pt")
    outputs = chat_model.generate(**inputs, max_length=100, pad_token_id=chat_tokenizer.eos_token_id)
    return chat_tokenizer.decode(outputs[0], skip_special_tokens=True)


@app.route("/embed", methods=["POST"])
def embed():
    text = request.json.get("text", "")
    return jsonify({"embedding": get_embedding(text)})

@app.route("/chat", methods=["POST"])
def chat():
    prompt = request.json.get("prompt", "")
    response = generate_response(prompt)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True, port=5000)