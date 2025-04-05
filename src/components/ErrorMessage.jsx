import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <motion.div 
      className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded shadow-sm max-w-2xl mx-auto"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <FaExclamationTriangle className="mr-3 text-red-500" />
        <p>{message}</p>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;
