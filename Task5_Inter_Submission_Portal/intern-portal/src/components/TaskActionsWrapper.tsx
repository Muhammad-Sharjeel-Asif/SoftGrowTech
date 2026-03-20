"use client";

import { useRouter } from "next/navigation";
import TaskActions from "@/components/TaskActions";
import { TaskActionsProps } from "@/types";

export default function TaskActionsWrapper({
  taskId,
  currentStatus,
  currentFeedback,
}: Omit<TaskActionsProps, "onStatusChange">) {
  const router = useRouter();

  const handleStatusChange = () => {
    // Refresh the page to show updated status
    router.refresh();
  };

  return (
    <TaskActions
      taskId={taskId}
      currentStatus={currentStatus}
      currentFeedback={currentFeedback}
      onStatusChange={handleStatusChange}
    />
  );
}
