import Image from "next/image";
import Link from "next/link";
import { emailAddress } from "../constants";

const TermsOfUse: React.FC = () => {
  return (
    <>
      <div className="pt-8 max-w-4xl mx-auto px-4 prose leading-normal">
        <header className="border-b border-gray-200 pb-4 mb-6">
          <h1>Terms of Use</h1>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Last Updated:</strong> August 28, 2025
          </p>
        </header>
        <main>
          <p>
            Welcome to Dabase! These Terms of Use (&quot;Terms&quot;) govern
            your access to and use of the Dabase application, including the
            website (https://smartquery.dev), any associated desktop
            applications (&quot;Dabase Link&quot;), cloud services (&quot;Dabase
            Cloud&quot;), and all related services (collectively, the
            &quot;Service&quot;). The Service is provided by Simon Mathewson
            (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
          </p>
          <p>
            By accessing or using the Service, you agree to be bound by these
            Terms. If you do not agree to these Terms, you may not use the
            Service.
          </p>
          <section>
            <h3>1. Description of the Service</h3>
            <p>
              Dabase is a database viewer that allows users to connect to and
              interact with open-source databases such as PostgreSQL, MySQL, and
              SQLite. Users can connect to their databases through different
              methods, including a direct local connection via our desktop
              application (&quot;Dabase Link&quot;) or through our managed proxy
              service (&quot;Dabase Cloud&quot;).
            </p>
          </section>
          <section>
            <h3>2. Accounts</h3>
            <p>
              Using the core functionality of Dabase for direct database
              connections (e.g., via Dabase Link) does not require an account.
              However, to save and sync your connections, and to access the
              features provided under our Free Tier (such as AI Credits and
              Dabase Cloud queries), you must create a free account. Upon
              signing up, you are automatically enrolled in the Free Tier.
            </p>
            <ul>
              <li>
                <strong>Account Creation:</strong> You must provide a valid
                email address and create a password. You are responsible for
                maintaining the confidentiality of your account credentials and
                for all activities that occur under your account.
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
            <h3>3. Service Tiers and Subscriptions</h3>
            <p>
              Dabase is offered with service tiers for users with an account.
              Usage limits are applied on a monthly basis, resetting on your
              billing anchor date (the date you signed up or subscribed).
            </p>

            <h4>3.1. Free Tier</h4>
            <p>
              By default, creating an account enrolls you in the Free Tier. The
              monthly usage limits are as follows:
            </p>
            <ul>
              <li>
                <strong>AI Credits:</strong> 10,000
              </li>
              <li>
                <strong>Queries via Dabase Link:</strong> Unlimited
              </li>
              <li>
                <strong>Queries via Dabase Cloud:</strong>
                <ul>
                  <li>Concurrent Connections: 1</li>
                  <li>Concurrent Query Statements: 2</li>
                  <li>Total Query Duration: 15 minutes (900,000 ms)</li>
                  <li>Total Query Response Size: 250 MB</li>
                </ul>
              </li>
            </ul>

            <h4>3.2. Dabase Plus Subscription</h4>
            <p>
              For users requiring higher limits, we offer the Dabase Plus
              subscription for $8 per month. The monthly usage limits are as
              follows:
            </p>
            <ul>
              <li>
                <strong>AI Credits:</strong> 900,000
              </li>
              <li>
                <strong>Queries via Dabase Link:</strong> Unlimited
              </li>
              <li>
                <strong>Queries via Dabase Cloud:</strong>
                <ul>
                  <li>Concurrent Connections: 3</li>
                  <li>Concurrent Query Statements: 5</li>
                  <li>Total Query Duration: 2 hours (7,200,000 ms)</li>
                  <li>Total Query Response Size: 4 GB</li>
                </ul>
              </li>
            </ul>

            <h4>3.3. Billing and Cancellation</h4>
            <ul>
              <li>
                <strong>Payments:</strong> We use Stripe as our third-party
                payment processor. All payments are subject to Stripe&apos;s
                terms of service and privacy policy.
              </li>
              <li>
                <strong>Billing Cycle:</strong> Dabase Plus subscriptions are
                billed in advance on a monthly basis. Your billing cycle begins
                on the date you subscribe.
              </li>
              <li>
                <strong>Cancellation:</strong> You may cancel your Dabase Plus
                subscription at any time. Your subscription will remain active,
                and you will have access to paid features until the end of your
                current paid billing period.
              </li>
              <li>
                <strong>Refunds:</strong> Payments are non-refundable, and we do
                not provide refunds or credits for any partial subscription
                periods, except as required by law.
              </li>
            </ul>

            <h4>
              <strong>3.4. EU/EEA Consumer Right of Withdrawal</strong>
            </h4>
            <p>
              If you are a consumer based in the European Union or European
              Economic Area (EEA), you have a statutory right to withdraw from a
              contract for the purchase of services within 14 days without
              giving any reason. However, when purchasing a Dabase Plus
              subscription, which provides immediate access to a digital
              service, you will be asked to provide your prior express consent
              to the immediate execution of the contract. By providing this
              consent, you acknowledge that you will lose your right of
              withdrawal upon the complete fulfillment of the service contract.
            </p>
          </section>

          <section>
            <h3>4. Use of AI Features</h3>
            <p>
              Dabase integrates AI features powered by Google&apos;s Gemini
              models to assist with database queries. Your use of these features
              is governed by an &quot;AI Credits&quot; system, available only to
              users with an account.
            </p>
            <ul>
              <li>
                <strong>AI Credits:</strong> Your account is allocated a
                specific number of AI Credits based on your service tier, as
                outlined in Section 3. Credits are consumed for each request
                made to the AI model. For the Gemini 2.5 Flash model, credits
                are consumed at a rate of $0.03$ credits per input token and
                $0.25$ credits per output token.
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
                <strong>Responsibility:</strong> You are responsible for the
                queries you generate and execute using the AI feature. We are
                not liable for any incorrect or harmful queries produced by the
                AI.
              </li>
            </ul>
          </section>
          <section>
            <h3>5. User Responsibilities</h3>
            <p>
              You agree to use the Service in compliance with all applicable
              laws. You are solely responsible for the database connections you
              create and the data you access through the Service.
            </p>
          </section>
          <section>
            <h3>6. Intellectual Property Rights</h3>
            <p>
              The Service and its original content, features, and functionality,
              including but not limited to the Dabase application, the
              &quot;Dabase Link&quot; software, the website design, logos, and
              all underlying source code, are and will remain the exclusive
              property of Simon Mathewson. The Service is protected by
              copyright, trademark, and other laws of both Germany and foreign
              countries.
            </p>
            <p>
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
            <h3>7. Service Availability and Disclaimer of Warranties</h3>
            <p>
              Dabase is a new application and is provided in an early stage of
              development.
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
            <h3>8. Limitation of Liability</h3>
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
            <h3>9. Changes to the Terms</h3>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify you of any changes by posting the new Terms on our website.
              You are advised to review these Terms periodically for any
              changes. Your continued use of the Service after the changes have
              been implemented constitutes your acceptance of the new Terms.
            </p>
          </section>
          <section>
            <h3>10. Governing Law</h3>
            <p>
              These Terms shall be governed and construed in accordance with the
              laws of Germany, without regard to its conflict of law provisions.
            </p>
          </section>
          <section>
            <h3>11. Contact Us</h3>
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
        <Image src="/arrow_back.svg" alt="" width={24} height={24} />
        Back to Home
      </Link>
    </>
  );
};

export default TermsOfUse;
