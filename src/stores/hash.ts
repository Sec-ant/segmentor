import { useEffect, useState } from "react";
import type { JsonValue } from "type-fest";
import { create } from "zustand";
import {
  persist,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";
import { decode } from "../utils/decode";
import { encode } from "../utils/encode";
import {
  INITIAL_SEGMENTOR_STATE,
  useSegmentorStore,
  type SegmentorState,
} from "./segmentor";

const STORE_NAME = "hash-store";

export const hydrationErrorEventTarget = new EventTarget();

function getUrlHash() {
  return window.location.hash.slice(1);
}

const hashStateStorage: PersistStorage<HashState> = {
  getItem: async (key: string) => {
    let urlStore: JsonValue | undefined;
    const urlHash = getUrlHash();

    if (urlHash) {
      const searchParams = new URLSearchParams(urlHash);
      if (searchParams.has(key)) {
        urlStore = await decode(searchParams.get(key) as string);
      }
    }

    if (
      typeof urlStore !== "object" ||
      urlStore === null ||
      Array.isArray(urlStore) ||
      !("state" in urlStore)
    ) {
      throw new Error("Invalid url hash store");
    }

    return urlStore as unknown as StorageValue<HashState>;
  },

  setItem: async (key: string, value: StorageValue<HashState>) => {
    const searchParams = new URLSearchParams(getUrlHash());
    searchParams.set(key, await encode(value as unknown as JsonValue));
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}#${searchParams.toString()}`,
    );
  },

  removeItem: async (key: string) => {
    const searchParams = new URLSearchParams(getUrlHash());
    searchParams.delete(key);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}#${searchParams.toString()}`,
    );
  },
};

export interface HashState extends Pick<SegmentorState, "text" | "splitMode"> {}

export const INITIAL_HASH_STATE: HashState = {
  text: INITIAL_SEGMENTOR_STATE.text,
  splitMode: INITIAL_SEGMENTOR_STATE.splitMode,
};

export const useHashStore = create<HashState>()(
  persist(() => INITIAL_HASH_STATE, {
    name: STORE_NAME,
    storage: hashStateStorage,
    partialize: (state): HashState => ({
      text: state.text,
      splitMode: state.splitMode,
    }),
    onRehydrateStorage: () => {
      return (_, error) => {
        if (error instanceof Error) {
          const { text, splitMode } = useSegmentorStore.getState();
          useHashStore.setState({
            text,
            splitMode,
          });
        }
      };
    },
  }),
);

export function useHashStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubHydrate = useHashStore.persist.onHydrate(() =>
      setHydrated(false),
    );

    const unsubFinishHydration = useHashStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    setHydrated(useHashStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
}
