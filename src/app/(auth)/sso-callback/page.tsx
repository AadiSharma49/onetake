"use client";

import { useRouter } from "next/navigation";
import { HandleSSOCallback } from "@clerk/nextjs";

// Shared landing spot Clerk redirects back to after an OAuth provider
// (Google/Slack/Atlassian) finishes — completes the sign-in/up and redirects on.
export default function SSOCallbackPage() {
  const router = useRouter();

  return (
    <HandleSSOCallback
      navigateToApp={({ decorateUrl }) => {
        const url = decorateUrl("/");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      }}
      navigateToSignIn={() => router.push("/sign-in")}
      navigateToSignUp={() => router.push("/sign-up")}
    />
  );
}
