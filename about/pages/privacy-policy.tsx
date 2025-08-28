import Image from "next/image";
import Link from "next/link";
import { emailAddress } from "../constants";

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <div className="pt-8 max-w-4xl mx-auto px-4 prose leading-normal">
        <header className="border-b border-gray-200 pb-4 mb-6">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Last Updated:</strong> August 28, 2025
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
              SmartQuery is designed with a &quot;local-first&quot; approach.
              Core functions can run directly on your device without sending
              sensitive data to our servers. For enhanced functionality, such as
              account syncing, AI assistance, and cloud connectivity, we offer
              optional services that involve processing data on our secure
              infrastructure, as detailed in this policy.
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
                <h4>b) When You Create an Account</h4>
                <p>
                  To use features like connection syncing, SmartQuery Cloud, or
                  the AI assistant, you must create an account. We collect:
                </p>
                <ul>
                  <li>
                    <strong>Email Address</strong>
                  </li>
                  <li>
                    <strong>Password (hashed securely)</strong>
                  </li>
                </ul>
                <p>
                  This data is processed to provide you with the account
                  services you requested, based on the performance of a contract
                  with you (Art. 6(1)(b) GDPR).
                </p>
              </div>
              <div>
                <h4>c) When You Subscribe to SmartQuery Plus</h4>
                <p>
                  If you subscribe to SmartQuery Plus, we process payment
                  information through our payment provider, Stripe. We do not
                  directly collect or store your full credit card information.
                  We collect:
                </p>
                <ul>
                  <li>
                    <strong>Billing Information:</strong> Such as your name and
                    billing address, as required for invoicing.
                  </li>
                  <li>
                    <strong>Subscription Status:</strong> We receive data from
                    Stripe regarding the status of your subscription (e.g.,
                    active, canceled).
                  </li>
                </ul>
                <p>
                  This processing is necessary for the performance of the
                  subscription contract (Art. 6(1)(b) GDPR).
                </p>
              </div>
              <div>
                <h4>d) When You Save Connections to Your Account</h4>
                <p>
                  You can save database connection configurations to your
                  account. You can choose whether to save passwords and, if so,
                  to store them in an encrypted format. This data is processed
                  to perform the service you requested (Art. 6(1)(b) GDPR).
                </p>
              </div>
              <div>
                <h4>e) When You Use SmartQuery Cloud</h4>
                <p>
                  SmartQuery Cloud acts as a proxy, allowing you to connect to
                  your databases through our servers. When you use this feature,
                  your database queries and the resulting data pass through our
                  servers.
                </p>
                <ul>
                  <li>
                    <strong>Privacy Commitment:</strong> The content of your
                    database queries and the data returned from your database
                    are processed transiently to facilitate the connection. They
                    are <strong>never logged, stored, or inspected</strong> on
                    our servers.
                  </li>
                </ul>
                <p>
                  This transient processing is technically necessary to provide
                  the SmartQuery Cloud service, based on the performance of our
                  contract with you (Art. 6(1)(b) GDPR).
                </p>
              </div>
              <div>
                <h4>f) When You Use the AI Feature</h4>
                <p>
                  When you use the integrated AI assistant, we act as an
                  intermediary to send data to the Google Gemini API on your
                  behalf.
                </p>
                <ul>
                  <li>
                    <strong>Data Sent:</strong> We send your prompt and the{" "}
                    <strong>database schema definitions</strong> (table
                    structures, column names, types) to the Google Gemini API.
                  </li>
                  <li>
                    <strong>Important:</strong> We <strong>never</strong> send
                    any of your actual database content or records.
                  </li>
                </ul>
                <p>
                  This processing is necessary to provide the AI feature as part
                  of the Service, based on the performance of our contract with
                  you (Art. 6(1)(b) GDPR).
                </p>
              </div>
              <div>
                <h4>g) Analytics and Performance Monitoring</h4>
                <p>
                  We use Google Analytics and AWS CloudWatch RUM to understand
                  service usage and monitor performance. These tools are only
                  activated if you provide your explicit prior consent (Art.
                  6(1)(a) GDPR) via our cookie/consent banner. You can withdraw
                  your consent at any time. We have enabled IP anonymization for
                  Google Analytics.
                </p>
              </div>
            </div>
          </section>
          <section>
            <h3>4. Sharing Your Data & Third-Party Processors</h3>
            <p>
              We do not sell your personal data. We only share data with trusted
              third-party service providers (data processors) who help us
              operate our Service, under strict data processing agreements.
            </p>
            <ul>
              <li>
                <strong>Amazon Web Services (AWS):</strong> Our application and
                database are hosted on AWS servers located in Frankfurt,
                Germany.
              </li>
              <li>
                <strong>Stripe, Inc.:</strong> We use Stripe for payment
                processing for SmartQuery Plus subscriptions. Your payment data
                is sent directly to Stripe; we do not store your full payment
                card details. Stripe may process data in the U.S. under
                appropriate legal safeguards.
              </li>
              <li>
                <strong>Google LLC:</strong> We use Google&apos;s Gemini API for
                our AI feature and Google Analytics (with your consent). This
                involves sending data (as described above) to Google, which may
                process it in the U.S. under appropriate legal safeguards.
              </li>
            </ul>
          </section>
          <section>
            <h3>5. Data Storage Location</h3>
            <p>
              All of your primary account data (email, hashed password,
              connection settings) is stored on Amazon Web Services (AWS)
              servers located in <strong>Frankfurt am Main, Germany</strong>. By
              hosting within Germany, your data benefits from the high data
              protection standards of the GDPR and German law.
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
        <Image src="/arrow_back.svg" alt="" width={24} height={24} />
        Back to Home
      </Link>
    </>
  );
};

export default PrivacyPolicy;
