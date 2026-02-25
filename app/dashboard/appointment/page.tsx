"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("/api/request", {
      method: "POST",
      body: JSON.stringify({
        type: "APPOINTMENT",
        title,
        department: "General",
        appointmentDate: date,
      }),
    });

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Book Appointment</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input"
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="input"
      />

      <button className="btn">Submit</button>
    </form>
  );
}