import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../utils/validation";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values.username, values.password);
      toast.success(`Welcome back, ${user.full_name || user.username}`);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (e) {
      toast.error("Sign in failed", e.message || "Check your credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">
          Sign in
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">
          Enter your username and password to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Username"
          icon={User}
          placeholder="yourname"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" size="lg" loading={submitting} className="mt-2 w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-ink-900 underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
