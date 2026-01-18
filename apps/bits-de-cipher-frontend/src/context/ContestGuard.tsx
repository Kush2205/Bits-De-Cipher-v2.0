import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const CONTEST_START_TIME = new Date("2026-01-16T19:00:00+05:30").getTime();

interface ContestGuardProps {
  children: ReactNode;
}

const ContestGuard = ({ children }: ContestGuardProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const currentTime = Date.now();
  const isBeforeContest = currentTime < CONTEST_START_TIME;

  useEffect(() => {
    if (user && isBeforeContest && location.pathname !== "/timer") {
      navigate("/timer");
    }
  }, [user, isBeforeContest, location.pathname, navigate]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isBeforeContest && location.pathname !== "/timer") {
    return <Navigate to="/timer" replace />;
  }

  return <>{children}</>;
};

export default ContestGuard;
