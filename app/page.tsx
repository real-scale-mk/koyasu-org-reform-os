import { Workspace } from "@/components/workspace/Workspace";
import caseDemoData from "@/data/case-demo.json";
import { koyasuCaseSeedSchema } from "@/lib/koyasu/schema";

export default function Page() {
  const result = koyasuCaseSeedSchema.safeParse(caseDemoData);

  if (!result.success) {
    throw new Error(
      `case-demo.json: ${result.error.issues[0]?.message ?? "invalid seed"}`,
    );
  }

  return (
    <div className="h-screen">
      <Workspace seed={result.data} />
    </div>
  );
}
