# Secure on-chain randomness using Chainlink VRFs

A RandomWinnerGame contract is built for this purpose and deployed to Mumbai Testnet.

The contract can have one game at a time, that can be started by the owner of the contract.

Each game has a max number of players and an entry fee.

After the max number of players join the game, one winner is chosen at random via Chainlinks' VRFConsumerBase and VRFCoordinator contracts.

The winner gets maxplayers*entryfee amount of MATIC.

```diff
@@ A frontend is planned to be developed in couple of weeks @@
```

For now, please 

1. Find the contract on https://mumbai.polygonscan.com/address/0x7C80B5DD4c5d988D4B7fbe71c9895C8e192d1015
2. Go to Contract tab and then Write Contract.
3. Connect your wallet to Polygonscan "Connect to Web3".
4. Call the joinGame function. You will notice that Polygonscan expects you to write down a payableAmount (MATIC).
5. Enter `0.001` and click Write.

To finish the game that I have already started for you!
