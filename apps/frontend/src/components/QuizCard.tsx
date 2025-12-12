/**
 * Quiz Card Component
 * 
 * Reusable card component for displaying quiz information.
 * 
 * Props:
 * - quiz: Quiz object with { id, title, description, questionCount, duration }
 * - onStart?: Callback function when "Start Quiz" is clicked
 * 
 * Features to Implement:
 * 
 * 1. Quiz Information Display:
 *    - Title (bold, prominent)
 *    - Description (truncated if long)
 *    - Question count badge
 *    - Duration badge (e.g., "15 mins")
 * 
 * 2. Visual Design:
 *    - Card layout with hover effect
 *    - Icon or thumbnail (optional)
 *    - Tags for difficulty or category
 *    - Shadow and border styling
 * 
 * 3. Action Button:
 *    - "Start Quiz" button
 *    - Navigate to /quiz/:quizId on click
 *    - Loading state while starting
 * 
 * 4. Additional Info (optional):
 *    - Number of participants
 *    - Average score
 *    - Your best score (if taken before)
 * 
 * Example Structure:
 * <div className="quiz-card">
 *   <h3>{quiz.title}</h3>
 *   <p>{quiz.description}</p>
 *   <div className="quiz-meta">
 *     <span>{quiz.questionCount} questions</span>
 *     <span>{quiz.duration / 60} mins</span>
 *   </div>
 *   <button onClick={handleStart}>Start Quiz</button>
 * </div>
 */

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    questionCount: number;
    duration: number;
  };
  onStart?: (quizId: string) => void;
}

const QuizCard = ({ quiz, onStart }: QuizCardProps) => {
  // TODO: Implement card UI
  // TODO: Add hover effects
  // TODO: Handle start button click
  
  return (
    <div>
      <h3>{quiz.title}</h3>
      {/* Implementation here */}
    </div>
  );
};

export default QuizCard;
