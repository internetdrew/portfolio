import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface JobsCTAProps {
  accentColor: string;
}

const JobsCTA = ({ accentColor }: JobsCTAProps) => {
  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("andrew@internetdrew.com");
      toast.success(
        "Andrew's email address has been copied to your clipboard!",
        {
          position: "bottom-right",
        },
      );
    } catch (err) {
      console.error("Failed to copy email address: ", err);
      toast.error("Failed to copy email address. Please try again.", {
        position: "bottom-right",
      });
    }
  };

  return (
    <div className="text-center mb-16">
      🚀 Let's talk!{" "}
      <a
        href="https://cal.com/internetdrew/15-min-chat"
        style={{ color: accentColor }}
      >
        Book a time here
      </a>{" "}
      or email me at{" "}
      <span style={{ color: accentColor }} onClick={copyEmailToClipboard}>
        <Tooltip>
          <TooltipTrigger>andrew@internetdrew.com</TooltipTrigger>
          <TooltipContent>
            <p>Click to copy my email address to your clipboard.</p>
          </TooltipContent>
        </Tooltip>
      </span>
    </div>
  );
};

export default JobsCTA;
