# # from flask import Flask, request, jsonify
# # from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, AutoModel
# # import torch
# # # thư viện transformers sẽ cài sẵn huggingface_hub như một dependency.
# # app = Flask(__name__)

# # # Load LLM nhỏ (chatbot thông minh)
# # chat_tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
# # chat_model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
# # chat_model.eval()
 


# # # Load embedding model
# # embedding_tokenizer = AutoTokenizer.from_pretrained("thenlper/gte-small") #từ nền tảng Hugging Face Hub
# # embedding_model = AutoModel.from_pretrained("thenlper/gte-small") #(để biểu diễn văn bản thành vector) của nhóm nghiên cứu The NLPers (Viện AI KAIST Hàn Quốc).

# # # Generate embedding
# # def get_embedding(text):
# #     inputs = embedding_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
# #     with torch.no_grad():
# #         model_output = embedding_model(**inputs)
# #     embeddings = model_output.last_hidden_state.mean(dim=1)
# #     return embeddings[0].tolist()

# # # Chatbot trả lời thông minh
# # def generate_response(prompt):
# #     # prompt template giúp model hiểu cần phản hồi như một assistant
# #     full_prompt = f"User: {prompt}\nAssistant:"
# #     inputs = chat_tokenizer(full_prompt, return_tensors="pt")
# #     outputs = chat_model.generate(**inputs, max_length=100, pad_token_id=chat_tokenizer.eos_token_id)
# #     response = chat_tokenizer.decode(outputs[0], skip_special_tokens=True)
    
# #     # Cắt phần prompt nếu model lặp lại
# #     return response.replace(full_prompt, "").strip()



# # @app.route("/embed", methods=["POST"])
# # def embed():
# #     text = request.json.get("text", "")
# #     return jsonify({"embedding": get_embedding(text)})

# # @app.route("/chat", methods=["POST"])
# # def chat():
# #     prompt = request.json.get("prompt", "")
# #     response = generate_response(prompt)
# #     return jsonify({"response": response})

# # if __name__ == "__main__":
# #     app.run(debug=True, port=5000)

# from flask import Flask, request, jsonify
# from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModel
# import torch
# import psycopg2
# from psycopg2.extras import RealDictCursor
# import numpy as np
# import os

# app = Flask(__name__)

# # Kết nối CSDL PostgreSQL
# DB_CONFIG = {
#     "host": "172.23.46.76",
#     "database": "ttnt",
#     "user": "postgres",
#     "password": "051203",
#     "port": 5432
# }

# # Load mô hình LLM
# chat_tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
# chat_model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
# chat_model.eval()

# # Load mô hình embedding
# embedding_tokenizer = AutoTokenizer.from_pretrained("thenlper/gte-small")
# embedding_model = AutoModel.from_pretrained("thenlper/gte-small")

# # Hàm tạo embedding
# def get_embedding(text):
#     inputs = embedding_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
#     with torch.no_grad():
#         model_output = embedding_model(**inputs)
#     embeddings = model_output.last_hidden_state.mean(dim=1)
#     return embeddings[0].tolist()  # vector 384 chiều

# # Hàm tính cosine similarity
# def cosine_similarity(vec1, vec2):
#     v1 = np.array(vec1)
#     v2 = np.array(vec2)
#     return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

# # Hàm tìm câu hỏi gần giống nhất từ bảng FAQ
# def find_similar_faq(user_embedding):
#     conn = psycopg2.connect(**DB_CONFIG)
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     cur.execute("SELECT id, question, answer, embedding FROM faq")
#     faqs = cur.fetchall()
#     cur.close()
#     conn.close()

#     best_score = -1
#     best_faq = None
#     for faq in faqs:
#         score = cosine_similarity(user_embedding, faq["embedding"])
#         if score > best_score:
#             best_score = score
#             best_faq = faq

#     if best_score >= 0.75:  # ngưỡng tương đồng
#         return best_faq
#     else:
#         return None

# # Lưu vào lịch sử tìm kiếm
# def save_search_history(user_id, question, matched_faq_id, response):
#     conn = psycopg2.connect(**DB_CONFIG)
#     cur = conn.cursor()
#     cur.execute("""
#         INSERT INTO lichsutimkiemai (user_id, question, matched_faq_id, response)
#         VALUES (%s, %s, %s, %s)
#     """, (user_id, question, matched_faq_id, response))
#     conn.commit()
#     cur.close()
#     conn.close()

# # Gọi AI sinh phản hồi
# def generate_response(prompt):
#     full_prompt = f"User: {prompt}\nAssistant:"
#     inputs = chat_tokenizer(full_prompt, return_tensors="pt")
#     outputs = chat_model.generate(**inputs, max_new_tokens=80, pad_token_id=chat_tokenizer.eos_token_id)
#     result = chat_tokenizer.decode(outputs[0], skip_special_tokens=True)
#     return result.replace(full_prompt, "").strip()

# # API tạo embedding
# @app.route("/embed", methods=["POST"])
# def embed():
#     text = request.json.get("text", "")
#     return jsonify({"embedding": get_embedding(text)})

# # API xử lý câu hỏi thông minh
# @app.route("/chat", methods=["POST"])
# def chat():
#     prompt = request.json.get("prompt", "")
#     user_id = request.json.get("user_id", None)  # từ client gửi lên nếu muốn lưu lịch sử

#     user_embedding = get_embedding(prompt)
#     matched_faq = find_similar_faq(user_embedding)

#     if matched_faq:
#         context = f"Câu hỏi liên quan: {matched_faq['question']}\nTrả lời: {matched_faq['answer']}"
#     else:
#         context = "Không có câu hỏi tương tự trong cơ sở dữ liệu."

#     final_prompt = f"{context}\n\nUser: {prompt}\nAssistant:"
#     response = generate_response(final_prompt)

#     # Lưu lịch sử nếu có user_id
#     if user_id:
#         save_search_history(user_id, prompt, matched_faq['id'] if matched_faq else None, response)

#     return jsonify({"response": response})

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)

from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModel
import torch
import psycopg2
from psycopg2.extras import RealDictCursor
import numpy as np

app = Flask(__name__)

# --- Cấu hình kết nối CSDL ---
DB_CONFIG = {
    "host": "172.23.46.76",
    "database": "ttnt",
    "user": "postgres",
    "password": "051203",
    "port": 5432
}

# --- Load mô hình LLM và Embedding ---
chat_tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
chat_model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
chat_model.eval()

embedding_tokenizer = AutoTokenizer.from_pretrained("thenlper/gte-small")
embedding_model = AutoModel.from_pretrained("thenlper/gte-small")


# --- Hàm tạo embedding ---
def get_embedding(text):
    inputs = embedding_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        model_output = embedding_model(**inputs)
    embeddings = model_output.last_hidden_state.mean(dim=1)
    return embeddings[0].tolist()  # vector 384 chiều


# --- Hàm tính cosine similarity ---
def cosine_similarity(vec1, vec2):
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))


# --- Tìm FAQ tương tự ---
def find_similar_faq(user_embedding):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, question, answer, embedding FROM faq WHERE embedding IS NOT NULL")
    faqs = cur.fetchall()
    cur.close()
    conn.close()

    best_score = -1
    best_faq = None

    for faq in faqs:
        try:
            score = cosine_similarity(user_embedding, faq["embedding"])
            print(f"Score with '{faq['question']}':", score)
            if score > best_score:
                best_score = score
                best_faq = faq
        except Exception as e:
            continue  # Bỏ qua những dòng bị lỗi

    return best_faq if best_score >= 0.7 else None


# --- Lưu lịch sử tìm kiếm ---
def save_search_history(user_id, question, matched_faq_id, response):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO lichsutimkiemai (user_id, question, matched_faq_id, response)
        VALUES (%s, %s, %s, %s)
    """, (user_id, question, matched_faq_id, response))
    conn.commit()
    cur.close()
    conn.close()


# --- Sinh phản hồi từ AI ---
def generate_response(prompt):
    full_prompt = f"User: {prompt}\nAssistant:"
    inputs = chat_tokenizer(full_prompt, return_tensors="pt")
    outputs = chat_model.generate(**inputs, max_new_tokens=80, pad_token_id=chat_tokenizer.eos_token_id)
    result = chat_tokenizer.decode(outputs[0], skip_special_tokens=True)
    return result.replace(full_prompt, "").strip()


# --- API tạo embedding ---
@app.route("/embed", methods=["POST"])
def embed():
    text = request.json.get("text", "")
    return jsonify({"embedding": get_embedding(text)})


# --- API chat thông minh ---
@app.route("/chat", methods=["POST"])
def chat():
    prompt = request.json.get("prompt", "")
    user_id = request.json.get("user_id", None)

    user_embedding = get_embedding(prompt)
    matched_faq = find_similar_faq(user_embedding)

    if matched_faq:
        context = f"Câu hỏi liên quan: {matched_faq['question']}\nTrả lời: {matched_faq['answer']}"
    else:
        context = "Không có câu hỏi tương tự trong cơ sở dữ liệu."

    final_prompt = f"{context}\n\nUser: {prompt}\nAssistant:"
    response = generate_response(final_prompt)

    if user_id:
        save_search_history(user_id, prompt, matched_faq['id'] if matched_faq else None, response)

    return jsonify({"response": response})


# --- API thêm dữ liệu FAQ mới (Tùy chọn) ---
@app.route("/add_faq", methods=["POST"])
def add_faq():
    data = request.json
    question = data.get("question")
    answer = data.get("answer")

    if not question or not answer:
        return jsonify({"error": "Thiếu dữ liệu"}), 400

    embedding = get_embedding(question)

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO faq (question, answer, embedding) VALUES (%s, %s, %s)",
        (question, answer, embedding)
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Đã thêm FAQ thành công"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
