import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-25 px-6 text-center">
      <p className="text-7xl font-bold tracking-tight text-ink-900">404</p>
      <p className="mt-3 text-base text-ink-500">
        We couldn&apos;t find the page you were looking for.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
