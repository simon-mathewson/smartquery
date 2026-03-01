import Link from "next/link";
import { emailAddress } from "../constants";
import { ArrowBack } from "@mui/icons-material";

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <div className="py-8 container prose leading-normal">
        <header className="border-b border-gray-200 pb-4 mb-6">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Last Updated:</strong> March 1, 2026
          </p>
        </header>
        <main>
          <p>
            This Privacy Policy describes how Simon Mathewson (&quot;we&quot;,
            &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares
            information in connection with your use of the SmartQuery
            application, including the website (
            <a href="https://smartquery.dev" target="_blank">
              https://smartquery.dev
            </a>
            ) and related services (collectively, the &quot;Service&quot;). We
            are committed to protecting your privacy and handling your data in
            an open and transparent manner, in compliance with the General Data
            Protection Regulation (GDPR).
          </p>
          <section>
            <h3>1. Data Controller</h3>
            <p>The data controller responsible for your personal data is:</p>
            <address className="not-italic">
              Simon Mathewson
              <br />
              c/o Postflex #9085
              <br />
              Emsdettener Str. 10
              <br />
              48268 Greven
              <br />
              Germany
              <br />
              Email: <a href={`mailto:${emailAddress}`}>{emailAddress}</a>
            </address>
          </section>
          <section>
            <h3>2. General Principles of Data Processing</h3>
            <p>
              SmartQuery is 100% local. The application does not use user
              accounts or cloud sync—all connection data and credentials stay on
              your device. This privacy policy applies to your use of our
              website (about.smartquery.dev) and, where applicable, to data
              processed when you use AI features within the application (e.g.
              when schema information is sent to third-party AI providers). We
              do not collect or store your database connections or credentials.
            </p>
          </section>
          <section>
            <h3>3. Data We Collect, Purpose, and Legal Basis</h3>
            <div>
              <div>
                <h4>a) When You Visit Our Website</h4>
                <p>
                  When you access our website, your browser automatically
                  transmits server log data, including your IP address, browser
                  type, and time of access. This data is processed for the
                  legitimate interest of ensuring the security and stability of
                  our system (Art. 6(1)(f) GDPR).
                </p>
              </div>
              <div>
                <h4>b) When You Use AI Features in the Application</h4>
                <p>
                  When you use integrated AI features (e.g. powered by
                  third-party APIs such as OpenAI), your prompt and database
                  schema definitions (table structures, column names, types) may
                  be sent to the relevant provider. We <strong>never</strong>{" "}
                  send your actual database content or records. This processing
                  is necessary to provide the AI feature (Art. 6(1)(b) GDPR).
                </p>
              </div>
              <div>
                <h4>c) Analytics and Performance Monitoring</h4>
                <p>
                  We may use tools such as Google Analytics and AWS CloudWatch
                  RUM to understand website usage and monitor performance. These
                  tools are only activated if you provide your explicit prior
                  consent (Art. 6(1)(a) GDPR) via our cookie/consent banner. You
                  can withdraw your consent at any time. We have enabled IP
                  anonymization for Google Analytics where applicable.
                </p>
              </div>
            </div>
          </section>
          <section>
            <h3>4. Sharing Your Data & Third-Party Processors</h3>
            <p>
              We do not sell your personal data. We only share data with trusted
              third-party service providers (data processors) who help us
              operate our website and, where you use them, AI features—under
              strict data processing agreements where required.
            </p>
            <ul>
              <li>
                <strong>Hosting:</strong> Our website may be hosted on
                infrastructure such as Amazon Web Services (AWS), with servers
                in regions such as Frankfurt, Germany.
              </li>
              <li>
                <strong>AI providers:</strong> When you use AI features, data
                (prompt and schema only, as described above) may be sent to
                providers such as OpenAI, which may process it in the U.S.
                under appropriate legal safeguards.
              </li>
              <li>
                <strong>Analytics:</strong> With your consent, we may use
                services such as Google Analytics for website analytics.
              </li>
            </ul>
          </section>
          <section>
            <h3>5. Data Storage Location</h3>
            <p>
              We do not store user account data (there are no user accounts).
              Website and server log data may be processed and stored on
              infrastructure such as AWS in Germany. Your database connections
              and credentials remain only on your device.
            </p>
          </section>
          <section>
            <h3>6. Your Rights Under GDPR</h3>
            <p>
              As a data subject, you have the right to access, rectify, erase,
              restrict processing of, and port your personal data. You also have
              the right to object to processing, withdraw consent, and lodge a
              complaint with a supervisory authority. To exercise your rights,
              please contact us using the details provided in Section 1.
            </p>
          </section>
          <section>
            <h3>7. Data Security</h3>
            <p>
              We use appropriate technical and organizational security measures,
              such as encryption and access controls, to protect your data
              against accidental or intentional manipulation, loss, destruction,
              or unauthorized access.
            </p>
          </section>
          <section>
            <h3>8. Changes to This Privacy Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any significant changes by posting the new policy on
              our website or by other means of contact.
            </p>
          </section>
        </main>
      </div>
      <Link
        href="/"
        className="flex gap-2 items-center font-bold bg-gray-500 text-white px-4 py-2 rounded-[32px] hover:bg-gray-600 transition-colors w-max mx-auto my-6"
      >
        <ArrowBack className="!h-5 !w-5" />
        Back to Home
      </Link>
    </>
  );
};

export default PrivacyPolicy;
