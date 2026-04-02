import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";

interface CSVRow {
  text: string;
  sentiment: string;
  confidence: number;
}

const BulkUpload = () => {
  const [results, setResults] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------
  // Detect Text Column Automatically
  // --------------------------------------------------
  const detectTextColumn = (row: Record<string, string>) => {
    const possibleColumns = [
      "text",
      "review",
      "content",
      "reviewText",
      "summary",
      "comment",
    ];

    for (const col of possibleColumns) {
      if (row[col]) return col;
    }

    return null;
  };

  // --------------------------------------------------
  // Handle CSV Upload
  // --------------------------------------------------
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setProgress(0);
    setResults([]);
    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const data = parsed.data as Record<string, string>[];

        if (!data.length) {
          setError("CSV file is empty.");
          setLoading(false);
          return;
        }

        const textColumn = detectTextColumn(data[0]);

        if (!textColumn) {
          setError("No valid text column found (text, review, reviewText, content, summary).");
          setLoading(false);
          return;
        }

        const rows = data.slice(0, 100); // limit for safety
        const processed: CSVRow[] = [];

        for (let i = 0; i < rows.length; i++) {
          const text = rows[i][textColumn] || "";

          try {
            const response = await fetch("https://sentilytics-backend-6vti.onrender.com/predict", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            });

            const result = await response.json();

            processed.push({
              text: text.slice(0, 120),
              sentiment: result.sentiment,
              confidence: result.confidence,
            });
          } catch {
            processed.push({
              text: text.slice(0, 120),
              sentiment: "Error",
              confidence: 0,
            });
          }

          setProgress(Math.round(((i + 1) / rows.length) * 100));
        }

        setResults(processed);
        setLoading(false);
      },
    });
  };

  // --------------------------------------------------
  // Download Results
  // --------------------------------------------------
  const handleDownload = () => {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sentiment_results.csv";
    a.click();
  };

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-display font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" /> Bulk Upload
      </h2>

      <p className="text-sm text-muted-foreground">
        Upload a CSV with a text column (text, review, reviewText, content, summary).
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {fileName || "Choose CSV"}
        </Button>

        {results.length > 0 && (
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Results
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}

      {/* Progress */}
      {loading && (
        <div className="mt-3">
          <div className="h-2 w-full bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Processing... {progress}%
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-x-auto mt-4"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 text-muted-foreground">Text</th>
                <th className="text-left py-2 text-muted-foreground">Sentiment</th>
                <th className="text-left py-2 text-muted-foreground">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-2 max-w-xs truncate">{r.text}</td>
                  <td
                    className={`py-2 font-medium ${
                      r.sentiment === "Positive"
                        ? "text-green-400"
                        : r.sentiment === "Negative"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {r.sentiment}
                  </td>
                  <td className="py-2">{r.confidence.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default BulkUpload;