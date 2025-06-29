import Image from "next/image";
import Link from "next/link";
import { emailAddress } from "../constants";

const TermsOfUse: React.FC = () => {
  return (
    <>
      <div className="pt-8 max-w-4xl mx-auto px-4">
        <header className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Last Updated:</strong> June 28, 2025
          </p>
        </header>
        <main className="space-y-6 text-gray-700">
          <p>
            Welcome to Dabase! These Terms of Use (&quot;Terms&quot;) govern
            your access to and use of the Dabase application, including the
            website (https://dabase.dev), any associated desktop applications
            (&quot;Dabase Link&quot;), and services (collectively, the
            &quot;Service&quot;). The Service is provided by Simon Mathewson
            (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
          </p>
          <p>
            By accessing or using the Service, you agree to be bound by these
            Terms. If you do not agree to these Terms, you may not use the
            Service.
          </p>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              1. Description of the Service
            </h3>
            <p>
              Dabase is a database viewer that allows users to connect to and
              interact with open-source databases such as PostgreSQL, MySQL, and
              SQLite. The core functionality of the Service runs locally on your
              device. For remote databases (e.g., PostgreSQL, MySQL), a
              background desktop application, &quot;Dabase Link,&quot; is
              required to facilitate the connection. All database queries and
              data handling occur on your local machine.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              2. Accounts
            </h3>
            <p>
              Using the core features of Dabase does not require an account.
              However, to save and sync your database connections across
              devices, you may choose to create a free account.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
              <li>
                <strong>Account Creation:</strong> You must provide a valid
                email address and create a password. You are responsible for
                maintaining the confidentiality of your account credentials.
              </li>
              <li>
                <strong>Connection Data:</strong> When you save a database
                connection to your account, you can choose whether to store
                associated passwords. If you choose to store them, you can store
                them encrypted or as plain text. You also have the option not to
                store passwords at all.
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              3. Use of AI Features (Gemini API)
            </h3>
            <p>
              Dabase provides an optional feature that integrates with the
              Google Gemini API to assist with database queries.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
              <li>
                <strong>API Key:</strong> To use this feature, you must provide
                your own Google Gemini API key in the application&apos;s
                settings.
              </li>
              <li>
                <strong>Data Sent to API:</strong> When you use the AI feature,
                your prompt and the schema definitions (e.g., table names,
                column names, and data types) of your currently connected
                database are sent to the Gemini API to provide context.
              </li>
              <li>
                <strong>Important:</strong>{" "}
                <strong>
                  No database content or records are ever sent to the Gemini
                  API.
                </strong>{" "}
                The data is limited strictly to the structural schema.
              </li>
              <li>
                <strong>Responsibility:</strong> Your use of the Gemini API is
                subject to Google&apos;s own terms of service and privacy
                policies. You are responsible for all activity associated with
                your API key.
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              4. User Responsibilities
            </h3>
            <p>
              You agree to use the Service in compliance with all applicable
              laws. You are solely responsible for the database connections you
              create and the data you access through the Service.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              5. Intellectual Property Rights
            </h3>
            <p>
              The Service and its original content, features, and functionality,
              including but not limited to the Dabase application, the
              &quot;Dabase Link&quot; software, the website design, logos, and
              all underlying source code, are and will remain the exclusive
              property of Simon Mathewson. The Service is protected by
              copyright, trademark, and other laws of both Germany and foreign
              countries.
            </p>
            <p className="mt-2">
              You are granted a limited, non-exclusive, non-transferable,
              revocable license to use the Service strictly in accordance with
              these Terms. You agree not to copy, modify, create derivative
              works of, publicly display, publicly perform, republish, or
              distribute the Service or any part thereof. You further agree not
              to reverse-engineer, decompile, or otherwise attempt to discover
              the source code of the Dabase application or its related software.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              6. Service Availability and Disclaimer of Warranties
            </h3>
            <p>
              Dabase is a new application and is provided in an early stage of
              development.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
              <li>
                The Service is provided on an &quot;AS IS&quot; and &quot;AS
                AVAILABLE&quot; basis.
              </li>
              <li>
                We do not warrant that the Service will be uninterrupted,
                error-free, or completely secure. You acknowledge that the
                application may contain bugs, errors, and other problems.
              </li>
              <li>
                To the maximum extent permitted by law, we disclaim all
                warranties, whether express or implied, including but not
                limited to the implied warranties of merchantability, fitness
                for a particular purpose, and non-infringement.
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              7. Limitation of Liability
            </h3>
            <p>
              To the fullest extent permitted by applicable law, Simon Mathewson
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or
              revenues, whether incurred directly or indirectly, or any loss of
              data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ol className="list-alpha list-inside space-y-2 pl-4 mt-2">
              <li>
                your access to or use of or inability to access or use the
                Service;
              </li>
              <li>
                any unauthorized access to or use of our servers and/or any
                personal information stored therein;
              </li>
              <li>
                any bugs, viruses, trojan horses, or the like that may be
                transmitted to or through our service by any third party.
              </li>
            </ol>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              8. Changes to the Terms
            </h3>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify you of any changes by posting the new Terms on our website.
              You are advised to review these Terms periodically for any
              changes. Your continued use of the Service after the changes have
              been implemented constitutes your acceptance of the new Terms.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              9. Governing Law
            </h3>
            <p>
              These Terms shall be governed and construed in accordance with the
              laws of Germany, without regard to its conflict of law provisions.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              10. Contact Us
            </h3>
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
              <a
                href={`mailto:${emailAddress}`}
                className="text-blue-600 hover:underline"
              >
                <strong>{emailAddress}</strong>
              </a>
              .
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

export default TermsOfUse;
