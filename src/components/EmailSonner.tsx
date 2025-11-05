import { toast } from "sonner";

const EmailSonner = () => {
  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("andrew@internetdrew.com");
      toast.success("Email address copied to clipboard!", {
        position: "top-right",
      });
    } catch (err) {
      console.error("Failed to copy email address: ", err);
      toast.error("Failed to copy email address. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <div
      onClick={copyEmailToClipboard}
      className="relative flex items-center text-muted-foreground gap-1 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="cursor-pointer size-5 transition-colors duration-150 group-hover:text-pink-600"
      >
        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      </svg>
    </div>
  );
};

export default EmailSonner;
