import { memo } from "react";
import { SectionHeader } from "../../components/SectionHeader";
import { useStreamText } from "./useStreamText";

function StreamReaderComponent() {
  const stream = useStreamText();
  const isStreaming = stream.status === "streaming";
  
  const action = isStreaming ? (
    <button onClick={stream.stopStream}>Stop stream</button>
  ) : (
    <button onClick={stream.startStream}>Start stream</button>
  );

  return (
    <section className="panel">
      <SectionHeader title="Streaming Response" action={action} />
      <pre className="stream-box">{stream.visibleText || "Stream output will appear here."}</pre>
      {stream.fullText && <p className="complete-note">Stream closed. Full response rendered.</p>}
    </section>
  );
}

export const StreamReader = memo(StreamReaderComponent);
