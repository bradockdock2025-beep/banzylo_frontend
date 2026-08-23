"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/api/newsletter";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "already" | "invalid" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      setStatus("invalid");
      return;
    }

    setStatus("loading");
    const result = await subscribeNewsletter(email);

    if (result.status === "subscribed") {
      setStatus("success");
      setEmail("");
    } else if (result.status === "already_subscribed") {
      setStatus("already");
    } else if (result.status === "invalid_email") {
      setStatus("invalid");
    } else {
      setStatus("error");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-4 flex">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder="Email"
          required
          className="w-full border border-white/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 border border-white bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "success" && (
        <p className="mt-2 text-xs text-white/70">Subscribed! Check your inbox.</p>
      )}
      {status === "already" && <p className="mt-2 text-xs text-white/70">You&apos;re already on the list.</p>}
      {status === "invalid" && <p className="mt-2 text-xs text-red-300">Please enter a valid email.</p>}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-300">Something went wrong — please try again.</p>
      )}
    </div>
  );
}
