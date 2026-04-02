import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const emojis = [
  { emoji: "😊", delay: 0, x: "100px", y: "20%" },
  { emoji: "😢", delay: 1, x: "80%", y: "15%" },
  { emoji: "😡", delay: 2, x: "15%", y: "70%" },
  { emoji: "🤩", delay: 0.5, x: "75%", y: "65%" },
  { emoji: "😐", delay: 1.5, x: "50%", y: "10%" },
  { emoji: "💡", delay: 2.5, x: "85%", y: "40%" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/15 rounded-full blur-[100px]" />
      </div>

      {/* Floating emojis */}
      {emojis.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl md:text-5xl pointer-events-none select-none opacity-20"
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -20, 0], ...(i === 0 ? { rotate: [0, 1, 0] } : {}) }}
          transition={{ duration: 6, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {item.emoji}
        </motion.div>
      ))}

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
            <span className="text-sm text-muted-foreground">Powered by Machine Learning</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 tracking-tight">
            <span className="gradient-text">SentimentAI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Analyze Emotions from Text using Machine Learning.
            <br className="hidden md:block" />
            Understand sentiment with TF-IDF & Logistic Regression.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/analyzer">
              <Button size="lg" className="gradient-bg text-primary-foreground font-semibold px-8 py-6 text-base glow-effect hover:opacity-90 transition-opacity">
                Try Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-border/50 bg-muted/30 backdrop-blur-sm px-8 py-6 text-base hover:bg-muted/50 text-foreground">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: "89%", label: "Accuracy" },
            { value: "50K+", label: "Reviews" },
            { value: "<1s", label: "Analysis" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-display font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
