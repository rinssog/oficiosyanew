import Image from "next/image";

export default function Logo({
  ...props
}: Omit<React.ComponentProps<typeof Image>, "src" | "alt">) {
  return <Image {...props} src={"/assets/logo.svg"} alt="Oficios Ya" />;
}
