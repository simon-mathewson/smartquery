import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center gap-6 pt-4">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-[600] text-gray-700 leading-snug text-center">
            The fun, browser-based, AI-powered database UI.
          </h2>
          <a
            href="https://smartquery.dev"
            className="flex gap-2 items-center font-bold bg-blue-500 text-white px-4 py-2 rounded-[32px]"
          >
            <Image src="/arrow_forward.svg" alt="" width={24} height={24} />
            Launch Dabase
          </a>
        </div>
        <div className="flex justify-center gap-5 items-end">
          <Image
            src="/postgres.svg"
            alt="PostgreSQL"
            width={100}
            height={100}
          />
          <Image
            src="/mysql.svg"
            alt="MySQL"
            width={65}
            height={65}
            className="mb-[3px]"
          />
          <Image src="/sqlite.svg" alt="SQLite" width={100} height={100} />
        </div>
        <Image
          src="/screen.png"
          alt=""
          width={800}
          height={800}
          className="-mt-4"
        />
      </div>
    </>
  );
}
