import { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { apiBase } from "../../api/client";
import { createJob } from "../../api/jobs";

const requestCount = 20;
const clientIdStorageKey = "worker-jobs-client-id";

function getClientId() {
  const existing = sessionStorage.getItem(clientIdStorageKey);
  if (existing) return existing;

  const next = crypto.randomUUID();
  sessionStorage.setItem(clientIdStorageKey, next);
  return next;
}

export function useWorkerJobs() {
  const [jobs, setJobs] = useState([]);
  const clientId = useMemo(getClientId, []);

  useEffect(() => {
    const socket = io(apiBase || undefined, {
      auth: { clientId }
    });

    socket.on("job:result", (result) => {
      setJobs((current) =>
        current.map((job) => (job.id === result.id ? { ...job, ...result } : job)),
      );
    });

    return () => socket.close();
  }, [clientId]);

  async function createJobs() {
    setJobs([]);

    const responses = await Promise.all(
      Array.from({ length: requestCount }, (_, index) => 
        createJob({
          label: `Request ${index + 1}`,
          clientId
        })
      ),
    );

    setJobs(responses);
  }

  return {
    jobs,
    requestCount,
    createJobs,
  };
}
