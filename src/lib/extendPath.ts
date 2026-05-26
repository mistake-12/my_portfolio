export function extendPath(d: string, designWidth: number, actualWidth: number): string {
  if (!d) return d;

  // 页面比设计稿窄：不做裁剪，交给 SVG viewBox/width 控制可视区域
  if (actualWidth <= designWidth) return d;

  let extended = d;
  let covered = designWidth;

  while (covered < actualWidth) {
    const offsetD = offsetPathX(d, covered);
    // 用 L 连接到下一段起点，再拼接后续指令，避免路径断裂
    extended += " L " + offsetD.replace(/^M\s*/, "");
    covered += designWidth;
  }

  return extended;
}

function offsetPathX(d: string, offset: number): string {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tokens) return d;

  let isX = false;
  let lastCmd = "";
  const out: string[] = [];

  for (const t of tokens) {
    if (/^[A-Za-z]$/.test(t)) {
      lastCmd = t;
      out.push(t);
      isX = lastCmd !== "V";
      continue;
    }

    const num = Number(t);
    if (!Number.isFinite(num)) {
      out.push(t);
      continue;
    }

    if (lastCmd === "V") {
      // 只有 y
      out.push(trimNum(num));
      continue;
    }

    if (lastCmd === "H") {
      // 只有 x
      out.push(trimNum(num + offset));
      continue;
    }

    if (isX) out.push(trimNum(num + offset));
    else out.push(trimNum(num));

    isX = !isX;
  }

  return out.join(" ");
}

function trimNum(n: number) {
  const s = n.toFixed(3);
  return s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}
