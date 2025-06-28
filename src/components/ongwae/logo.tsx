import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <title>OngwaeGPT Logo</title>
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 2a10 10 0 1 1-10 10" />
      <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
      <path d="M12 18a6 6 0 0 0 6-6" />
      <path d="M12 6a6 6 0 0 0-6 6" />
    </svg>
  );
}
