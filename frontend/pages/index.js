import { RWG_abi, RWG_contract_address } from "../constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem/utils";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";
import { FETCH_CREATED_GAME } from "../queries";
import { subgraphQuery } from "../utils";
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

  // State variable to show loading state when waiting for a transaction to go through
  const [loading, setLoading] = useState(false);

  // Keep a track of all the logs for a given game
  const [logs, setLogs] = useState([]);

  // game
  const [game, setGame] = useState([]);

  // entryFee is the ether required to enter a game
  const [entryFee, setEntryFee] = useState(0);
  // maxPlayers is the max number of players that can play the game
  const [maxPlayers, setMaxPlayers] = useState(0);

  // This is used to force react to re render the page when we want to
  // in our case we will use force update to show new logs
  // const forceUpdate = React.useReducer(() => ({}), {})[1];

  // Fetch the owner of the contract
  const owner = useContractRead({
    abi: RWG_abi,
    address: RWG_contract_address,
    functionName: "owner",
  });

  // Fetch the state of gameStarted
  const gameStarted = useContractRead({
    abi: RWG_abi,
    address: RWG_contract_address,
    functionName: "gameStarted",
  });

  // Function to make a createProposal transaction in the DAO
  async function startGame() {
    setLoading(true);
    try {
      const tx = await writeContract({
        address: RWG_contract_address,
        abi: RWG_abi,
        functionName: "startGame",
        args: [maxPlayers, entryFee],
      });
      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Function to make a createProposal transaction in the DAO
  async function joinGame() {
    setLoading(true);
    try {
      const _enteryFee = game.entryFee / 10 ** 18;
      const tx = await writeContract({
        address: RWG_contract_address,
        abi: RWG_abi,
        functionName: "joinGame",
        args: [],
        value: parseEther(_enteryFee.toString()),
      });
      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  const fetchLastGameData = async () => {
    setLoading(true);
    try {
      const _gameArray = await subgraphQuery(FETCH_CREATED_GAME());
      const _game = _gameArray.games[0];
      setGame(_game);
      let _logs = [];
      // Initialize the logs array and query the graph for current gameID
      if (gameStarted.data) {
        _logs = [`Game has started with ID: ${_game.id, "gamestarted", gameStarted.data}`];
        if (_game.players && _game.players.length >= 0) {
          _logs.push(
            `${_game.players.length} / ${_game.maxPlayers} already joined 👀 `
          );
          _game.players.forEach((player) => {
            _logs.push(`${player} joined 🏃‍♂️`);
          });
        }
      } else if (!gameStarted.data && _game.winner) {
        _logs = [
          `Last game has ended with ID: ${_game.id, "gamestarted", gameStarted.data}`,
          `Winner is: ${_game.winner} 🎉 `,
          `Waiting for host to start new game....`,
        ];
      }
      setLogs(_logs);
      /* forceUpdate(); */
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchLastGameData();
    /* setInterval(() => {
      fetchLastGameData();
    }, 2000); */
  }, [address, loading]);

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
        <div>
          {logs &&
            logs.map((log, index) => (
              <div className={styles.log} key={index}>
                {log}
              </div>
            ))}
        </div>
        <div>
          Entry fee: {game.entryFee} | {game.entryFee / 10 ** 18}{" "}
        </div>
        <div>
          {
            // Render when the game has started
            gameStarted.data ? (
              game.players && game.players.length === game.maxPlayers ? (
                <button className={styles.button} disabled>
                  Choosing winner...{gameStarted.data}
                </button>
              ) : (
                <div>
                  <button className={styles.button} onClick={() => joinGame()}>
                    Join Game 🚀
                  </button>
                </div>
              )
            ) : address &&
              address.toLowerCase() === owner.data.toLowerCase() ? (
              <div>
                <input
                  type="number"
                  className={styles.input}
                  onChange={(e) => {
                    // The user will enter the value in ether, we will need to convert
                    // it to WEI using parseEther
                    setEntryFee(
                      e.target.value >= 0
                        ? parseEther(e.target.value.toString())
                        : 0
                    );
                  }}
                  placeholder="Entry Fee (ETH)"
                />
                <input
                  type="number"
                  className={styles.input}
                  onChange={(e) => {
                    // The user will enter the value for maximum players that can join the game
                    setMaxPlayers(e.target.value ?? 0);
                  }}
                  placeholder="Max players"
                />
                <button className={styles.button} onClick={() => startGame()}>
                  Start Game 🚀
                </button>
              </div>
            ) : (
              " "
            )
          }
        </div>
      </div>
    </div>
  );
}
