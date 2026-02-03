import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface StampAnimationProps {
  show: boolean;
  onComplete?: () => void;
  cafeName?: string;
}

const StampAnimation = ({ show, onComplete, cafeName = "Kahve" }: StampAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          {/* Stamp Container */}
          <motion.div
            initial={{ scale: 3, rotate: -15, opacity: 0 }}
            animate={{ 
              scale: 1, 
              rotate: 0, 
              opacity: 1,
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.4
            }}
            className="relative"
          >
            {/* Outer stamp ring */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="w-48 h-48 rounded-full border-[6px] border-primary bg-background flex flex-col items-center justify-center shadow-2xl"
            >
              {/* Inner content */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-2">
                  <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
                </div>
                <span className="text-lg font-bold text-foreground">+1 DAMGA</span>
                <span className="text-sm text-muted-foreground mt-1">{cafeName}</span>
              </motion.div>
            </motion.div>

            {/* Confetti particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: Math.cos(i * 30 * Math.PI / 180) * 120,
                  y: Math.sin(i * 30 * Math.PI / 180) * 120,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  delay: 0.3,
                  duration: 0.6,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2"
              >
                <div 
                  className={`w-full h-full rounded-full ${
                    i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                />
              </motion.div>
            ))}

            {/* Impact ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="absolute inset-0 rounded-full border-4 border-primary"
            />
          </motion.div>

          {/* Success text */}
          <motion.p
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 60, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="absolute text-lg font-medium text-white"
            style={{ top: '50%', marginTop: '120px' }}
          >
            Harika! Kahve damganız eklendi ☕
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StampAnimation;