import { motion } from 'framer-motion';
import { WiDaySunny, WiRaindrops, WiCloudy, WiDaySnow } from 'react-icons/wi';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center py-12">
      <div className="relative w-24 h-24">
        {/* Sun spinning in the center */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <WiDaySunny className="text-5xl text-yellow-400" />
        </motion.div>
        
        {/* Cloud moving around */}
        <motion.div
          className="absolute"
          animate={{ 
            x: [0, 10, 0, -10, 0],
            y: [0, -10, 0, 10, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ top: '0%', left: '60%' }}
        >
          <WiCloudy className="text-4xl text-gray-400" />
        </motion.div>
        
        {/* Rain drops falling */}
        <motion.div
          className="absolute"
          animate={{ 
            y: [0, 20],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeIn" 
          }}
          style={{ top: '30%', left: '20%' }}
        >
          <WiRaindrops className="text-3xl text-pastel-blue" />
        </motion.div>
        
        {/* Snow icon floating */}
        <motion.div
          className="absolute"
          animate={{ 
            y: [0, 15],
            x: [0, 5, 0, -5, 0],
            rotate: [0, 180],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ top: '50%', left: '10%' }}
        >
          <WiDaySnow className="text-3xl text-blue-200" />
        </motion.div>
      </div>
      
      {/* Loading text with dots animation */}
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-gray-600 dark:text-gray-300 font-medium">Loading weather data</p>
        <motion.div 
          className="flex justify-center mt-2 space-x-1"
        >
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 rounded-full bg-pastel-blue"
              animate={{ y: ["0%", "-50%", "0%"] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: dot * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
