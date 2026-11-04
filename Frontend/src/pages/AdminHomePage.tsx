import { ComingLater } from "../components/ComingLater";

export function AdminHomePage() {
  return (
    <ComingLater
      area="admin"
      title="Administration"
      description="Admin accounts cannot be self-registered. This console is a placeholder."
      items={[
        "User and role management",
        "Rate-library curation",
        "Human verification queues",
      ]}
    />
  );
}

