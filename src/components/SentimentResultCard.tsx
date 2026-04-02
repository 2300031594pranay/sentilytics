import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type SentimentResult = {
  sentiment: string;
  confidence: number; // 0–100
  positiveWords: string[];
  negativeWords: string[];
};

interface Props {
  result: SentimentResult;
  text: string;
}

const COLORS = {
  Positive: "hsl(142 70% 45%)",
  Negative: "hsl(0 84% 60%)",
};

const SentimentResultCard = ({ result, text }: Props) => {
  const emoji =
    result.sentiment === "Positive"
      ? "😊"
      : result.sentiment === "Negative"
      ? "😢"
      : "😐";

  // Pie Chart Values
  const positiveValue =
    result.sentiment === "Positive"
      ? result.confidence
      : 100 - result.confidence;

  const negativeValue =
    result.sentiment === "Negative"
      ? result.confidence
      : 100 - result.confidence;

  const chartData = [
    { name: "Positive", value: positiveValue },
    { name: "Negative", value: negativeValue },
  ];

  // 🔥 Highlight words based on ML explainability
  // Backend may return NOT_-prefixed tokens (e.g. NOT_good); match original word "good" for highlighting
  const highlightText = () => {
    const words = text.split(/(\s+)/);
    const posSet = new Set((result.positiveWords ?? []).map((w) => w.toLowerCase()));
    const negSet = new Set((result.negativeWords ?? []).map((w) => w.toLowerCase()));

    return words.map((word, i) => {
      const clean = word.toLowerCase().replace(/[^a-zA-Z]/g, "");
      if (!clean) return <span key={i}>{word}</span>;

      const isPositive = posSet.has(clean);
      const isNegative = negSet.has(clean) || negSet.has("NOT_" + clean);

      if (isPositive) {
        return (
          <span
            key={i}
            className="bg-green-500/20 text-green-400 px-1 rounded"
          >
            {word}
          </span>
        );
      }

      if (isNegative) {
        return (
          <span
            key={i}
            className="bg-red-500/20 text-red-400 px-1 rounded"
          >
            {word}
          </span>
        );
      }

      return <span key={i}>{word}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <div className="glass-card rounded-xl p-6 text-center">
        <div className="text-5xl mb-3">{emoji}</div>

        <div
          className={`text-2xl font-display font-bold ${
            result.sentiment === "Positive"
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {result.sentiment}
        </div>

        <div className="text-muted-foreground mt-1">
          Confidence:{" "}
          <span className="font-semibold text-foreground">
            {result.confidence}%
          </span>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
          Sentiment Distribution
        </h3>

        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    COLORS[
                      entry.name as keyof typeof COLORS
                    ]
                  }
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value}%`]}
              contentStyle={{
                background: "hsl(240 15% 12%)",
                border: "1px solid hsl(240 10% 18%)",
                borderRadius: "8px",
                color: "white",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    COLORS[
                      d.name as keyof typeof COLORS
                    ],
                }}
              />
              {d.name} {d.value.toFixed(2)}%
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 Word Analysis Section */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
          Word Analysis
        </h3>

        <p className="text-sm leading-relaxed">
          {highlightText()}
        </p>

        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Positive words
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Negative words
          </span>
        </div>
      </div>
    </div>
  );
};

export default SentimentResultCard;