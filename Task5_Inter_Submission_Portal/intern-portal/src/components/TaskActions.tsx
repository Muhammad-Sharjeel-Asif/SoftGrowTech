"use client";

import { useState } from "react";
import { TaskActionsProps } from "@/types";
import { Button } from "@/components/Button";

export default function TaskActions({
  taskId,
  currentStatus,
  currentFeedback,
  onStatusChange,
}: TaskActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(currentFeedback || "");

  async function updateTask(status: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update task");
      } else {
        onStatusChange();
        setShowFeedback(false);
        setFeedback("");
      }
    } catch {
      setError("Failed to update task");
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

  // Already approved
  if (currentStatus === "APPROVED") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
        role="status"
        aria-label="Task approved"
      >
        <span role="img" aria-hidden="true">
          ✓
        </span>
        Approved
      </span>
    );
  }

  // Already rejected
  if (currentStatus === "REJECTED") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
        role="status"
        aria-label="Task rejected"
      >
        <span role="img" aria-hidden="true">
          ✗
        </span>
        Rejected
      </span>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {showFeedback ? (
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`feedback-${taskId}`}
              className="block text-xs font-medium text-gray-700"
            >
              Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              id={`feedback-${taskId}`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain why this task needs improvement..."
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              aria-required="true"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleSubmitReject}
              disabled={loading || !feedback.trim()}
              isLoading={loading}
              aria-label="Confirm reject task"
            >
              Confirm Reject
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowFeedback(false);
                setFeedback("");
                setError("");
              }}
              disabled={loading}
              aria-label="Cancel rejection"
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
            aria-label="Approve task"
          >
            <span role="img" aria-hidden="true">
              ✓
            </span>
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReject}
            disabled={loading}
            aria-label="Reject task"
          >
            <span role="img" aria-hidden="true">
              ✗
            </span>
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
