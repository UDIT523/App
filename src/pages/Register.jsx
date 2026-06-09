import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, AtSign } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { registerSchema } from "../utils/validation";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const { register: registerUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerUser({
        username: values.username,
        password: values.password,
        fullName: values.fullName,
      });
      toast.success(
  "Request submitted",
  "Your account is awaiting administrator approval."
);

navigate("/login", { replace: true });
    } catch (e) {
      toast.error("Registration failed", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">
          Create account
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">
          Pick a username and password — no email required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Full name"
          icon={User}
          placeholder="Jane Doe"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label="Username"
          icon={AtSign}
          placeholder="janedoe"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="At least 4 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          icon={Lock}
          placeholder="Re-enter password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <Button type="submit" size="lg" loading={submitting} className="mt-2 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-ink-900 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
