import type { Metadata } from "next";
import { SubmitForm } from "./SubmitForm";

export const metadata: Metadata = {
  title: "Contribute",
};

export default function SubmitPage() {
  return <SubmitForm />;
}
