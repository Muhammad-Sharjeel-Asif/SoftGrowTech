import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold text-gray-900 transition-colors hover:text-gray-700"
          >
            Intern Portal
          </Link>
          
          <div className="flex items-center gap-8">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
                  >
                    Admin
                  </Link>
                )}
                <div className="h-5 w-px bg-gray-200" />
                <Link
                  href="/api/auth/signout"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
