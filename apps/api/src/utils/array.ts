/**
 * Similar to lodash's `partition` function.
 *
 * @param array The subject array.
 * @param predicate The function to use as predicate to partition the array.
 * @returns A tuple of two arrays: [satisfied, notSatisfied].
 *          If the predicate is a type predicate, the first array's elements
 *          will be narrowed to the specified type.
 */
export function partition<T, S extends T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => value is S,
): [S[], Exclude<T, S>[]];

export function partition<T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean,
): [T[], T[]];

export function partition<T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean,
): [T[], T[]] {
  const [satisfied, notSatisfied] = array.reduce(
    (acc, value, index, arr) => {
      const [satisfiedAcc, notSatisfiedAcc] = acc;
      if (predicate(value, index, arr)) {
        satisfiedAcc.push(value);
      } else {
        notSatisfiedAcc.push(value);
      }
      return acc;
    },
    [[] as T[], [] as T[]],
  );

  return [satisfied as T[], notSatisfied as T[]];
}
