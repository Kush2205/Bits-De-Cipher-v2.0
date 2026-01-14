import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/routing/PrivateRoute';
import ContestGuard from "./context/ContestGuard";
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import QuizRoomPage from './pages/QuizRoomPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchCurrentUser } from './store/slices/authSlice';
import { connectSocket, disconnectSocket } from './store/slices/socketSlice';
import { setCurrentUserId } from './store/slices/leaderboardSlice';
import ContestTimerPage from "./pages/ContestTimerPage"
import AdminSignupPage from './pages/AdminSignupPage';

function App() {
  const dispatch = useAppDispatch();
  const { status, accessToken, user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, initialized]);

  useEffect(() => {
    dispatch(setCurrentUserId(user?.id ?? null));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (status === 'authenticated' && accessToken) {
      dispatch(connectSocket());
    } else {
      dispatch(disconnectSocket());
    }
  }, [dispatch, status, accessToken]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/signup" element={<AdminSignupPage />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ContestGuard>
                <DashboardPage />
              </ContestGuard>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/quiz"
          element={
            <PrivateRoute>
              <ContestGuard>
                <QuizRoomPage />
              </ContestGuard>
            </PrivateRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <ContestGuard>
                <LeaderboardPage />
              </ContestGuard>
            </PrivateRoute>
          }
        />

        <Route 
          path="/timer" 
          element={
              <PrivateRoute>
                <ContestTimerPage/>
              </PrivateRoute>
          } 
        />

        <Route path="/contest" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;