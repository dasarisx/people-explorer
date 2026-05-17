const { parentPort } = require("node:worker_threads");

parentPort.on("message", (job) => {
  setTimeout(() => {
    parentPort.postMessage({
      id: job.id,
      clientId: job.clientId,
      status: "completed",
      result: `Processed ${job.label}`,
    });
  }, 2000);
});
