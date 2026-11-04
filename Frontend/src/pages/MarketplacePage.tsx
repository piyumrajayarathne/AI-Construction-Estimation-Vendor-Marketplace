import { ComingLater } from "../components/ComingLater";

export function MarketplacePage() {
  return (
    <ComingLater
      area="storefront"
      title="Vendor marketplace"
      description="The storefront is reserved for later work. Nothing here is live."
      items={[
        "Vendor catalogue browsing",
        "RFQ matching against verified masonry lines",
        "Quotation comparison",
      ]}
    />
  );
}

