import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function Header() {
  return (
    <div className="static flex justify-between items-center gap-8 font-semibold px-8 py-6">
      <div className="flex justify-between items-center gap-8">
        <Link href={"/"}>Home</Link>
        <Link href={"/profile"}>Profile</Link>
      </div>
      <ConnectButton />
    </div>
  );
}
