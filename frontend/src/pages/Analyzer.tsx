import Navbar from "@/components/Navbar";
import AnalyzerSection from "@/components/AnalyzerSection";
import BulkUpload from "@/components/BulkUpload";

const Analyzer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">Sentiment Analyzer</h1>
          <p className="text-muted-foreground">Enter text or upload a CSV to analyze sentiment.</p>
        </div>
        <AnalyzerSection />
        <BulkUpload />
      </div>
    </div>
  );
};

export default Analyzer;
