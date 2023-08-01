export function FETCH_CREATED_GAME() {
  return `query {
          games(orderBy:id, orderDirection:desc, first: 10) {
              id
              maxPlayers
              entryFee
              players
              winner
          }
      }`;
}
