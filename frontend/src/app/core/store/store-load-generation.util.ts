export function createStoreLoadGeneration() {
  let generation = 0;
  return {
    current: () => generation,
    bump: () => {
      generation += 1;
    },
    isCurrent: (requestGeneration: number) => requestGeneration === generation,
  };
}
