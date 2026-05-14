import AppHeader from "@/components/shared/AppHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "var(--color-linen)", minHeight: "100vh" }}>
      <AppHeader />
      <div style={{ paddingTop: "56px" }}>
        {children}
      </div>
    </div>
  );
}
