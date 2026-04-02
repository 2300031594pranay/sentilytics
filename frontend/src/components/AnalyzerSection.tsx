import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SentimentResultCard from "./SentimentResultCard";
import axios from "axios";
import type { SentimentResult } from "@/lib/sentiment";

const AnalyzerSection = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);

  // ✅ Model selection
  const [modelType, setModelType] = useState("logistic");

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        
        "https://sentilytics-backend-6vti.onrender.com/predict",
        {
          text,
          model: modelType,
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error("Error calling API:", error);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-display font-semibold">
            Enter Text
          </h2>
          <span className="text-sm text-muted-foreground">
            {text.length} / 5000
          </span>
        </div>

        {/* TEXTAREA + MODEL */}
        <div className="flex gap-4 items-start">
          
          {/* Textarea */}
          <Textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value.slice(0, 5000))
            }
            placeholder="Paste a review, tweet, or any text to analyze its sentiment..."
            className="flex-1 min-h-[160px] bg-muted/30 border-border/50 resize-none text-base"
          />

          {/* Model Selector */}
          <div className="w-52">
            <label className="text-sm text-muted-foreground">
              Select Model
            </label>

            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full mt-1 p-2 rounded-md bg-muted/30 border border-border/50"
            >
              <option value="logistic">
                Logistic Regression
              </option>

              {/* ✅ ENABLED */}
              <option value="naive">
                Naive Bayes
              </option>

              {/* Still disabled */}
              <option value="bert" disabled>
                BERT (Coming Soon)
              </option>
            </select>

            {/* Model display */}
            <p className="text-xs text-muted-foreground mt-2">
              Using:{" "}
              <span className="font-semibold capitalize">
                {modelType === "logistic"
                  ? "Logistic Regression"
                  : modelType === "naive"
                  ? "Naive Bayes"
                  : modelType}
              </span>
            </p>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={handleAnalyze}
          disabled={!text.trim() || loading}
          className="gradient-bg text-primary-foreground font-semibold w-full py-5 glow-effect hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          {loading ? "Analyzing..." : "Analyze Sentiment"}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SentimentResultCard
              result={result}
              text={text}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyzerSection;