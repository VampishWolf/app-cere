import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";


export default function Header() {
  
  return (
    <div className="flex justify-between items-center gap-8 font-semibold">
        <div className="flex justify-between items-center gap-8">
            <Link href={'/'}>Home</Link>
            <Link href={'/profile'}>Profile</Link>
            <Link href={'/list'}>List NFT</Link>
        </div>
        <ConnectButton />
    </div>
  );
}
