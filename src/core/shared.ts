
export function argsChanged(oldArgs, newArgs) {
  return !oldArgs || newArgs.some((arg, index) => arg !== oldArgs[index]);
}
