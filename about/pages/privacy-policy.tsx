import Image from "next/image";
import Link from "next/link";
import { emailAddress } from "../constants";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-8 max-w-4xl mx-auto px-4">
      <header className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mt-2">
          <strong>Last Updated:</strong> June 28, 2025
        </p>
      </header>
      <main className="space-y-6 text-gray-700">
        <p>
          This Privacy Policy describes how Simon Mathewson (&quot;we&quot;,
          &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares
          information in connection with your use of the Dabase application,
          including the website (
          <a
            href="https://dabase.dev"
            className="text-blue-600 hover:underline"
            target="_blank"
          >
            https://dabase.dev
          </a>
          ) and related services (collectively, the &quot;Service&quot;). We are
          committed to protecting your privacy and handling your data in an open
          and transparent manner, in compliance with the General Data Protection
          Regulation (GDPR).
        </p>
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            1. Data Controller
          </h3>
          <p>The data controller responsible for your personal data is:</p>
          <address className="not-italic mt-2 bg-gray-100 p-4 rounded-md border border-gray-200">
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
            Email:{" "}
            <a
              href={`mailto:${emailAddress}`}
              className="text-blue-600 hover:underline"
            >
              {emailAddress}
            </a>
          </address>
        </section>
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            2. General Principles of Data Processing
          </h3>
          <p>
            Dabase is designed with a &quot;local-first&quot; approach. This
            means that core functions of the application run directly on your
            device, and we do not have access to your databases or the data
            within them. All database queries and data processing happen
            locally.
          </p>
        </section>
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            3. Data We Collect and Why
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                a) When You Visit Our Website
              </h4>
              <p>
                When you access our website{" "}
                <a
                  href="https://dabase.dev"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  https://dabase.dev
                </a>
                , your browser automatically transmits data to our server. This
                data is temporarily stored in a log file and may include:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                <li>Your IP address</li>
                <li>Date and time of access</li>
                <li>Name and URL of the retrieved file</li>
                <li>
                  The website from which the access was made (Referrer URL)
                </li>
                <li>
                  The browser you are using and, if applicable, the operating
                  system of your computer
                </li>
              </ul>
              <p className="mt-2">
                This data is processed for the legitimate interest of ensuring a
                smooth connection, guaranteeing the security and stability of
                the system, and for administrative purposes (Art. 6(1)(f) GDPR).
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                b) When You Create a Free Account
              </h4>
              <p>
                If you choose to create a free account to sync your database
                connections, we collect the following personal data:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                <li>
                  <strong>Email Address</strong>
                </li>
                <li>
                  <strong>Password (hashed)</strong>
                </li>
              </ul>
              <p className="mt-2">
                This data is processed for the purpose of providing the account
                and sync functionality, which constitutes the performance of a
                contract with you (Art. 6(1)(b) GDPR).
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                c) When You Save Connections to Your Account
              </h4>
              <p>
                If you use an account, you can save your database connection
                configurations to our cloud infrastructure. You have control
                over what is saved:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                <li>
                  You can choose whether to save passwords for your connections.
                </li>
                <li>
                  If you opt to save them, you can choose to store them in an{" "}
                  <strong>encrypted</strong> format.
                </li>
              </ul>
              <p className="mt-2">
                The legal basis for processing this data is the performance of
                the service you requested (Art. 6(1)(b) GDPR).
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                d) When You Use the AI Feature (Gemini API)
              </h4>
              <p>
                Dabase offers an optional integration with the Google Gemini
                API.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                <li>
                  To use this, you must provide{" "}
                  <strong>your own Gemini API key</strong>.
                </li>
                <li>
                  When used, your prompt and the{" "}
                  <strong>database schema definitions</strong> (table
                  structures, column names, types) are sent to the Google Gemini
                  API.
                </li>
                <li>
                  <strong>
                    We do not send any of your actual database content.
                  </strong>
                </li>
                <li>
                  The processing of this data is initiated by you. We do not act
                  as the data controller for the information you send to Google.
                  Your use of this feature is subject to Google&apos;s Privacy
                  Policy.
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                e) Google Analytics
              </h4>
              <p>
                We use Google Analytics to understand how users interact with
                our website, which helps us improve the Service.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                <li>
                  <strong>Legal Basis:</strong> We will only use Google
                  Analytics if you have given your explicit consent (Art.
                  6(1)(a) GDPR). You can withdraw your consent at any time
                  through the cookie settings on our website.
                </li>
                <li>
                  <strong>IP Anonymization:</strong> We have activated IP
                  anonymization, so your IP address is truncated by Google
                  within the European Union or other parties to the Agreement on
                  the European Economic Area before being transmitted to the
                  USA.
                </li>
                <li>
                  <strong>Data Processing Agreement:</strong> We have a data
                  processing agreement (DPA) with Google.
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            4. Data Storage and Location
          </h3>
          <p>
            All data related to your optional cloud account (email, hashed
            password, connection settings) is stored on servers provided by
            Amazon Web Services (AWS).
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
            <li>
              <strong>Location:</strong> The servers are located in{" "}
              <strong>Frankfurt am Main, Germany</strong>.
            </li>
            <li>
              This ensures that your data is stored within the European Union
              and benefits from the high data protection standards of the GDPR.
            </li>
          </ul>
        </section>
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            5. Your Rights Under GDPR
          </h3>
          <p>As a data subject, you have the following rights:</p>
          <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
            <li>
              <strong>Right of Access (Art. 15 GDPR):</strong> You can request
              information about your personal data that we process.
            </li>
            <li>
              <strong>Right to Rectification (Art. 16 GDPR):</strong> You can
              request the correction of inaccurate or incomplete personal data.
            </li>
            <li>
              <strong>
                Right to Erasure / &quot;Right to be Forgotten&quot; (Art. 17
                GDPR):
              </strong>{" "}
              You can request the deletion of your personal data stored by us.
            </li>
            <li>
              <strong>
                Right to Restriction of Processing (Art. 18 GDPR):
              </strong>{" "}
              You can request that we restrict the processing of your personal
              data.
            </li>
            <li>
              <strong>Right to Data Portability (Art. 20 GDPR):</strong> You can
              request to receive your personal data in a structured, commonly
              used, and machine-readable format.
            </li>
            <li>
              <strong>Right to Object (Art. 21 GDPR):</strong> You can object to
              the processing of your personal data based on legitimate
              interests.
            </li>
            <li>
              <strong>Right to Withdraw Consent (Art. 7(3) GDPR):</strong> You
              can withdraw your consent at any time (e.g., for Google
              Analytics).
            </li>
            <li>
              <strong>Right to Lodge a Complaint (Art. 77 GDPR):</strong> You
              have the right to lodge a complaint with a supervisory authority.
            </li>
          </ul>
          <p className="mt-2">
            To exercise your rights, please contact us using the details
            provided in Section 1.
          </p>
        </section>
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            6. Data Security
          </h3>
          <p>
            We use appropriate technical and organizational security measures to
            protect your data against accidental or intentional manipulation,
            loss, destruction, or unauthorized access by third parties. This
            includes encrypting sensitive data like passwords.
          </p>
        </section>
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            7. Changes to This Privacy Policy
          </h3>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or for other operational, legal, or
            regulatory reasons.
          </p>
        </section>
      </main>
      <Link
        href="/"
        className="flex gap-2 items-center font-bold bg-gray-500 text-white px-4 py-2 rounded-[32px] hover:bg-gray-600 transition-colors w-max mx-auto my-6"
      >
        <Image src="/arrow_back.svg" alt="" width={24} height={24} />
        Back to Home
      </Link>
    </div>
  );
};

export default PrivacyPolicy;
