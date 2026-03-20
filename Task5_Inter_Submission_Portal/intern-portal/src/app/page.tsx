import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600 text-5xl shadow-xl">
            📚
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Intern Portal
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Streamline your internship journey. Submit tasks, track progress, and
            get feedback from admins — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-xl bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border-2 border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="📝"
            title="Submit Tasks"
            description="Easily submit your work with descriptions and file attachments for review."
          />
          <FeatureCard
            icon="👀"
            title="Track Progress"
            description="Monitor the status of your submissions — Pending, Approved, or Rejected."
          />
          <FeatureCard
            icon="💬"
            title="Get Feedback"
            description="Receive detailed feedback from admins to improve your work."
          />
          <FeatureCard
            icon="📁"
            title="File Uploads"
            description="Attach documents, code, or any relevant files to your submissions."
          />
          <FeatureCard
            icon="🔒"
            title="Secure Access"
            description="Your data is protected with secure authentication and role-based access."
          />
          <FeatureCard
            icon="📊"
            title="Admin Dashboard"
            description="Admins can review all submissions and manage intern progress efficiently."
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
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
