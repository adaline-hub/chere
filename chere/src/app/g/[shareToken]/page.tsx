import type { Metadata } from "next";
import { mockCreation } from "@/lib/mock/tribute-data";
import TributeExperience from "./_experience";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `A gift for you, ${mockCreation.recipientName}`,
    description: "Someone made something beautiful for you.",
    openGraph: {
      title: `A gift for you, ${mockCreation.recipientName}`,
      description: "Someone made something beautiful for you.",
    },
  };
}

export default function TributePage() {
  return (
    <div className="tribute-page">
      <TributeExperience creation={mockCreation} />
    </div>
  );
}
