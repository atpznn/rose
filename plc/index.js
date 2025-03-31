const { spawn } = require("child_process");
const readline = require("readline");
const isWindows = process.platform === "win32";
const numInstances = 5;

function startInstance(index) {
  let terminalProcess;
  if (isWindows) {
    terminalProcess = spawn(
      "cmd.exe",
      ["/c", "start", "cmd.exe", "/k", `node plcClient.js ${index}`],
      {
        stdio: "ignore",
        detached: true,
      }
    );
  } else {
    terminalProcess = spawn(
      "x-terminal-emulator",
      ["-e", `bash -c "node plcClient.js ${index}; exec bash"`],
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
    startInstance(input);
  });
}
function main() {
  for (let i = 0; i < numInstances; i++) {
    startInstance(i);
  }
  input();
}

main();
