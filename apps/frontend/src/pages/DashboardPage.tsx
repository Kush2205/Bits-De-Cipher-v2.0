
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Competition</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user.name || user.email}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Points</h3>
              <p className="text-4xl font-bold text-blue-600">{user.totalPoints || 0}</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Question</h3>
              <p className="text-4xl font-bold text-green-600">{(user.currentQuestionIndex || 0) + 1}</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Progress</h3>
              <p className="text-4xl font-bold text-purple-600">{user.currentQuestionIndex || 0}/10</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-2xl font-bold mb-4">Ready to Continue?</h3>
            <p className="text-gray-600 mb-6">
              Answer questions to earn points! Each correct answer boosts your score.
            </p>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition text-lg font-semibold"
              onClick={() => alert('Quiz page coming soon!')}
            >
              Start Quiz
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
