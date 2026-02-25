"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LabTestPage() {
  const router = useRouter();
  const [testType, setTestType] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("/api/request", {
      method: "POST",
      body: JSON.stringify({
        type: "LAB_TEST",
        title: "Lab Test Request",
        testType,
        department: "Lab",
      }),
    });

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Book Lab Test</h1>

      <input
        placeholder="Test Type"
        value={testType}
        onChange={(e) => setTestType(e.target.value)}
        className="input"
      />

      <button className="btn">Submit</button>
    </form>
  );
}