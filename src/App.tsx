import * as ICUSegmantation from "@echogarden/icu-segmentation-wasm";
import { clsx } from "clsx";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useShallow } from "zustand/shallow";
import localWasmUrl from "../node_modules/@echogarden/icu-segmentation-wasm/wasm/icu-segmentation.wasm?url";
import { useHashStore, useHashStoreHydration } from "./stores/hash";
import type { SplitMode } from "./stores/segmentor";
import { useSegmentorStore } from "./stores/segmentor";

function App() {
  const hashHydrated = useHashStoreHydration();

  useEffect(() => {
    if (hashHydrated) {
      useSegmentorStore.setState({
        text: useHashStore.getState().text,
        splitMode: useHashStore.getState().splitMode,
      });
    }
  }, [hashHydrated]);

  const { text, splitMode } = useSegmentorStore(
    useShallow(useCallback(({ text, splitMode }) => ({ text, splitMode }), [])),
  );

  const setText = useCallback((value = "") => {
    useHashStore.setState({ text: value });
    useSegmentorStore.setState({ text: value });
  }, []);

  const setSplitMode = useCallback((value: SplitMode) => {
    useHashStore.setState({ splitMode: value });
    useSegmentorStore.setState({ splitMode: value });
  }, []);

  const [isWasmReady, setIsWasmReady] = useState(false);

  useEffect(() => {
    ICUSegmantation.initialize({
      locateFile: () => (import.meta.env.PROD ? localWasmUrl : localWasmUrl),
    }).then(() => {
      setIsWasmReady(true);
    });

    return () => {
      setIsWasmReady(false);
    };
  }, []);

  const segments = useMemo(() => {
    if (!isWasmReady) {
      return [];
    }

    if (text.length === 0) {
      return [];
    }

    switch (splitMode) {
      case "characters":
        return ICUSegmantation.splitToCharacters(text);
      case "words":
        return ICUSegmantation.splitToWords(text);
      case "sentences":
        return ICUSegmantation.splitToSentences(text);
      default:
        return [];
    }
  }, [text, splitMode, isWasmReady]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleSplitModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSplitMode(event.target.value as SplitMode);
  };

  return (
    <div className="flex h-screen w-screen flex-col gap-8 p-16">
      <div className="flex shrink-0 flex-wrap gap-8">
        <div className="flex gap-2">
          <input
            type="radio"
            id="characters"
            name="splitMode"
            value="characters"
            checked={splitMode === "characters"}
            onChange={handleSplitModeChange}
            disabled={!isWasmReady}
          />
          <label htmlFor="characters">Split to characters</label>
        </div>
        <div className="flex gap-2">
          <input
            type="radio"
            id="words"
            name="splitMode"
            value="words"
            checked={splitMode === "words"}
            onChange={handleSplitModeChange}
            disabled={!isWasmReady}
          />
          <label htmlFor="words">Split to words</label>
        </div>
        <div className="flex gap-2">
          <input
            type="radio"
            id="sentences"
            name="splitMode"
            value="sentences"
            checked={splitMode === "sentences"}
            onChange={handleSplitModeChange}
            disabled={!isWasmReady}
          />
          <label htmlFor="sentences">Split to sentences</label>
        </div>
        <div className="grow" />
        {!isWasmReady && <span className="shrink-0">Loading WASM ...</span>}
      </div>
      <div className="flex min-h-0 grow gap-16">
        <div className="flex h-full min-w-0 shrink grow basis-0">
          <textarea
            className="w-full rounded-4 p-8 text-base/relaxed ring-2 ring-neutral-400 focus:ring-neutral-500 focus:outline-0"
            value={text}
            onChange={handleChange}
            rows={10}
          />
        </div>
        <div className="flex h-full min-w-0 shrink grow basis-0">
          <p className="w-full overflow-y-auto rounded-4 bg-neutral-50 p-8 break-words whitespace-pre-wrap ring-2 ring-neutral-400">
            {!isWasmReady ?
              text
            : segments.map((segment, index) => (
                <span
                  key={index}
                  className={clsx(
                    "mx-2 rounded-2 p-2 text-base/relaxed ring-1",
                    {
                      "bg-red-200 ring-red-300": (index * 5) % 9 === 0,
                      "bg-amber-200 ring-amber-300": (index * 5) % 9 === 1,
                      "bg-lime-200 ring-lime-300": (index * 5) % 9 === 2,
                      "bg-emerald-200 ring-emerald-300": (index * 5) % 9 === 3,
                      "bg-cyan-200 ring-cyan-300": (index * 5) % 9 === 4,
                      "bg-blue-200 ring-blue-300": (index * 5) % 9 === 5,
                      "bg-violet-200 ring-violet-300": (index * 5) % 9 === 6,
                      "bg-fuchsia-200 ring-fuchsia-300": (index * 5) % 9 === 7,
                      "bg-rose-200 ring-rose-300": (index * 5) % 9 === 8,
                    },
                  )}
                >
                  {segment}
                </span>
              ))
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
