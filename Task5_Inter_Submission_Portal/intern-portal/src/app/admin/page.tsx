import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import StatCard from "@/components/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import type { User, Task, TaskWithUser, AdminStats, UserRole, TaskStatus, UserWithTaskCount } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage users and review submissions",
  robots: {
    index: false,
    follow: false,
  },
};

// Type for the Prisma query result with task count
type DbUserWithTaskCount = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  _count: {
    tasks: number;
  };
};

// Type for the Prisma task query result with user relation
type DbTaskWithUser = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Session safety check
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard?error=unauthorized");
  }

  const usersFromDb = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map to UserWithTaskCount type
  const users: UserWithTaskCount[] = usersFromDb.map((u: DbUserWithTaskCount) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as UserRole,
    createdAt: u.createdAt,
    _count: {
      tasks: u._count.tasks,
    },
  }));

  // Parallel queries for better performance
  const [tasksFromDb, totalTasks, pendingTasks, approvedTasks] = await Promise.all([
    prisma.task.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.task.count(),
    prisma.task.count({ where: { status: "PENDING" } }),
    prisma.task.count({ where: { status: "APPROVED" } }),
  ]);

  // Map to TaskWithUser type (minimal user info for recent tasks list)
  const tasks: TaskWithUser[] = tasksFromDb.map((t: DbTaskWithUser) => ({
    id: t.id,
    title: t.title,
    description: null,
    fileUrl: null,
    status: t.status as TaskStatus,
    feedback: null,
    userId: "", // Not available in this query
    createdAt: t.createdAt,
    user: {
      id: "", // Not available in this query
      name: t.user.name,
      email: t.user.email,
    },
  }));

  const stats: AdminStats = {
    totalUsers: users.length,
    totalTasks,
    pendingTasks,
    approvedTasks,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage users and review submissions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.name || "Admin"}
                </p>
                <div className="mt-1">
                  <StatusBadge status="ADMIN" />
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={stats.totalUsers} color="blue" />
          <StatCard label="Total Tasks" value={stats.totalTasks} color="purple" />
          <StatCard label="Pending Review" value={stats.pendingTasks} color="yellow" />
          <StatCard label="Approved" value={stats.approvedTasks} color="green" />
        </div>

        {/* Section Separator */}
        <div className="mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* Recent Tasks */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-gray-500">No submissions yet</p>
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
                          Status
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
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {task.user.name || task.user.email}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <StatusBadge status={task.status} />
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
        </div>

        {/* All Users */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={user.role} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user._count.tasks}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
