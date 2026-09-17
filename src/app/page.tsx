import { App } from "@/components/App";
import { RECIPIENTS } from "@/data/recipients";

export default function Page() {
  return <App recipients={RECIPIENTS} />;
}
