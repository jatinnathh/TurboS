"use client";

import { useRouter } from "next/navigation";

export default function EmergencyPage() {
  const router = useRouter();

  const handleEmergency = async () => {
    await fetch("/api/request", {
      method: "POST",
      body: JSON.stringify({
        type: "EMERGENCY",
        title: "Emergency Assistance Required",
        department: "Emergency",
        priority: "HIGH",
      }),
    });

    router.push("/dashboard");
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-red-600">
        Emergency Request
      </h1>
      <button
        onClick={handleEmergency}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Confirm Emergency
      </button>
    </div>
  );
}