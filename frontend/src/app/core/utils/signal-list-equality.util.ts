export function areSortedIdListsEqual(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((id, index) => id === right[index]);
}

/** Shallow row compare for paginated table inputs — avoids mat-table churn when store patches new array refs. */
export function areRowsEqualByIdAndUpdatedAt<T extends { id: string; updatedAt: string }>(
  left: readonly T[],
  right: readonly T[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((row, index) => {
    const next = right[index];
    return !!next && row.id === next.id && row.updatedAt === next.updatedAt;
  });
}
