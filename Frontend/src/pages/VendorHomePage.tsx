import { ComingLater } from "../components/ComingLater";
import { useAuth } from "../hooks/useAuth";

export function VendorHomePage() {
  const { user } = useAuth();

  return (
    <ComingLater
      area="vendor"
      title="Vendor workspace"
      description="Your vendor account can sign in. Catalogue, RFQ, and quotation tools are coming later and are not wired."
      items={[
        "Vendor catalog and capacity",
        "RFQ inbox and quotations",
        "Matching against estimated line items",
      ]}
      extra={
        <dl className="mt-5 space-y-2 border-t border-area-vendor/20 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Name</dt>
            <dd className="font-medium text-ink">{user?.full_name ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-ink">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium text-ink">{user?.role ?? "—"}</dd>
          </div>
        </dl>
      }
    />
  );
}
