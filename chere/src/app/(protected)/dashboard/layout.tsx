import DashboardNav from "./_nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "var(--color-linen)", minHeight: "100vh" }}>
      <DashboardNav />
      <div style={{ paddingTop: "56px" }}>
        {children}
      </div>
    </div>
  );
}
