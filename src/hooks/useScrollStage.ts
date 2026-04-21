import { useScrollContext } from "@/context/ScrollContext";

export function useScrollStage() {
  return useScrollContext().currentStage;
}
