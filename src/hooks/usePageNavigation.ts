// hooks/usePageNavigation.ts
import { useState } from 'react';

type PageData = { elements: readonly any[]; appState: any };

type CustomExcalidrawAPI = {
    updateScene: (sceneData: any) => void;
    getSceneElements: () => readonly any[];
    getAppState: () => any;
    exportToBlob: () => Promise<Blob>;
    resetScene: () => void;
    undo: () => void;
    redo: () => void;
  };
  

export function usePageNavigation(excalidrawAPI: CustomExcalidrawAPI | null) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const savePage = () => {
    if (excalidrawAPI) {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const newPages = [...pages];
      newPages[currentPage] = { elements, appState };
      setPages(newPages);
    }
  };

  const loadPage = (pageIndex: number) => {
    if (pages[pageIndex]) {
      excalidrawAPI?.updateScene({
        elements: pages[pageIndex].elements,
        appState: pages[pageIndex].appState,
      });
    } else {
      excalidrawAPI?.updateScene({
        elements: [],
        appState: excalidrawAPI?.getAppState(),
      });
    }
    setCurrentPage(pageIndex);
  };

  return { savePage, loadPage, currentPage, setCurrentPage };
}
