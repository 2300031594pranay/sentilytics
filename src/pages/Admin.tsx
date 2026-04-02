import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Terminal } from "lucide-react";

const TRAIN_API = "http://127.0.0.1:5000/train";

const Admin = () => {
  const [training, setTraining] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRetrain = async () => {
    setTraining(true);
    setLogs([]);
    setAccuracy(null);
    setError(null);
    try {
      const res = await fetch(TRAIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.logs?.length) setLogs(data.logs);
      if (data.accuracy != null) setAccuracy(data.accuracy);
      if (!data.ok) setError(data.error || "Training failed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setLogs([]);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage and retrain your sentiment model.</p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" /> Retrain Model
          </h2>
          <p className="text-sm text-muted-foreground">Retrain the model with the dataset in the backend folder (e.g. imdb.csv or IMDB.csv). Put your CSV there and run training. This will replace the current model.</p>
          {accuracy != null && (
            <p className="text-sm text-positive font-medium">Last run accuracy: {accuracy}%</p>
          )}
          {error && (
            <p className="text-sm text-negative">{error}</p>
          )}
          <Button
            onClick={handleRetrain}
            disabled={training}
            className="gradient-bg text-primary-foreground font-semibold glow-effect hover:opacity-90 transition-opacity"
          >
            {training ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {training ? "Training..." : "Start Training"}
          </Button>
        </div>

        {logs.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-primary" /> Training Logs
            </h2>
            <div className="bg-background/80 rounded-lg p-4 font-mono text-xs space-y-1 max-h-80 overflow-y-auto">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={log.toLowerCase().includes("accuracy") ? "text-positive" : log.toLowerCase().includes("error") || log.includes("failed") ? "text-negative" : "text-muted-foreground"}
                >
                  {log}
                </motion.div>
              ))}
              {training && <span className="inline-block w-2 h-4 bg-primary animate-pulse" />}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Admin;
