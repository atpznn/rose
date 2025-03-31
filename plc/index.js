const { spawn } = require("child_process");
const readline = require("readline");
const isWindows = process.platform === "win32";

function startInstance(floor, position) {
  let terminalProcess;
  if (isWindows) {
    terminalProcess = spawn(
      "cmd.exe",
      [
        "/c",
        "start",
        "cmd.exe",
        "/k",
        `node plcClient.js ${floor} ${position}`,
      ],
      {
        stdio: "ignore",
        detached: true,
      }
    );
  } else {
    terminalProcess = spawn(
      "x-terminal-emulator",
      ["-e", `bash -c "node plcClient.js ${floor} ${position}; exec bash"`],
      {
        stdio: "ignore",
        detached: true,
      }
    );
  }
  terminalProcess.unref();
  // process.kill(terminalProcess.pid);
}
function input() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on("line", async (input) => {
    const data = input.split(" ");
    startInstance(data[0], data[1]);
  });
}
function main() {
  startInstance(1, 1);
  startInstance(1, 2);
  startInstance(1, 3);
  startInstance(2, 1);
  startInstance(2, 2);
  input();
}

main();
