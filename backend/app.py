from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import nltk
import subprocess
import sys
import os
from nltk.corpus import stopwords

app = Flask(__name__)
CORS(app)

# --------------------------------------------------
# Load trained models
# --------------------------------------------------
model = joblib.load("model.pkl")  # Logistic Regression
vectorizer = joblib.load("vectorizer.pkl")

# ✅ Load Naive Bayes model safely
try:
    naive_model = joblib.load("naive_model.pkl")
except:
    naive_model = None  # fallback if not available

nltk.download("stopwords")
stop_words = set(stopwords.words("english"))

# Keep negation words
NEGATION_WORDS = {"not", "no", "nor", "never", "nothing", "neither", "n't"}

for w in NEGATION_WORDS:
    stop_words.discard(w)

# Words we don’t want to highlight
NEUTRAL_WORDS = {
    "movie", "film", "movies", "films", "story", "plot",
    "character", "characters", "scene", "scenes", "acting",
    "director", "it", "this", "that", "thing", "things",
}

# --------------------------------------------------
# Clean Text
# --------------------------------------------------
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z']", " ", text)
    words = text.split()

    new_words = []
    negate = False

    for word in words:
        if word in NEGATION_WORDS:
            negate = True
            continue

        if negate:
            new_words.append("NOT_" + word)
            negate = False
        else:
            if word not in stop_words:
                new_words.append(word)

    return " ".join(new_words)

# --------------------------------------------------
# Prediction Route
# --------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = data.get("text", "")
    model_type = data.get("model", "logistic")

    if not text.strip():
        return jsonify({"error": "No text provided"}), 400

    cleaned = clean_text(text)
    vectorized = vectorizer.transform([cleaned])

    # --------------------------------------------------
    # Model Selection
    # --------------------------------------------------
    if model_type == "logistic":
        selected_model = model
    elif model_type == "naive" and naive_model is not None:
        selected_model = naive_model
    else:
        selected_model = model  # fallback

    prediction = selected_model.predict(vectorized)[0]
    probabilities = selected_model.predict_proba(vectorized)[0]

    # 3-Class Mapping
    label_map = {
        0: "Negative",
        1: "Neutral",
        2: "Positive"
    }

    sentiment = label_map.get(prediction, "Neutral")
    confidence = float(max(probabilities)) * 100

    # --------------------------------------------------
    # Explainability Logic (FIXED)
    # --------------------------------------------------
    feature_names = vectorizer.get_feature_names_out()
    classes = selected_model.classes_

    neg_index = list(classes).index(0)
    pos_index = list(classes).index(2)

    positive_words_found = []
    negative_words_found = []

    _, nonzero_indices = vectorized.nonzero()

    # ✅ FIX: Handle models differently
    if hasattr(selected_model, "coef_"):
        coefficients = selected_model.coef_

        for idx in nonzero_indices:
            token = feature_names[idx]
            base_word = token[4:] if token.startswith("NOT_") else token

            if base_word.lower() in NEUTRAL_WORDS:
                continue

            neg_weight = coefficients[neg_index][idx]
            pos_weight = coefficients[pos_index][idx]

            if pos_weight > neg_weight:
                positive_words_found.append(base_word)
            elif neg_weight > pos_weight:
                negative_words_found.append(base_word)

    else:
        # ✅ For Naive Bayes → skip word weighting (no crash)
        for idx in nonzero_indices:
            token = feature_names[idx]
            base_word = token[4:] if token.startswith("NOT_") else token

            if base_word.lower() in NEUTRAL_WORDS:
                continue

            # Simple fallback (just collect words)
            positive_words_found.append(base_word)

    return jsonify({
        "sentiment": sentiment,
        "confidence": round(confidence, 2),
        "positiveWords": list(set(positive_words_found)),
        "negativeWords": list(set(negative_words_found)),
        "modelUsed": model_type
    })

# --------------------------------------------------
# Training Route
# --------------------------------------------------
@app.route("/train", methods=["POST"])
def train():
    data = request.json or {}
    dataset_path = data.get("datasetPath", "").strip()

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    cmd = [sys.executable, "train.py"]

    if dataset_path:
        cmd.append(dataset_path)

    try:
        result = subprocess.run(
            cmd,
            cwd=backend_dir,
            capture_output=True,
            text=True,
            timeout=600,
        )

        out = (result.stdout or "") + (result.stderr or "")
        lines = [line.strip() for line in out.splitlines() if line.strip()]

        accuracy = None
        for line in lines:
            if "Accuracy" in line:
                try:
                    accuracy = float(line.split(":")[-1].replace("%", "").strip())
                except:
                    pass

        if result.returncode != 0:
            return jsonify({"ok": False, "logs": lines, "error": "Training failed"}), 400

        # Reload models
        global model, vectorizer, naive_model
        model = joblib.load(os.path.join(backend_dir, "model.pkl"))
        vectorizer = joblib.load(os.path.join(backend_dir, "vectorizer.pkl"))

        if os.path.exists(os.path.join(backend_dir, "naive_model.pkl")):
            naive_model = joblib.load(os.path.join(backend_dir, "naive_model.pkl"))

        return jsonify({"ok": True, "logs": lines, "accuracy": accuracy})

    except subprocess.TimeoutExpired:
        return jsonify({"ok": False, "logs": [], "error": "Training timed out"}), 400
    except Exception as e:
        return jsonify({"ok": False, "logs": [], "error": str(e)}), 500

# --------------------------------------------------
# Run App
# --------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)