import { PageHeader } from "@/components/shell/merchant-shell";
import { OriginationFlow } from "@/components/origination/origination-flow";

export const metadata = { title: "New contract · vivo Hire Purchase" };

export default function OriginationPage() {
  return (
    <>
      <PageHeader
        title="New hire purchase contract"
        description="Five steps from handset to activation. The draft is kept until the deposit clears."
      />
      <OriginationFlow />
    </>
  );
}
