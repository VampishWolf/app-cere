import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createClient } from "wagmi";
import { goerli, mainnet, polygon } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

const alchemyAPIKey: string = 'xYgmsystQOAvbxkasQbLhq8nexMDrnPK';
const appMode: string = process.env.NEXT_PUBLIC_ENV_MODE!;
const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, polygon, goerli],
  [alchemyProvider({ apiKey: alchemyAPIKey }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Cere",
  chains,
});

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export { chains };
