import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";
import Header from "@/components/Header";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";

import { WagmiConfig } from "wagmi";
import { chains, client } from "../utils/wagmi";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="main">
      <WagmiConfig client={client}>
        <RainbowKitProvider chains={chains}>
          <Header />
          <div className="">
            <Component {...pageProps} />
          </div>
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
  );
}
