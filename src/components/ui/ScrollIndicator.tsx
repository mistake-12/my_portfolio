export default function ScrollIndicator() {
  return (
    <div
      id="scroll-indicator"
      className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50"
    >
      <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-500">
        Scroll to flip
      </span>

      <div className="h-20 w-[1px] bg-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full scroll-track animate-scroll-drop" />
      </div>
    </div>
  );
}
