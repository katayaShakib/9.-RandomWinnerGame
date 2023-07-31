import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
/* import { polygonMumbai } from "wagmi/chains"; */
import { publicProvider } from "wagmi/providers/public";

export const polygonMumbai = {
  id: 80001,
  name: "Matic Mumbai",
  network: "Matic Mumbai",
  nativeCurrency: {
    decimals: 18,
    name: "Mumbai",
    symbol: "MATIC",
  },
  rpcUrls: {
    public: { http: ["https://rpc-mumbai.maticvigil.com/"] },
    default: { http: ["https://rpc-mumbai.maticvigil.com/"] },
  },
  blockExplorers: {
    etherscan: {
      name: "mumbai.polygonscan",
      url: "https://mumbai.polygonscan.com/",
    },
    default: {
      name: "mumbai.polygonscan",
      url: "https://mumbai.polygonscan.com/",
    },
  },
};

const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "RandomWinnerGame",
  projectId: "cc792e09034ec0d1882da2fd0101e1d2",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
