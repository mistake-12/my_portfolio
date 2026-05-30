export interface Profile {
  name: string;
  greeting: string;
  bio: string;
  location: string;
  focus: string;
  status: string;
  image: string;
}

export const profile: Profile = {
  name: "JONY MA.",
  greeting: "Hello, I'm Zihang",
  bio: "欢迎来到我的个人网站。在上海交通大学工业设计这几年的学习，让我逐渐形成了设计、开发与产品三者融合的工作方式。我不满足于停留在概念的层面，而是把每一个想法推向落地的深处。从工业机器人到AI求职平台，每一个项目都在追问同一个问题：这个设计是否真正让用户的生活变好了一点点？我享受从0到1的构建过程，也珍视每一次用户反馈带来的迭代机会，设计于我而言，是一种对生活保持敏感的方式，也是对技术保持谦逊的态度。工作之外，我喜欢健身与徒步，这些都是我保持节奏感的秘诀——我始终相信，好的设计需要一个积极向上的生活态度。",
  location: "shanghai",
  focus: "Design + Code",
  status: "Available",
  image: "https://cloudflare-imgbed-b9a.pages.dev/file/1780165079656_图像3.png",
};
