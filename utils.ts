import { basename } from "./deps.ts";
/**
 * Check the filename is deno test file or not.
 * @param filename
 * @return filename is deno test file or not
 */
export function isDenoTest(filename: string) {
  return /^(.*[._])?test\.m?[tj]sx?$/.test(basename(filename));
}

/**
 * Default debounce interval time
 * [deno file_watcher.ts](https://github.com/denoland/deno/blob/0ec151b8cb2a92bb1765672fa15de23e6c8842d4/cli/file_watcher.rs#L32)
 */
export const DEFAULT_DEBOUNCE_INTERVAL = 200;

/**
 * Watch changes under the path(s) and run onChange function.
 * This command is heavily inspired this article:
 * [Build a live reloader and explore Deno! 🦕 - DEV Community](https://dev.to/otanriverdi/let-s-explore-deno-by-building-a-live-reloader-j47)
 * @param paths watch target path(s)
 * @param onChange func to be called when update is found
 * @param config config object includes debounce interval time
 */
export async function watchChanges(
  paths: string | string[],
  onChange: (event: Deno.FsEvent) => void,
  config = { interval: DEFAULT_DEBOUNCE_INTERVAL },
) {
  const watcher = Deno.watchFs(paths);
  let reloading = false;

  for await (const event of watcher) {
    if (event.kind !== "modify" || reloading) {
      continue;
    }
    reloading = true;
    onChange(event);
    setTimeout(() => (reloading = false), config.interval);
  }
}

/**
 * Run command with closing ongoing process by given signal.
 * @param cmd string array of command to run
 * @param ongoingProcess ongoing process to kill
 * @param killSignal signal to kill ongoing process (default="SIGTERM")
 * @return started process
 * @throws error when kill process fails other than "ESRCH: No such process"
 */
export function runProcess({
  cmd,
  ongoingProcess,
  killSignal = "SIGTERM",
}: {
  cmd: string[];
  ongoingProcess?: Deno.Process;
  killSignal?: Deno.Signal;
}) {
  if (ongoingProcess) {
    try {
      ongoingProcess.kill(killSignal);
    } catch (error) {
      // The process is already finished/killed when "No such process" raised
      // Otherwise, something wrong
      if (error.message !== "ESRCH: No such process") {
        throw error;
      }
    } finally {
      ongoingProcess.close();
    }
  }

  const process = Deno.run({ cmd });
  process.status();
  return process;
}

/**
 * Insert '--' before first argument.
 * @param args arguments to process
 * @param needEquals options that have optional arguments
 * @return processed arguments
 * @throws error when items in needEquals does not start with '--'
 */
export function ensureOptsArgs(args: string[], needEquals: string[]) {
  needEquals.forEach((option) => {
    if (!/^--[a-z]/.test(option)) {
      throw new Error(
        "Item in needEquals must be start with '--', but got " + option,
      );
    }
  });

  for (let i = 0; i < args.length - 1; i++) {
    if (!needEquals.includes(args[i])) {
      continue;
    }
    if (args[i + 1].startsWith("-")) {
      continue;
    }

    return [...args.slice(0, i + 1), "--", ...args.slice(i + 1)];
  }

  return args;
}
