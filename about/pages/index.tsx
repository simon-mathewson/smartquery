import { DemoVideo } from "@/components/demoVideo/DemoVideo";
import { LaunchButton } from "@/components/launchButton/LaunchButton";
import { ChatVisual } from "@/components/visuals/Chat";
import { SchemaVisual } from "@/components/visuals/Schema";
import { WordCarousel } from "@/components/wordCarousel/WordCarousel";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  AutoAwesome,
  AutoFixHighOutlined,
  BarChartOutlined,
  BrushOutlined,
  EditOutlined,
  EnhancedEncryptionOutlined,
  FilterDramaOutlined,
  GitHub,
  LightbulbOutlined,
  LockOutline,
  PhoneIphoneOutlined,
  RoomOutlined,
  VpnKeyOutlined,
} from "@mui/icons-material";
import Image from "next/image";

export default function Home() {
  const isMobile = useIsMobile();

  const launchDemoSection = (
    <div className="bg-slate-50">
      <div className="flex flex-col items-center gap-6 sm:gap-8 py-8 sm:py-10 container">
        <LaunchButton demo />
        <div className="flex justify-center gap-3 sm:gap-5 items-end overflow-hidden">
          <Image
            src="/postgres.svg"
            alt="PostgreSQL"
            width={isMobile ? 80 : 100}
            height={isMobile ? 80 : 100}
          />
          <Image
            src="/mysql.svg"
            alt="MySQL"
            width={isMobile ? 52 : 65}
            height={isMobile ? 52 : 65}
            className="mb-[3px]"
          />
          <Image
            src="/sqlite.svg"
            alt="SQLite"
            width={isMobile ? 80 : 100}
            height={isMobile ? 80 : 100}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col items-center gap-10 sm:gap-12 py-10 sm:py-14 container">
        <h1 className="text-5xl sm:text-6xl flex gap-10 sm:gap-4 justify-center flex-col sm:flex-row">
          <WordCarousel
            align={isMobile ? "center" : "right"}
            words={["Query", "Visualize", "Modify", "Analyze", "Explore"]}
          />
          <div className="text-4xl sm:text-6xl max-w-[400px] text-center sm:text-left">
            your database using natural language
          </div>
        </h1>
        <ChatVisual />
      </div>
      {launchDemoSection}
      <div className="bg-slate-600 text-white">
        <div className="flex flex-col items-center gap-8 sm:gap-10 py-10 sm:py-14 container">
          <div className="max-w-xl gap-4 flex flex-col items-center">
            <AutoAwesome className="text-amber-400 !h-10 !w-10" />
            <h1 className="text-3xl sm:text-4xl text-center">
              Get tailor-made queries from a schema-aware AI assistant
            </h1>
            <p className="text-lg font-medium text-white/70 text-center">
              Copilot generates queries based on your database schema, including
              tables, columns, enums, constraints, and more. Rows are never
              passed to Copilot.
            </p>
          </div>
          <SchemaVisual />
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row items-center gap-10 sm:gap-12 py-10 sm:py-14 container">
        <Image
          className="rounded-2xl shadow-2xl border border-gray-300"
          src="/insert-update-delete.png"
          alt=""
          width={500}
          height={500}
        />
        <div className="gap-3 flex flex-col items-center sm:items-start">
          <EditOutlined className="text-blue-600 !h-10 !w-10" />
          <h1 className="text-3xl sm:text-4xl text-center sm:text-left">
            Insert, update, and delete with ease
          </h1>
          <p className="text-lg font-medium text-slate-600 text-center sm:text-left">
            Generate SQL to modify your data with an intuitive user experience.
            Includes inputs optimized for each data type.
          </p>
        </div>
      </div>
      <div className="bg-slate-50">
        <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-12 py-10 sm:py-14 container">
          <div className="gap-3 flex flex-col items-center sm:items-end">
            <BarChartOutlined className="text-blue-600 !h-10 !w-10" />
            <h1 className="text-3xl sm:text-4xl text-center sm:text-right">
              Bring your data to life with charts
            </h1>
            <p className="text-lg font-medium text-slate-600 text-center sm:text-right">
              Easily generate line, bar, and pie charts from your SQL results.
              Also, Copilot will automatically suggest appropriate charts for
              generated SQL.
            </p>
          </div>
          <Image
            className="rounded-2xl shadow-2xl border border-gray-300"
            src="/chart.png"
            alt=""
            width={500}
            height={500}
          />
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row items-center gap-10 sm:gap-12 py-10 sm:py-14 container">
        <Image
          className="rounded-2xl shadow-2xl border border-gray-300"
          src="/copilot.png"
          alt=""
          width={500}
          height={500}
        />
        <div className="gap-3 flex flex-col items-center sm:items-start">
          <AutoAwesome className="text-blue-600 !h-10 !w-10" />
          <h1 className="text-3xl sm:text-4xl text-center sm:text-left">
            Ask your database anything
          </h1>
          <p className="text-lg font-medium text-slate-600 text-center sm:text-left">
            Use natural language to get precise answers from your database. Get
            prompt suggestions and comfortably explore your data. Generate
            complex modifications tailored to your database schema.
          </p>
        </div>
      </div>
      <div className="bg-slate-50">
        <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-12 py-10 sm:py-14 container">
          <div className="gap-3 flex flex-col items-center sm:items-end">
            <AutoFixHighOutlined className="text-blue-600 !h-10 !w-10" />
            <h1 className="text-3xl sm:text-4xl text-center sm:text-right">
              Intellisense and inline completions
            </h1>
            <p className="text-lg font-medium text-slate-600 text-center sm:text-right">
              Write SQL in a fully featured, VS Code-like editor. Get real-time
              AI completions and intellisense based on your schema.
            </p>
          </div>
          <div className="w-full max-w-[500px] h-[300px] sm:h-[400px] relative shrink-0">
            <Image
              className="rounded-2xl shadow-2xl border border-gray-300 absolute left-0 top-0 -rotate-3"
              src="/intellisense.png"
              alt=""
              width={isMobile ? 300 : 400}
              height={isMobile ? 300 : 400}
            />
            <Image
              className="rounded-2xl shadow-2xl border border-gray-300 absolute right-0 bottom-0 rotate-1"
              src="/inline-completions.png"
              alt=""
              width={isMobile ? 300 : 400}
              height={isMobile ? 300 : 400}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row items-center gap-10 sm:gap-12 py-10 sm:py-14 container">
        <Image
          className="rounded-2xl shadow-2xl border border-gray-300"
          src="/light-dark.png"
          alt=""
          width={500}
          height={500}
        />
        <div className="gap-3 flex flex-col items-center sm:items-start">
          <BrushOutlined className="text-blue-600 !h-10 !w-10" />
          <h1 className="text-3xl sm:text-4xl text-center sm:text-left">
            Thoughtful, customizable design
          </h1>
          <p className="text-lg font-medium text-slate-600 text-center sm:text-left">
            SmartQuery has a strong focus on user experience and accessibility.
            Adjust the theme and primary color to your liking.
          </p>
        </div>
      </div>
      <div className="bg-slate-50">
        <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-12 py-10 sm:py-14 container">
          <div className="gap-3 flex flex-col items-center sm:items-end">
            <PhoneIphoneOutlined className="text-blue-600 !h-10 !w-10" />
            <h1 className="text-3xl sm:text-4xl text-center sm:text-right">
              Access your data from anywhere
            </h1>
            <p className="text-lg font-medium text-slate-600 text-center sm:text-right">
              SmartQuery works on any device with a browser, including desktops,
              tablets, and phones. It can also be installed and used like a
              regular app, including offline support.
            </p>
          </div>
          <Image src="/cross-platform.png" alt="" width={500} height={500} />
        </div>
      </div>
      <div className="bg-emerald-700">
        <div className="flex flex-col items-center gap-10 sm:gap-12 py-10 sm:py-14 container">
          <div className="gap-3 flex flex-col items-center max-w-xl">
            <LockOutline className="text-white !h-10 !w-10" />
            <h1 className="text-3xl sm:text-4xl text-center text-white">
              Security is our top priority
            </h1>
            <p className="text-lg font-medium text-white/70 text-center">
              When handling credentials and table data, there is no room for
              compromise. That&apos;s why we&apos;ve taken the following steps
              to make SmartQuery as secure as possible:
            </p>
          </div>
          <ul className="text-lg font-medium text-white/70 gap-y-4 gap-x-5 grid grid-cols-1 sm:grid-cols-2 items-start">
            {[
              {
                icon: RoomOutlined,
                title: "Local-first",
                description:
                  "Storing credentials, connecting to databases, saving queries, and more always works locally by default. Data is only sent to our servers if you enable optional cloud features.",
              },
              {
                icon: VpnKeyOutlined,
                title: "Encrypted credentials",
                description:
                  "When storing credentials in the cloud, you can encrypt them with your account password. This way, your credentials can only be read by you, even in the unlikely event of a data breach.",
              },
              {
                icon: EnhancedEncryptionOutlined,
                title: "Keychain support",
                description:
                  "Store your credentials in your browser's keychain to conveniently auto-fill them when connecting to databases. This guards your data using your operating system's authentication methods, like fingerprint or face ID.",
              },
              {
                icon: LightbulbOutlined,
                title: "Need-to-know basis",
                description:
                  "Your data is never stored or logged, even when connecting through our cloud. We always use the minimum amount of data necessary to make a feature work. For instance, row data is never sent to our AI as context, only schema information.",
              },
              {
                icon: FilterDramaOutlined,
                title: "Web best practices",
                description:
                  "Data is always transferred via HTTPS and protected from man-in-the-middle attacks. Our cloud uses state-of-the-art protection against DDoS attacks and other threats. The web app is protected against XSS and XSRF attacks and other web vulnerabilities.",
              },
              {
                icon: GitHub,
                title: "Published source code",
                description: (
                  <>
                    The source code for SmartQuery is publically accessible and
                    can be audited by anyone:{" "}
                    <a
                      href="https://github.com/simon-mathewson/smartquery"
                      className="text-white"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      github.com/simon-mathewson/smartquery
                    </a>
                  </>
                ),
              },
            ].map((item) => (
              <li key={item.title} className="flex items-center gap-4">
                <item.icon className="text-white !h-8 !w-8" />
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-white">
                    {item.title}
                  </h3>
                  <p className="font-medium text-white/70 text-sm max-w-lg">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center gap-8 sm:gap-10 py-10 sm:py-14 container">
        <DemoVideo />
      </div>
      {launchDemoSection}
    </>
  );
}
