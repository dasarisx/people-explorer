const express = require("express");
const { createLongText } = require("../services/streamService");

function createStreamRouter() {
  const router = express.Router();

  router.get("/", (req, res) => {
    const text = createLongText();
    let index = 0;
    let interval;
    let closed = false;
    let waitingForDrain = false;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    function stop() {
      closed = true;
      clearInterval(interval);
    }

    function finish() {
      stop();

      if (!res.writableEnded) {
        res.end();
      }
    }

    function writeNextChunk() {
      if (closed || waitingForDrain) return;

      if (index >= text.length) {
        finish();
        return;
      }

      const chunk = text.slice(index, index + 48);
      index += 48;

      const canContinue = res.write(chunk);

      if (!canContinue) {
        waitingForDrain = true;
        clearInterval(interval);

        res.once("drain", () => {
          waitingForDrain = false;

          if (!closed) {
            interval = setInterval(writeNextChunk, 45);
          }
        });
      }
    }

    interval = setInterval(writeNextChunk, 45);

    req.on("close", stop);
  });

  return router;
}

module.exports = {
  createStreamRouter,
};
