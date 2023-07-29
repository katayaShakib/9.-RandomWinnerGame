import { RWG_abi, RWG_contract_address } from "../constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useAccount, useBalance, useContractRead } from "wagmi";
import styles from "../styles/Home.module.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  // Check if the user's wallet is connected, and it's address using Wagmi's hooks.
  const { address, isConnected } = useAccount();
  // State variable to know if the component has been mounted yet or not
  const [isMounted, setIsMounted] = useState(false);

  // Fetch the balance of the RWG
  const RWGBalance = useBalance({
    address: RWG_contract_address,
  });

  // Fetch the owner of the contract
  const RWGOwner = useContractRead({
    abi: RWG_abi,
    address: RWG_contract_address,
    functionName: "owner",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected)
    return (
      <div className={inter.className}>
        <Head>
          <title>RandomWinnerGame</title>
          <meta name="description" content="RandomWinnerGame" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.connect}>
          <div className={styles.connectBtn}>
            <ConnectButton />
          </div>
          <h1 className={styles.title}>Welcome to Random Winner Game!</h1>
          <h2 className={styles.description}>
            It's a lottery game where a winner is chosen at random and wins the
            entire lottery pool
          </h2>
          <h3>
            {RWGBalance && RWGBalance.data
              ? RWGBalance.data.value.toString()
              : "no balance"}
          </h3>
          <h3>
            {RWGOwner && RWGOwner.data
              ? RWGOwner.data.toLowerCase()
              : "no owner"}
          </h3>
        </div>
      </div>
    );

  return (
    <div className={inter.className}>
      <Head>
        <title>RandomWinnerGame</title>
        <meta name="description" content="RandomWinnerGame" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <h1 className={styles.title}>Welcome to Random Winner Game!</h1>
        <h3>
          {console.log("balance", RWGOwner)}
          {console.log("balance.data", RWGOwner.data)}
          {RWGBalance && RWGBalance.data
            ? RWGBalance.data.value.toString()
            : "no balance"}
        </h3>
        <h3>
          {console.log("owner", RWGOwner)}
          {console.log("owner.data", RWGOwner.data)}
          {RWGOwner && RWGOwner.data ? RWGOwner.data.toLowerCase() : "no owner"}
        </h3>
      </div>
    </div>
  );
}
