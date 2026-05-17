const path = require("node:path");
const { Worker } = require("node:worker_threads");

function createJobQueue(io) {
  const queue = [];
  let nextId = 1;
  const worker = new Worker(path.join(__dirname, "worker.js"));

  worker.on("message", (result) => {
    if(result.clientId) {
      io.to(result.clientId).emit("job:result",result);
      return;
    }
    
    io.emit("job:result", result);
  });

  worker.on("error", (error) => {
    io.emit("job:error", { message: error.message });
  });

  function processQueue() {
    while (queue.length > 0) {
      worker.postMessage(queue.shift());
    }
  }

  function enqueue({label, clientId}) {
    const id = nextId++;
    const job = {
      id: `job-${id}`,
      clientId,
      label: label || `Request ${id}`,
      status: "pending",
      queuedAt: new Date().toISOString(),
    };

    queue.push(job);
    processQueue();

    return job;
  }

  return {
    enqueue,
  };
}

module.exports = {
  createJobQueue,
};
