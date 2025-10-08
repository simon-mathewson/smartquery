import { useIsMobile } from "@/hooks/useIsMobile";
import { NavItem } from "./NavItem";

export const Navigation: React.FC = () => {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <div className="flex items-center gap-6">
      <NavItem href="/" text="Home" />
      <NavItem href="/features" text="Features" />
      <NavItem href="/pricing" text="Pricing" />
      <NavItem href="/blog" text="Blog" />
    </div>
  );
};
