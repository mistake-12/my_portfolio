import MainScrollWrapper from "@/components/MainScrollWrapper";
import Beams from "@/components/ui/Beams";

export default function Home() {
  return (
    <main className="relative w-full bg-bg">
      {/* 全局 Three.js 光束背景：三处光束（左中右），幽暗体积光 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 左侧光束：倾斜朝右 */}
        <div className="absolute inset-0 opacity-15">
          <Beams rotation={-20} beamNumber={5} lightColor="#e0eeff" speed={1.2} />
        </div>
        {/* 右侧光束：倾斜朝左 */}
        <div className="absolute inset-0 opacity-15">
          <Beams rotation={20} beamNumber={5} lightColor="#ffe8d0" speed={1.0} />
        </div>
        {/* 中心光束 */}
        <div className="absolute inset-0 opacity-30">
          <Beams rotation={30} beamNumber={6} lightColor="#ffffff" speed={1.5} />
        </div>
        {/* 多点渐隐遮罩：保护中央文字区域，左右两侧也透出光束 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 50% 50%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" +
              ", radial-gradient(ellipse 40% 60% at 12% 50%, rgba(0,0,0,0.05) 0%, transparent 100%)" +
              ", radial-gradient(ellipse 40% 60% at 88% 50%, rgba(0,0,0,0.05) 0%, transparent 100%)",
          }}
        />
      </div>
      <MainScrollWrapper />
    </main>
  );
}
