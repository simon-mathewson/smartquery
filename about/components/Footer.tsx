import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <>
      <div className="text-xs text-gray-500 text-center pt-2">
        © 2025 Simon Mathewson
      </div>
      <div className="flex gap-3 pb-6 justify-center px-4 pt-2">
        <Link href="/imprint" className="text-xs text-gray-500 hover:underline">
          Imprint
        </Link>
        <Link
          href="/terms-of-use"
          className="text-xs text-gray-500 hover:underline"
        >
          Terms of Use
        </Link>
        <Link
          href="/privacy-policy"
          className="text-xs text-gray-500 hover:underline"
        >
          Privacy Policy
        </Link>
      </div>
    </>
  );
};
