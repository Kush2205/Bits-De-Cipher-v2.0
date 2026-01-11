import { AuthLayout } from "../components/layout/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

     
      <AuthLayout>
        <LoginForm />
      </AuthLayout>

      <div className="hidden md:block relative">
        <img
          src="/poster.jpg"
          alt="Login visual"
          className="absolute inset-0 w-full h-full object-cover"
        />

        
        <div className="absolute inset-0 bg-black/60" />

       
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.35),transparent_60%)]" />
      </div>

    </div>
  );
};

export default LoginPage;
