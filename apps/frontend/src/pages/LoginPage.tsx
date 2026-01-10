
import { AuthLayout } from '../components/layout/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
