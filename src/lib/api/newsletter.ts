import { apiFetch, ApiError } from "./http";

export type NewsletterSubscribeResult =
  | { status: "subscribed" }
  | { status: "already_subscribed" }
  | { status: "invalid_email" }
  | { status: "error" };

export async function subscribeNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  try {
    await apiFetch<{ message: string }>("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
      revalidate: false,
    });
    return { status: "subscribed" };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: "already_subscribed" };
      if (err.status === 400) return { status: "invalid_email" };
    }
    if (process.env.NODE_ENV !== "production") console.error("subscribeNewsletter failed:", err);
    return { status: "error" };
  }
}
