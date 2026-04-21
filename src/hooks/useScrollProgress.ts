import { useScrollContext } from "@/context/ScrollContext";

export function useScrollProgress() {
  return useScrollContext().scrollProgress;
}

export function useScrollY() {
  return useScrollContext().scrollY;
}
