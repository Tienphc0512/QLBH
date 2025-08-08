# from flask import Flask, request, jsonify
# from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModel
# import torch
# import psycopg2
# from psycopg2.extras import RealDictCursor
# import numpy as np
# from huggingface_hub import login
# import os
# from dotenv import load_dotenv
# load_dotenv()

# # ---- Đăng nhập HuggingFace nếu có token (nếu cần model từ private repo) ----
# token = os.getenv("HF_TOKEN")
# if token:
#     login(token=token)

# app = Flask(__name__)

# # --- Kết nối DB ---
# DB_CONFIG = {
#     "host": "172.23.46.76",
#     "database": "ttnt",
#     "user": "postgres",
#     "password": "051203",
#     "port": 5432
# }

# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# # --- Load mô hình hội thoại ---
# chat_tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
# chat_model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-small").to(device)
# chat_model.eval()

# # --- Load mô hình embedding ---
# embedding_tokenizer = AutoTokenizer.from_pretrained("thenlper/gte-small")
# embedding_model = AutoModel.from_pretrained("thenlper/gte-small")


# # --- Hàm tạo embedding ---
# def get_embedding(text):
#     inputs = embedding_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
#     with torch.no_grad():
#         model_output = embedding_model(**inputs)
#     embeddings = model_output.last_hidden_state.mean(dim=1)
#     return embeddings[0].tolist()

# # --- Hàm tính độ tương đồng ---
# def cosine_similarity(vec1, vec2):
#     v1 = np.array(vec1)
#     v2 = np.array(vec2)
#     return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

# # --- Tìm FAQ tương tự ---
# def find_similar_faq(user_embedding):
#     conn = psycopg2.connect(**DB_CONFIG)
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     cur.execute("SELECT id, question, answer, embedding FROM faq WHERE embedding IS NOT NULL")
#     faqs = cur.fetchall()
#     cur.close()
#     conn.close()

#     best_score = -1
#     best_faq = None

#     for faq in faqs:
#         try:
#             score = cosine_similarity(user_embedding, faq["embedding"])
#             if score > best_score:
#                 best_score = score
#                 best_faq = faq
#         except Exception:
#             continue

#     return best_faq if best_score >= 0.7 else None

# # --- Lưu lịch sử tìm kiếm ---
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

# # --- Sinh phản hồi từ mô hình hội thoại ---
# def generate_response(prompt):
#     input_ids = chat_tokenizer.encode(prompt + chat_tokenizer.eos_token, return_tensors="pt").to(chat_model.device)

#     with torch.no_grad():
#         output_ids = chat_model.generate(
#             input_ids,
#             max_length=1000,
#             pad_token_id=chat_tokenizer.eos_token_id,
#             do_sample=True,
#             top_k=50,
#             top_p=0.95,
#             temperature=0.7,
#         )

#     response = chat_tokenizer.decode(output_ids[:, input_ids.shape[-1]:][0], skip_special_tokens=True)
#     return response.strip()

# # --- API tạo embedding ---
# @app.route("/embed", methods=["POST"])
# def embed():
#     text = request.json.get("text", "")
#     return jsonify({"embedding": get_embedding(text)})

# # --- API chat ---
# @app.route("/chat", methods=["POST"])
# def chat():
#     prompt = request.json.get("prompt", "")
#     user_id = request.json.get("user_id", None)

#     user_embedding = get_embedding(prompt)
#     matched_faq = find_similar_faq(user_embedding)

#     if matched_faq:
#         context = f"Câu hỏi liên quan: {matched_faq['question']}\nTrả lời: {matched_faq['answer']}"
#     else:
#         context = "Không có câu hỏi tương tự trong cơ sở dữ liệu."

#     final_prompt = f"{context}\n\n{prompt}"
#     response = generate_response(final_prompt)

#     if user_id:
#         save_search_history(user_id, prompt, matched_faq['id'] if matched_faq else None, response)

#     return jsonify({"response": response})

# # --- API thêm câu hỏi FAQ ---
# @app.route("/add_faq", methods=["POST"])
# def add_faq():
#     data = request.json
#     question = data.get("question")
#     answer = data.get("answer")

#     if not question or not answer:
#         return jsonify({"error": "Thiếu dữ liệu"}), 400

#     embedding = get_embedding(question)

#     conn = psycopg2.connect(**DB_CONFIG)
#     cur = conn.cursor()
#     cur.execute(
#         "INSERT INTO faq (question, answer, embedding) VALUES (%s, %s, %s)",
#         (question, answer, embedding)
#     )
#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"message": "Đã thêm FAQ thành công"})

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)

import os
from flask import Flask, request, jsonify
import requests
import torch
import psycopg2
from psycopg2.extras import RealDictCursor
import numpy as np
from transformers import AutoTokenizer, AutoModel
from dotenv import load_dotenv

# Load biến môi trường
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

app = Flask(__name__)

# --- Kết nối DB ---
DB_CONFIG = {
    "host": "172.23.46.76",
    "database": "ttnt",
    "user": "postgres",
    "password": "051203",
    "port": 5432
}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Load model embedding local ---
embedding_tokenizer = AutoTokenizer.from_pretrained("thenlper/gte-small")
embedding_model = AutoModel.from_pretrained("thenlper/gte-small").to(device)

model_name = "gpt2"  # hoặc "tiiuae/falcon-7b-instruct", "facebook/blenderbot-400M-distill", "bigscience/bloomz-560m"

# --- Hàm tạo embedding ---
def get_embedding(text):
    inputs = embedding_tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(device)
    with torch.no_grad():
        model_output = embedding_model(**inputs)
    embeddings = model_output.last_hidden_state.mean(dim=1)
    return embeddings[0].tolist()

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
            if score > best_score:
                best_score = score
                best_faq = faq
        except Exception:
            continue

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

# --- Gọi Hugging Face API ---
def call_huggingface_api(model_name, prompt):
    API_URL = f"https://api-inference.huggingface.co/models/{model_name}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_length": 200}
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    data = response.json()

    if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
        return data[0]["generated_text"]
    else:
        return str(data)

# --- API chat ---
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

    final_prompt = f"{context}\n\n{prompt}"

    # ⚡ Đổi model_name ở đây để test các model khác nhau
    model_name = "gpt2"
    response = call_huggingface_api(model_name, final_prompt)

    if user_id:
        save_search_history(user_id, prompt, matched_faq['id'] if matched_faq else None, response)

    return jsonify({"response": response})

# --- API tạo embedding ---
@app.route("/embed", methods=["POST"])
def embed():
    text = request.json.get("text", "")
    return jsonify({"embedding": get_embedding(text)})

# --- API thêm câu hỏi FAQ ---
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
