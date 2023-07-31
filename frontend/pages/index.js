import { RWG_abi, RWG_contract_address } from "../constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { formatEther } from "viem/utils";
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

  // Checks if a game started or not
  /* const [gameStarted, setGameStarted] = useState(false); */
  // Players that joined the game
  const [players, setPlayers] = useState([]);
  // Winner of the game
  const [winner, setWinner] = useState();
  // Keep a track of all the logs for a given game
  const [logs, setLogs] = useState([]);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open

  // This is used to force react to re render the page when we want to
  // in our case we will use force update to show new logs
  const forceUpdate = React.useReducer(() => ({}), {})[1];

  // Fetch the balance of the RWG
  const RWGBalance = useBalance({
    address: RWG_contract_address,
  });

  // Fetch the state of gameStarted
  const gameStarted = useContractRead({
    abi: RWG_abi,
    address: RWG_contract_address,
    functionName: "gameStarted",
  });

  // Function to
  /* async function checkIfGameStarted() {
    setLoading(true);

    try {
      const _gamestarted = await readContract({
        address: RWG_contract_address,
        abi: RWG_abi,
        functionName: "gameStarted",
      });

      await waitForTransaction(tx);
      setGameStarted(_gamestarted.data);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  } */

  // Function to make a createProposal transaction in the DAO
  async function startGame(_maxPlayers, _entryFee) {
    setLoading(true);

    try {
      const tx = await writeContract({
        address: RWG_contract_address,
        abi: RWG_abi,
        functionName: "startGame",
        args: [_maxPlayers, _entryFee],
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Function to make a createProposal transaction in the DAO
  async function joinGame(_entryFee) {
    setLoading(true);

    try {
      const tx = await writeContract({
        address: RWG_contract_address,
        abi: RWG_abi,
        functionName: "joinGame",
        args: [_entryFee],
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Function to fetch a proposal by it's ID
  async function fetchProposalById(id) {
    try {
      const proposal = await readContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "proposals",
        args: [id],
      });

      const [nftTokenId, deadline, yayVotes, nayVotes, executed] = proposal;

      const parsedProposal = {
        proposalId: id,
        nftTokenId: nftTokenId.toString(),
        deadline: new Date(parseInt(deadline.toString()) * 1000),
        yayVotes: yayVotes.toString(),
        nayVotes: nayVotes.toString(),
        executed: Boolean(executed),
      };

      return parsedProposal;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  // Function to fetch all proposals in the DAO
  async function fetchAllProposals() {
    setLoading(true);
    try {
      const proposals = [];

      for (let i = 0; i < numOfProposalsInDAO.data; i++) {
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
      }

      setProposals(proposals);
      setLoading(false);

      return proposals;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  const fetchGameData = async () => {
    try {
      // read the gameStarted boolean from the contract

      const _gameArray = await subgraphQuery(FETCH_CREATED_GAME());
      const _game = _gameArray.games[0];
      let _logs = [];
      // Initialize the logs array and query the graph for current gameID
      if (gameStarted) {
        _logs = [`Game has started with ID: ${_game.id}`];
        if (_game.players && _game.players.length > 0) {
          _logs.push(
            `${_game.players.length} / ${_game.maxPlayers} already joined 👀 `
          );
          _game.players.forEach((player) => {
            _logs.push(`${player} joined 🏃‍♂️`);
          });
        }
        /* setEntryFee(BigNumber.from(_game.entryFee));
        setMaxPlayers(_game.maxPlayers); */
      } else if (!gameStarted && _game.winner) {
        _logs = [
          `Last game has ended with ID: ${_game.id}`,
          `Winner is: ${_game.winner} 🎉 `,
          `Waiting for host to start new game....`,
        ];

        setWinner(_game.winner);
      }
      setLogs(_logs);
      setPlayers(_game.players);
      forceUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchGameData();
    /*     setInterval(() => {
      fetchGameData();
    }, 2000); */
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
          <h3>{RWGBalance.data.value.toString()}</h3>
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
      </div>
    </div>
  );
}
