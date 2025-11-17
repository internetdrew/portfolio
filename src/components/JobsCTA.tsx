import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const JobsCTA = () => {
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
        className="text-pink-600"
      >
        Book a time here
      </a>{" "}
      or email me at{" "}
      <span className="text-pink-600" onClick={copyEmailToClipboard}>
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
