import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <div className="flex gap-4 pb-6 justify-center">
      <div className="text-sm text-gray-500">© 2025 Simon Mathewson</div>
      <Link href="/imprint" className="text-sm text-gray-500 hover:underline">
        Imprint
      </Link>
      <Link
        href="/terms-of-use"
        className="text-sm text-gray-500 hover:underline"
      >
        Terms of Use
      </Link>
      <Link
        href="/privacy-policy"
        className="text-sm text-gray-500 hover:underline"
      >
        Privacy Policy
      </Link>
    </div>
  );
};
