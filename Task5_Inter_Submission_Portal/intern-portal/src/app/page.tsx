import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Intern Task Portal - Submit and review tasks",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Intern Task Portal
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Streamline your internship journey. Submit tasks, track progress, and
            get feedback from administrators.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Submit Tasks"
            description="Easily submit your work with descriptions and file attachments for review."
          />
          <FeatureCard
            title="Track Progress"
            description="Monitor the status of your submissions — Pending, Approved, or Rejected."
          />
          <FeatureCard
            title="Get Feedback"
            description="Receive detailed feedback from administrators to improve your work."
          />
          <FeatureCard
            title="File Uploads"
            description="Attach documents, code, or any relevant files to your submissions."
          />
          <FeatureCard
            title="Secure Access"
            description="Your data is protected with secure authentication and role-based access."
          />
          <FeatureCard
            title="Admin Dashboard"
            description="Administrators can review all submissions and manage intern progress."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Intern Portal. Built with Next.js & Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
