export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="sport-spinner" />
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>読み込み中...</p>
      </div>
    </div>
  );
}
