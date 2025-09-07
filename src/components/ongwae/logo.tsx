import { cn } from "@/lib/utils";
import { BrainCircuit } from "lucide-react";

export function Logo({ className, ...props }: React.ComponentProps<typeof BrainCircuit>) {
  return (
    <BrainCircuit
      className={cn("h-6 w-6 text-primary", className)}
      {...props}
    >
      <title>OngwaeGPT Logo</title>
    </BrainCircuit>
  );
}
