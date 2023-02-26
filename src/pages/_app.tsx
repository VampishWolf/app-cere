import '@rainbow-me/rainbowkit/styles.css'
import '@/styles/globals.css'
import Header from '@/components/Header';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app'

import { configureChains, createClient, WagmiConfig } from "wagmi";
import { goerli, mainnet, polygon } from "wagmi/chains";
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

export default function App({ Component, pageProps }: AppProps) {
  
  const { chains, provider } = configureChains(
    [goerli, mainnet, polygon],
    [
      alchemyProvider({ apiKey: 'xYgmsystQOAvbxkasQbLhq8nexMDrnPK' }),
      publicProvider()
    ]
  );
  
  const { connectors } = getDefaultWallets({
    appName: 'Cere',
    chains
  });
  
  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider
  })

  return (
    <div className='main'>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <Header />
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
        
    </div>
  )
}
