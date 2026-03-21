"use client";

import { useState } from "react";
import { TaskActionsProps } from "@/types";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";

export default function TaskActions({
  taskId,
  currentStatus,
  currentFeedback,
  onStatusChange,
}: TaskActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(currentFeedback || "");

  async function updateTask(status: string) {
    setLoading(true);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast.error(data.error || "Failed to update task");
      } else {
        showToast.success(`Task ${status.toLowerCase()}`);
        onStatusChange();
        setShowFeedback(false);
        setFeedback("");
      }
    } catch {
      showToast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  }

  function handleApprove() {
    updateTask("APPROVED");
  }

  function handleReject() {
    setShowFeedback(true);
  }

  function handleSubmitReject() {
    updateTask("REJECTED");
  }

  if (currentStatus === "APPROVED") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700">
        Approved
      </span>
    );
  }

  if (currentStatus === "REJECTED") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Rejected
      </span>
    );
  }

  return (
    <div className="space-y-3">
      {showFeedback ? (
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`feedback-${taskId}`}
              className="block text-xs font-medium text-gray-700"
            >
              Feedback
            </label>
            <textarea
              id={`feedback-${taskId}`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain why this task needs improvement..."
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleSubmitReject}
              disabled={loading || !feedback.trim()}
              isLoading={loading}
            >
              Confirm Reject
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowFeedback(false);
                setFeedback("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleApprove}
            disabled={loading}
            isLoading={loading}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReject}
            disabled={loading}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
