import { Suspense } from "react";
import type { Metadata } from "next";
import { Directory } from "@/components/directory";
import { JsonLd } from "@/components/json-ld";
import { companies } from "@/data/companies";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stablecoin Company Directory",
  description:
    "Search and filter every company in the stablecoin economy — issuers, chains, infrastructure, payments, on/off-ramps, wallets, custody, DeFi, RWA and compliance.",
  alternates: { canonical: "/companies" },
  openGraph: {
    title: `Stablecoin Company Directory · ${SITE_NAME}`,
    description:
      "Search and filter every company in the stablecoin economy by category.",
    url: `${SITE_URL}/companies`,
  },
};

export default function CompaniesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Stablecoin Company Directory",
    url: `${SITE_URL}/companies`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    about: "Companies building the stablecoin economy",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: companies.length,
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Suspense>
        <Directory />
      </Suspense>
    </>
  );
}
