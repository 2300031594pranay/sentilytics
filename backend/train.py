import pandas as pd
import joblib
import re
import nltk
import sys
import os

from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB   # ✅ NEW
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

nltk.download("stopwords")

# ======================================================
# 1️⃣ Get Dataset Path
# ======================================================

def get_dataset_path():
    if len(sys.argv) > 1:
        path = sys.argv[1].strip()
        if os.path.isfile(path):
            return path
        raise FileNotFoundError(f"Dataset not found: {path}")

    for name in ("combined_dataset.csv", "imdb.csv", "IMDB.csv", "amazon.csv"):
        if os.path.isfile(name):
            return name

    raise FileNotFoundError("No dataset found.")

dataset_path = get_dataset_path()
print(f"\nUsing dataset: {dataset_path}")

# ======================================================
# 2️⃣ Load Dataset
# ======================================================

df = pd.read_csv(dataset_path)
df.columns = df.columns.str.lower()

text_col = "review" if "review" in df.columns else "text"
label_col = "sentiment" if "sentiment" in df.columns else "label"
rating_col = "rating" if "rating" in df.columns else None

if text_col not in df.columns:
    raise ValueError("Dataset must contain 'review' or 'text' column.")

df = df.rename(columns={text_col: "review"})

# ======================================================
# 3️⃣ Convert to 3-Class Sentiment
# ======================================================

if rating_col:
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce")

    def convert_rating(r):
        if pd.isna(r):
            return None
        if r <= 2:
            return 0
        elif r == 3:
            return 1
        else:
            return 2

    df["sentiment"] = df["rating"].apply(convert_rating)

elif label_col in df.columns:
    df = df.rename(columns={label_col: "sentiment"})

    if df["sentiment"].dtype in ["int64", "int32"]:
        unique_vals = sorted(df["sentiment"].unique())
        if set(unique_vals) == {0, 1}:
            df["sentiment"] = df["sentiment"].apply(
                lambda x: 2 if x == 1 else 0
            )
    else:
        sentiment_map = {
            "negative": 0,
            "neutral": 1,
            "positive": 2,
            "neg": 0,
            "neu": 1,
            "pos": 2,
            "0": 0,
            "1": 1,
            "2": 2
        }

        df["sentiment"] = (
            df["sentiment"]
            .astype(str)
            .str.lower()
            .str.strip()
            .map(sentiment_map)
        )
else:
    raise ValueError("No valid sentiment or rating column found.")

df = df.dropna(subset=["review", "sentiment"])
df["sentiment"] = df["sentiment"].astype(int)

print("\nOriginal Class Distribution:")
print(df["sentiment"].value_counts())

# ======================================================
# 🔥 Neutral Boost
# ======================================================

neutral_sentences = [
    "The movie was okay",
    "It was average",
    "It was fine",
    "Nothing special about it",
    "It was decent",
    "Not bad not great",
    "The film was normal",
    "It was just okay",
    "It was neither good nor bad",
    "The experience was average"
]

neutral_data = pd.DataFrame({
    "review": neutral_sentences * 100,
    "sentiment": [1] * len(neutral_sentences) * 100
})

df = pd.concat([df, neutral_data], ignore_index=True)

print("\nAfter Neutral Boost:")
print(df["sentiment"].value_counts())

# ======================================================
# 4️⃣ Cleaning
# ======================================================

stop_words = set(stopwords.words("english"))
NEGATION_WORDS = {"not", "no", "nor", "never", "nothing", "neither", "n't"}

for w in NEGATION_WORDS:
    stop_words.discard(w)

def clean_text(text):
    text = str(text).lower()
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

df["review"] = df["review"].apply(clean_text)

# ======================================================
# 5️⃣ Split
# ======================================================

X = df["review"]
y = df["sentiment"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ======================================================
# 6️⃣ TF-IDF
# ======================================================

vectorizer = TfidfVectorizer(
    max_features=20000,
    ngram_range=(1, 2),
    min_df=2
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# ======================================================
# 7️⃣ Train Logistic Regression
# ======================================================

print("\nTraining Logistic Regression...")

log_model = LogisticRegression(
    max_iter=600,
    class_weight="balanced",
    solver="lbfgs"
)

log_model.fit(X_train_vec, y_train)

log_pred = log_model.predict(X_test_vec)
log_acc = accuracy_score(y_test, log_pred)

print("\nLogistic Regression Accuracy:", round(log_acc * 100, 2), "%")

# ======================================================
# 8️⃣ Train Naive Bayes
# ======================================================

print("\nTraining Naive Bayes...")

nb_model = MultinomialNB()
nb_model.fit(X_train_vec, y_train)

nb_pred = nb_model.predict(X_test_vec)
nb_acc = accuracy_score(y_test, nb_pred)

print("\nNaive Bayes Accuracy:", round(nb_acc * 100, 2), "%")

# ======================================================
# 9️⃣ Save Models
# ======================================================

joblib.dump(log_model, "model.pkl")           # logistic
joblib.dump(nb_model, "naive_model.pkl")      # naive
joblib.dump(vectorizer, "vectorizer.pkl")

print("\n✅ Models saved:")
print(" - model.pkl (Logistic Regression)")
print(" - naive_model.pkl (Naive Bayes)")
print(" - vectorizer.pkl")