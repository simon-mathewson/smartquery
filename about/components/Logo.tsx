import Image from "next/image";
import Link from "next/link";

export const Logo: React.FC = () => {
  return (
    <Link href="/" className="flex gap-5 justify-center items-center py-6">
      <Image src="/logo.svg" alt="" width={48} height={48} />
      <h1 className="text-5xl font-[700] text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-green-500 from-20% to-80%">
        Dabase
      </h1>
    </Link>
  );
};
