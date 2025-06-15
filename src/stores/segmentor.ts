import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORE_NAME = "segmentor-store";

export type SplitMode = "characters" | "words" | "sentences";

export interface SegmentorState {
  text: string;
  splitMode: SplitMode;
}

export const INITIAL_SEGMENTOR_STATE = {
  text: "",
  splitMode: "words" as SplitMode,
};

export const useSegmentorStore = create<SegmentorState>()(
  persist(
    () => ({
      ...INITIAL_SEGMENTOR_STATE,
    }),
    {
      name: STORE_NAME,
    },
  ),
);
