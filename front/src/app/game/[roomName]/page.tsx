'use client';
import { useParams } from "next/navigation";

export default function GamePage() {
  const params = useParams();
  const roomName = params.roomName as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      {/* Header */}
      {roomName}
    </div>
  );
}
