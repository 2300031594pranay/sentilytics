import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Brain, BarChart3, Cpu, Database } from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Data Collection",
    desc: "Large-scale dataset of movie reviews collected and preprocessed using text normalization techniques."
  },
  {
    icon: Cpu,
    title: "Feature Extraction",
    desc: "TF-IDF Vectorizer transforms text into numerical features capturing word importance and frequency."
  },
  {
    icon: Brain,
    title: "Model Training",
    desc: "Multiple models trained including Logistic Regression and Naive Bayes for comparative sentiment analysis."
  },
  {
    icon: BarChart3,
    title: "Prediction",
    desc: "User input is analyzed in real-time using selected model with confidence score and word-level insights."
  },
];

const models = [
  {
    name: "Logistic Regression",
    desc: "A linear model that uses feature weights to classify sentiment. Strong at identifying impactful words.",
    accuracy: "89%+"
  },
  {
    name: "Naive Bayes",
    desc: "A probabilistic model that uses word likelihoods. Faster and handles balanced probabilities well.",
    accuracy: "85%+"
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-3">
              How It Works
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This sentiment analysis system uses Natural Language Processing (NLP)
              and multiple machine learning models to classify text into Positive,
              Negative, or Neutral sentiments.
            </p>
          </div>

          {/* Architecture */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-5 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Models Section */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-display font-semibold mb-4">
              Models Used
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {models.map((model) => (
                <div
                  key={model.name}
                  className="p-4 rounded-lg bg-muted/30"
                >
                  <h3 className="font-semibold text-sm mb-1">
                    {model.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {model.desc}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    Accuracy: {model.accuracy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Feature */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-display font-semibold mb-4">
              Key Features
            </h2>

            <ul className="text-sm text-muted-foreground space-y-2">
              <li>✔ Real-time sentiment analysis</li>
              <li>✔ Multiple model selection (Logistic & Naive Bayes)</li>
              <li>✔ Confidence score prediction</li>
              <li>✔ Word-level sentiment explanation</li>
              <li>✔ Handles negation (e.g., "not good")</li>
            </ul>
          </div>

          {/* Confusion Matrix */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-display font-semibold mb-4">
              Sample Confusion Matrix (Logistic Model)
            </h2>

            <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto text-center text-sm">
              <div />
              <div className="text-muted-foreground font-medium py-2">
                Pred +
              </div>
              <div className="text-muted-foreground font-medium py-2">
                Pred −
              </div>

              <div className="text-muted-foreground font-medium py-2">
                Actual +
              </div>
              <div className="bg-positive/20 text-positive rounded p-3 font-bold">
                4,480
              </div>
              <div className="bg-negative/10 text-negative rounded p-3">
                520
              </div>

              <div className="text-muted-foreground font-medium py-2">
                Actual −
              </div>
              <div className="bg-negative/10 text-negative rounded p-3">
                560
              </div>
              <div className="bg-positive/20 text-positive rounded p-3 font-bold">
                4,440
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default About;