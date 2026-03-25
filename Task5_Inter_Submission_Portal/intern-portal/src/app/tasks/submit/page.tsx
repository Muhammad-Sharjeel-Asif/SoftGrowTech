"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { showToast } from "@/lib/toast";

interface FormErrors {
  title?: string;
  description?: string;
  file?: string;
}

export default function SubmitTaskPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (description && description.length > 5000) {
      newErrors.description = "Description must be less than 5000 characters";
    }

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        newErrors.file = "File size must be less than 10MB";
      }
      if (file.name && !ALLOWED_TYPES.some(type => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const typeMap: Record<string, string[]> = {
          "application/pdf": ["pdf"],
          "image/jpeg": ["jpg", "jpeg"],
          "image/png": ["png"],
          "image/gif": ["gif"],
          "application/zip": ["zip"],
          "application/msword": ["doc"],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
        };
        return typeMap[type]?.includes(ext || "");
      })) {
        newErrors.file = "File type not allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function uploadFile(fileToUpload: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", fileToUpload);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to upload file");
    }

    return data.data?.url || data.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploadProgress("");
    setErrors({});

    try {
      let fileUrl: string | null = null;

      if (file) {
        setUploadProgress("Uploading file...");
        fileUrl = await uploadFile(file);
      }

      setUploadProgress("Submitting task...");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          fileUrl: fileUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast.error(data.message || data.error || "Failed to submit task");
        if (data.details?.errors) {
          setErrors(data.details.errors as FormErrors);
        }
      } else {
        showToast.success("Task submitted successfully!");
        router.push("/dashboard");
      }
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ ...prev, file: "File size must be less than 10MB" }));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, file: undefined }));
    }
  }

  function handleClearFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader
            title="Submit Task"
            description="Fill in the details below to submit your task for review"
          />

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {uploadProgress && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-4 w-4 animate-spin text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="text-sm text-blue-800">{uploadProgress}</p>
                  </div>
                </div>
              )}

              <Input
                id="title"
                name="title"
                type="text"
                label="Title"
                placeholder="e.g., Complete user authentication module"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                disabled={loading}
                required
              />

              <Textarea
                id="description"
                name="description"
                label="Description"
                placeholder="Describe what you've completed, any challenges faced, or additional notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
                disabled={loading}
                rows={5}
              />

              <div>
                <label
                  htmlFor="file"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Attachment <span className="text-gray-400">(Optional)</span>
                </label>
                
                <div className="mt-1">
                  <input
                    id="file"
                    name="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.zip,.doc,.docx"
                    disabled={loading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed"
                  />
                  
                  <p className="mt-1.5 text-xs text-gray-500">
                    Allowed: PDF, Images (JPEG, PNG, GIF), ZIP, DOC, DOCX. Max size: 10MB
                  </p>

                  {errors.file && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.file}</p>
                  )}

                  {file && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                >
                  {loading ? "Submitting..." : "Submit Task"}
                </Button>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
