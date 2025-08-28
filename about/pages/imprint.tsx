import Image from "next/image";
import Link from "next/link";
import { emailAddress } from "../constants";

const Imprint: React.FC = () => {
  return (
    <>
      <div className="pt-8 max-w-4xl mx-auto px-4 prose leading-normal">
        <header className="border-b border-gray-200 pb-4 mb-6">
          <h1>Imprint</h1>
          <p className="text-sm text-gray-500 mt-2">
            Information provided according to Sec. 5 German Telemedia Act (TMG).
            <br />
            <strong>Last Updated:</strong> June 28, 2025
          </p>
        </header>
        <main>
          <section>
            <h3>Service Provider</h3>
            <p>
              Simon Mathewson
              <br />
              c/o Postflex #9085
              <br />
              Emsdettener Str. 10
              <br />
              48268 Greven
              <br />
              Germany
            </p>
            <p>
              This is a postal address provided by a mail forwarding service.
            </p>
          </section>
          <section>
            <h3>Contact</h3>
            <p>
              <a href={`mailto:${emailAddress}`}>{emailAddress}</a>
            </p>
          </section>
          <section>
            <h3>Responsible for Content</h3>
            <p>Simon Mathewson (Address as above)</p>
          </section>
          <section>
            <h3>Legal Status</h3>
            <p>
              This service is offered by Simon Mathewson as a sole proprietor.
            </p>
          </section>
          <section>
            <h3>Online Dispute Resolution</h3>
            <p>
              The European Commission provides a platform for online dispute
              resolution (OS). You can find it at{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              . We are not obliged or willing to participate in a dispute
              resolution procedure before a consumer arbitration board.
            </p>
          </section>
        </main>
      </div>
      <Link
        href="/"
        className="flex gap-2 items-center font-bold bg-gray-500 text-white px-4 py-2 rounded-[32px] hover:bg-gray-600 transition-colors w-max mx-auto my-6"
      >
        <Image src="/arrow_back.svg" alt="" width={24} height={24} />
        Back to Home
      </Link>
    </>
  );
};

export default Imprint;
