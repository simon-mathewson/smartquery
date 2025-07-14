import Image from "next/image";
import Link from "next/link";

export const Logo: React.FC = () => {
  return (
    <Link href="/" className="mt-8 mb-4 h-10 !block relative">
      <Image src="/logo.svg" alt="" fill />
    </Link>
  );
};
