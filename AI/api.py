
# import os
# from flask import Flask, request, jsonify
# import torch
# import psycopg2
# from psycopg2.extras import RealDictCursor
# import numpy as np
# from transformers import AutoTokenizer, AutoModel, AutoModelForCausalLM
# from dotenv import load_dotenv
# from flask import Response
# import json
# import ast
# # Load biến môi trường
# load_dotenv()

# app = Flask(__name__)

# # --- Kết nối DB ---
# DB_CONFIG = {
#     "host": "172.23.171.186",
#     "database": "ttnt",
#     "user": "postgres",
#     "password": "051203",
#     "port": 5432
# }

# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# # --- Load model embedding local ---
# embedding_tokenizer = AutoTokenizer.from_pretrained("thenlper/gte-small")
# embedding_model = AutoModel.from_pretrained("thenlper/gte-small").to(device)

# # --- Load model chat local ---
# chat_model_name = "microsoft/DialoGPT-small"
# chat_tokenizer = AutoTokenizer.from_pretrained(chat_model_name)
# chat_model = AutoModelForCausalLM.from_pretrained(chat_model_name).to(device)
# chat_model.eval()

# # --- Hàm tạo embedding ---
# def get_embedding(text):
#     inputs = embedding_tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(device)
#     with torch.no_grad():
#         model_output = embedding_model(**inputs)
#     embeddings = model_output.last_hidden_state.mean(dim=1)
#     return embeddings[0].tolist()

# # --- Hàm tính cosine similarity ---
# def cosine_similarity(vec1, vec2):
#     v1 = np.array(vec1)
#     v2 = np.array(vec2)
#     return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

# # --- Tìm FAQ tương tự ---
# import numpy as np
# import ast  # để chuyển string "[...]" thành list

# def find_similar_faq(user_embedding):
#     conn = psycopg2.connect(...)
#     cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
#     cur.execute("SELECT id, question, answer, embedding FROM faq")
#     faqs = cur.fetchall()
#     cur.close()
#     conn.close()

#     print(f"[DEBUG] user_embedding length: {len(user_embedding)}")

#     best_score = -1
#     best_faq = None

#     for faq in faqs:
#         emb = faq["embedding"]
#         if isinstance(emb, str):
#             emb = np.array(ast.literal_eval(emb), dtype=np.float32)  # string → list → numpy array
#         else:
#             emb = np.array(emb, dtype=np.float32)

#         score = cosine_similarity(user_embedding, emb)
#         print(f"[DEBUG] Compare with '{faq['question']}' → score = {score}")

#         if score > best_score:
#             best_score = score
#             best_faq = faq

#     return best_faq if best_score >= 0.5 else None


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

# # --- Hàm sinh phản hồi từ model local ---
# def generate_local_response(prompt):
#     inputs = chat_tokenizer(prompt, return_tensors="pt").to(device)
#     with torch.no_grad():
#         outputs = chat_model.generate(
#             **inputs,
#             max_length=200,
#             pad_token_id=chat_tokenizer.eos_token_id
#         )
#     return chat_tokenizer.decode(outputs[0], skip_special_tokens=True)

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
#     response = generate_local_response(final_prompt)

#     if user_id:
#         save_search_history(user_id, prompt, matched_faq['id'] if matched_faq else None, response)

#     return Response(
#     json.dumps({"response": response}, ensure_ascii=False),
#     content_type="application/json; charset=utf-8"
# )

# # --- API tạo embedding ---
# @app.route("/embed", methods=["POST"])
# def embed():
#     text = request.json.get("text", "")
#     return jsonify({"embedding": get_embedding(text)})

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
import json
import ast
import numpy as np
import torch
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify, Response
from transformers import AutoTokenizer, AutoModel, AutoModelForCausalLM
from dotenv import load_dotenv, dotenv_values
# config = dotenv_values("D:/QLBH/AI/.env")
# print(config)

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)

# --- DB config (đọc từ .env, mặc định an toàn nếu thiếu) ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "ttnt"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "port": int(os.getenv("DB_PORT", 5432))
}

def get_db_conn():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        # log rõ lỗi để dev biết (Flask console)
        print("ERROR: cannot connect to DB:", e)
        raise

# --- rest of your model & functions unchanged ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

embedding_tokenizer = AutoTokenizer.from_pretrained("thenlper/gte-small")
embedding_model = AutoModel.from_pretrained("thenlper/gte-small").to(device)

chat_model_name = "microsoft/DialoGPT-small"
chat_tokenizer = AutoTokenizer.from_pretrained(chat_model_name)
chat_model = AutoModelForCausalLM.from_pretrained(chat_model_name).to(device)
chat_model.eval()

def get_embedding(text):
    inputs = embedding_tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(device)
    with torch.no_grad():
        model_output = embedding_model(**inputs)
    embeddings = model_output.last_hidden_state.mean(dim=1)
    return embeddings[0].tolist()

def cosine_similarity(vec1, vec2):
    v1 = np.array(vec1, dtype=np.float32)
    v2 = np.array(vec2, dtype=np.float32)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

def find_similar_faq(user_embedding):
    try:
        conn = get_db_conn()
    except Exception:
        # nếu không kết nối đc thì trả None (để API vẫn chạy)
        return None

    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, question, answer, embedding FROM faq")
    faqs = cur.fetchall()
    cur.close()
    conn.close()

    best_score = -1
    best_faq = None

    for faq in faqs:
        emb = faq["embedding"]
        if isinstance(emb, str):
            emb = np.array(ast.literal_eval(emb), dtype=np.float32)
        else:
            emb = np.array(emb, dtype=np.float32)

        try:
            score = cosine_similarity(user_embedding, emb)
        except Exception as e:
            print("DEBUG: cosine error:", e)
            continue

        print(f"[DEBUG] Compare with '{faq['question']}' → score = {score}")
        if score > best_score:
            best_score = score
            best_faq = faq

    return best_faq if best_score >= 0.5 else None

def save_search_history(user_id, question, matched_faq_id, response):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO lichsutimkiemai (user_id, question, matched_faq_id, response)
        VALUES (%s, %s, %s, %s)
    """, (user_id, question, matched_faq_id, response))
    conn.commit()
    cur.close()
    conn.close()

def generate_local_response(prompt):
    inputs = chat_tokenizer(prompt, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = chat_model.generate(**inputs, max_length=200, pad_token_id=chat_tokenizer.eos_token_id)
    return chat_tokenizer.decode(outputs[0], skip_special_tokens=True)

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
    response = generate_local_response(final_prompt)

    if user_id:
        save_search_history(user_id, prompt, matched_faq['id'] if matched_faq else None, response)

    return Response(
        json.dumps({"response": response}, ensure_ascii=False),
        content_type="application/json; charset=utf-8"
    )

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
        return Response(
            json.dumps({"error": "Thiếu dữ liệu"}, ensure_ascii=False),
            content_type="application/json; charset=utf-8"
        ), 400

    embedding = get_embedding(question)

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO faq (question, answer, embedding) VALUES (%s, %s, %s)",
        (question, answer, json.dumps(embedding))
    )
    conn.commit()
    cur.close()
    conn.close()

    return Response(
        json.dumps({"message": "Đã thêm FAQ thành công"}, ensure_ascii=False),
        content_type="application/json; charset=utf-8"
    )

if __name__ == "__main__":
    app.run(debug=True, port=5000)
