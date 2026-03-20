import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import TaskActionsWrapper from "@/components/TaskActionsWrapper";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { Task, DashboardStats } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View and manage your task submissions",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);

  // Session safety check
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { error } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.role === "ADMIN";
  let allTasks = user.tasks;

  if (isAdmin) {
    allTasks = await prisma.task.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }) as any; // Type assertion for admin tasks with user relation
  }

  // Database-level aggregation for better performance
  const statsData = await prisma.task.groupBy({
    by: ["status"],
    where: { userId: user.id },
    _count: true,
  });

  const stats = {
    total: user.tasks.length,
    pending: statsData.find((s) => s.status === "PENDING")?._count || 0,
    approved: statsData.find((s) => s.status === "APPROVED")?._count || 0,
    rejected: statsData.find((s) => s.status === "REJECTED")?._count || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.name || user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  <StatusBadge status={user.role} />
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error === "unauthorized" && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm text-red-800">
                You don&apos;t have permission to access that page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid - For Interns */}
        {!isAdmin && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Tasks" value={stats.total} icon="📋" color="blue" />
            <StatCard label="Pending" value={stats.pending} icon="⏳" color="yellow" />
            <StatCard label="Approved" value={stats.approved} icon="✓" color="green" />
            <StatCard label="Rejected" value={stats.rejected} icon="✗" color="red" />
          </div>
        )}

        {/* Main Content */}
        {isAdmin ? (
          <AdminDashboard tasks={allTasks} />
        ) : (
          <InternDashboard tasks={user.tasks} />
        )}
      </div>
    </div>
  );
}

function InternDashboard({ tasks }: { tasks: Task[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>My Tasks</CardTitle>
        <a
          href="/tasks/submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span aria-hidden="true">+</span> Submit Task
        </a>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-6xl">📝</div>
            <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Submit your first task to get started!
            </p>
            <a
              href="/tasks/submit"
              className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Submit Task
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Attachment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {task.fileUrl ? (
                        <a
                          href={task.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>📎</span> View
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.feedback ? (
                        <span className="italic">{task.feedback}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminDashboard({ tasks }: { tasks: {
    id: string;
    title: string;
    description: string | null;
    fileUrl: string | null;
    status: string;
    feedback: string | null;
    userId: string;
    createdAt: Date;
    user?: {
      id: string;
      name: string | null;
      email: string;
    };
  }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Submissions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-6xl">📊</div>
            <h3 className="text-lg font-medium text-gray-900">No submissions yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Tasks submitted by interns will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Attachment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="text-gray-900">{task.user?.name || "N/A"}</p>
                        <p className="text-xs text-gray-500">{task.user?.email || ""}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {task.fileUrl ? (
                        <a
                          href={task.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>📎</span> View
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <TaskActionsWrapper
                        taskId={task.id}
                        currentStatus={task.status}
                        currentFeedback={task.feedback}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.feedback ? (
                        <span className="italic max-w-xs truncate block">{task.feedback}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
