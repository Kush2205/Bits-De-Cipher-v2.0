/**
 * Question Display Component
 * 
 * Displays a single quiz question with multiple choice options.
 * 
 * Props:
 * - question: Question object with text and options
 * - selectedOption: Currently selected option index (or null)
 * - onSelect: Callback when option is selected
 * - onSubmit: Callback to submit answer
 * - isSubmitted: Whether answer has been submitted
 * - isCorrect: Whether submitted answer is correct (optional)
 * 
 * Features to Implement:
 * 
 * 1. Question Text:
 *    - Display question prominently
 *    - Support markdown or HTML (if needed)
 *    - Question number indicator
 * 
 * 2. Multiple Choice Options:
 *    - Render all options as buttons or radio inputs
 *    - Show selection state (highlight selected)
 *    - Disable after submission
 *    - Show correct/incorrect after submission
 * 
 * 3. Answer Feedback:
 *    - Green border for correct answer (after submit)
 *    - Red border for incorrect answer (after submit)
 *    - Show correct answer if user was wrong
 * 
 * 4. Submit Button:
 *    - Disabled until option selected
 *    - Loading state while submitting
 *    - "Next" button after submission
 * 
 * 5. Keyboard Navigation:
 *    - Number keys (1-4) to select options
 *    - Enter to submit
 *    - Improves user experience
 * 
 * Example Structure:
 * <div className="question-display">
 *   <h2>Question {questionNumber}</h2>
 *   <p className="question-text">{question.text}</p>
 *   
 *   <div className="options">
 *     {question.options.map((option, index) => (
 *       <button
 *         key={index}
 *         className={`option ${selectedOption === index ? 'selected' : ''}`}
 *         onClick={() => onSelect(index)}
 *         disabled={isSubmitted}
 *       >
 *         {option}
 *       </button>
 *     ))}
 *   </div>
 *   
 *   <button 
 *     onClick={onSubmit}
 *     disabled={selectedOption === null || isSubmitted}
 *   >
 *     Submit Answer
 *   </button>
 * </div>
 */

interface QuestionDisplayProps {
  question: {
    id: string;
    text: string;
    options: string[];
  };
  selectedOption: number | null;
  onSelect: (index: number) => void;
  onSubmit: () => void;
  isSubmitted?: boolean;
  isCorrect?: boolean;
}

const QuestionDisplay = ({
  question,
  selectedOption,
  onSelect,
  onSubmit,
  isSubmitted = false,
  isCorrect
}: QuestionDisplayProps) => {
  // TODO: Implement question UI
  // TODO: Add keyboard navigation
  // TODO: Handle answer feedback
  // TODO: Add animations
  
  return (
    <div>
      <p>{question.text}</p>
      {/* Implementation here */}
    </div>
  );
};

export default QuestionDisplay;
