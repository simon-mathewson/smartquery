import Link from "next/link";

export type NavItemProps = {
  href: string;
  text: string;
};

export const NavItem: React.FC<NavItemProps> = (props) => {
  const { href, text } = props;

  return (
    <Link className="text-sm font-semibold text-gray-800" href={href}>
      {text}
    </Link>
  );
};
