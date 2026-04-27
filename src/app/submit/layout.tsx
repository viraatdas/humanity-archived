"use client";

import { useEffect } from "react";

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add("submit-page");
    return () => {
      document.body.classList.remove("submit-page");
    };
  }, []);
  return <>{children}</>;
}
