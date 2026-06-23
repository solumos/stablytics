import { Suspense } from "react";
import type { Metadata } from "next";
import { Directory } from "@/components/directory";

export const metadata: Metadata = {
  title: "Directory — Stablytics",
  description:
    "Browse and search every company in the stablecoin economy by category.",
};

export default function CompaniesPage() {
  return (
    <Suspense>
      <Directory />
    </Suspense>
  );
}
