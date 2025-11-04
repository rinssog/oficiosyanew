import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src={"/assets/logo.svg"}
      alt="Logo Oficios Ya"
      width={600}
      height={600}
    />
  );
}
