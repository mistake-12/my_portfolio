import WelcomeSection from "@/components/WelcomeSection";
import AboutSection from "@/components/AboutSection";

export default function Home() {
  return (
    <main className="relative w-full bg-bg">
      {/* Sticky 层：高度 400vh 提供过渡所需的滚动距离。
          top-0 让它在视口中固定，两个 Section 叠加在同一视口位置。 */}
      <div className="relative h-[400vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <WelcomeSection />
          <AboutSection />
        </div>
      </div>

      {/* 页面其余部分（阶段三、四），滚动时才出现 */}
      <div className="min-h-screen bg-surface" />
    </main>
  );
}
