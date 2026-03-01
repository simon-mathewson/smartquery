import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import { emailAddress } from "../constants";

const TermsOfUse: React.FC = () => {
  return (
    <>
      <div className="py-8 container prose leading-normal">
        <header className="border-b border-gray-200 pb-4 mb-6">
          <h1>Terms of Use</h1>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Last Updated:</strong> March 1, 2026
          </p>
        </header>
        <main>
          <p>
            Welcome to SmartQuery! These Terms of Use (&quot;Terms&quot;) govern
            your access to and use of the SmartQuery application, including the
            website (https://smartquery.dev), native applications for iOS,
            macOS, Windows, and Debian-based distributions, and all related
            services (collectively, the &quot;Service&quot;). The Service is
            provided by Simon Mathewson (&quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;).
          </p>
          <p>
            By accessing or using the Service, you agree to be bound by these
            Terms. If you do not agree to these Terms, you may not use the
            Service.
          </p>
          <section>
            <h3>1. Description of the Service</h3>
            <p>
              SmartQuery is an open-source database viewer that allows users to
              connect to and interact with open-source databases such as
              PostgreSQL, MySQL, and SQLite. Everything runs 100% locally on
              your device—there are no user accounts, no cloud sync, and no
              subscriptions. Users connect to their databases natively through
              the applications for iOS, macOS, Windows, and Debian-based
              distributions. Web support is available for SQLite databases.
            </p>
          </section>
          <section>
            <h3>2. No Accounts or Subscriptions</h3>
            <p>
              SmartQuery does not require an account. All data—including
              connection details and credentials—is stored locally on your
              device. There are no subscriptions, no payments, and no Stripe or
              other payment processing. The software is free and open source.
            </p>
          </section>
          <section>
            <h3>3. Use of AI Features</h3>
            <p>
              SmartQuery may integrate AI features (e.g. powered by third-party
              APIs such as OpenAI) to assist with database queries. When you use
              such features, your prompt and the schema definitions (e.g., table
              names, column names, and data types) of your currently connected
              database may be sent to the relevant API to provide context.
            </p>
            <ul>
              <li>
                <strong>Important:</strong>{" "}
                <strong>
                  No database content or records are ever sent to AI APIs.
                </strong>{" "}
                The data is limited strictly to the structural schema.
              </li>
              <li>
                <strong>Responsibility:</strong> You are responsible for the
                queries you generate and execute using the AI feature. We are
                not liable for any incorrect or harmful queries produced by the
                AI.
              </li>
            </ul>
          </section>
          <section>
            <h3>4. User Responsibilities</h3>
            <p>
              You agree to use the Service in compliance with all applicable
              laws. You are solely responsible for the database connections you
              create and the data you access through the Service.
            </p>
          </section>
          <section>
            <h3>5. Intellectual Property Rights and Open Source</h3>
            <p>
              SmartQuery is open source. The application, including the native
              applications for iOS, macOS, Windows, and Debian-based
              distributions, the website design, logos, and underlying source
              code, may be subject to copyright and other intellectual property
              rights. The project is made available under its applicable open
              source license(s). You may use, modify, and distribute the
              software in accordance with those licenses. The SmartQuery name
              and branding remain the property of Simon Mathewson.
            </p>
          </section>
          <section>
            <h3>6. Service Availability and Disclaimer of Warranties</h3>
            <p>
              SmartQuery is a new application and is provided in an early stage
              of development.
            </p>
            <ul>
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
            <h3>7. Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by applicable law, Simon Mathewson
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or
              revenues, whether incurred directly or indirectly, or any loss of
              data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ol>
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
            <h3>8. Changes to the Terms</h3>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify you of any changes by posting the new Terms on our website.
              You are advised to review these Terms periodically for any
              changes. Your continued use of the Service after the changes have
              been implemented constitutes your acceptance of the new Terms.
            </p>
          </section>
          <section>
            <h3>9. Governing Law</h3>
            <p>
              These Terms shall be governed and construed in accordance with the
              laws of Germany, without regard to its conflict of law provisions.
            </p>
          </section>
          <section>
            <h3>10. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
              <a href={`mailto:${emailAddress}`}>
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
        <ArrowBack className="!h-6 !w-6" />
        Back to Home
      </Link>
    </>
  );
};

export default TermsOfUse;
