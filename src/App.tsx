import React, { useState, useRef, useEffect } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import CustomToolbar from './CustomToolbar';
import PageNavigation from './PageNavigation';
import MainToolbar from './MainToolbar';
import ToolConfigMenu from './ToolConfigMenu';
import WebcamDisplay from './WebcamDisplay';
import PDFViewer from './PDFViewer';
import './App.css';
import { usePageNavigation } from './hooks/usePageNavigation';

type CustomExcalidrawAPI = {
  updateScene: (sceneData: any, opts?: { commitToStore?: boolean }) => void;
  getSceneElements: () => readonly any[];
  getAppState: () => any;
  exportToBlob: () => Promise<Blob>;
  resetScene: () => void;
  undo: () => void;
  redo: () => void;
  setActiveTool: (tool: any) => void;
  onChange: (callback: (elements: any[], appState: any) => void) => () => void;
  onPointerDown: (
    callback: (activeTool: any, pointerDownState: any, event: React.PointerEvent<HTMLElement>) => void
  ) => () => void;
  onPointerUp: (callback: (activeTool: any, pointerDownState: any, event: PointerEvent) => void) => () => void;
};

function TutorTool() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);
  const { savePage, loadPage, currentPage, setCurrentPage } = usePageNavigation(excalidrawAPI);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [webcamOn, setWebcamOn] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isPdfScrollMode, setIsPdfScrollMode] = useState(false);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1); // PDF starts at page 1
  const [pdfTotalPages, setPdfTotalPages] = useState(0); // Total pages in the PDF

  const lockedScroll = useRef<{ x: number; y: number } | null>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);

  const openConfigMenu = (toolType: string) => setSelectedTool(toolType);
  const closeConfigMenu = () => setSelectedTool(null);
  const toggleWebcam = () => setWebcamOn((prev) => !prev);

  const handlePdfUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (file) {
        setPdfFile(file);
        setOverlayVisible(true);
      }
    };
    input.click();
  };

  const handlePdfClose = () => {
    setOverlayVisible(false);
    setPdfFile(null);
    setIsPdfScrollMode(false);
    lockedScroll.current = null;
    setPdfCurrentPage(1); // Reset to the first page
  };

  const enablePdfScrollMode = () => setIsPdfScrollMode(true);
  const disablePdfScrollMode = () => setIsPdfScrollMode(false);

  const lockScroll = (x: number, y: number) => {
    excalidrawAPI?.updateScene(
      { appState: { scrollX: x, scrollY: y } },
      { commitToStore: false } // Avoid adding to undo/redo history
    );
  };

  const goToNextPage = () => {
    savePage();
    if (overlayVisible) {
      if (pdfCurrentPage < pdfTotalPages) {
        setPdfCurrentPage((prev) => prev + 1);
      }
    } else {
      setCurrentPage((prev) => prev + 1);
      loadPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    savePage();
    if (overlayVisible) {
      if (pdfCurrentPage > 1) {
        setPdfCurrentPage((prev) => prev - 1);
      }
    } else if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      loadPage(currentPage - 1);
    }
  };

  useEffect(() => {
    if (overlayVisible && excalidrawAPI) {
      const currentScroll = excalidrawAPI.getAppState();
      lockedScroll.current = { x: currentScroll.scrollX, y: currentScroll.scrollY };

      const unsubscribe = excalidrawAPI.onChange((elements, appState) => {
        if (
          lockedScroll.current &&
          (appState.scrollX !== lockedScroll.current.x || appState.scrollY !== lockedScroll.current.y)
        ) {
          lockScroll(lockedScroll.current.x, lockedScroll.current.y);
        }
      });

      return () => unsubscribe(); // Clean up subscription
    }
  }, [overlayVisible, excalidrawAPI]);

  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {overlayVisible && pdfFile && (
        <div
          ref={pdfViewerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            overflow: isPdfScrollMode ? 'auto' : 'hidden',
          }}
        >
          <PDFViewer
            pdfFile={pdfFile}
            currentPage={pdfCurrentPage}
            setTotalPages={setPdfTotalPages}
          />
        </div>
      )}

      {/* Conditional Buttons for PDF Mode */}
      {overlayVisible && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 3,
            display: 'flex',
            gap: '10px',
          }}
        >
          <button onClick={isPdfScrollMode ? disablePdfScrollMode : enablePdfScrollMode}>
            {isPdfScrollMode ? 'Back to Drawing' : 'Scroll PDF'}
          </button>
          <button onClick={handlePdfClose}>Close PDF</button>
        </div>
      )}

      {/* Conditional Webcam Display */}
      {webcamOn && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 3,
          }}
        >
          <WebcamDisplay />
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: isPdfScrollMode ? 'none' : 'auto',
        }}
      >
        <MainToolbar
          excalidrawAPI={excalidrawAPI}
          onUploadPDF={handlePdfUpload}
          onToggleWebcam={toggleWebcam}
        />
        <CustomToolbar excalidrawAPI={excalidrawAPI} onToolSelect={openConfigMenu} />
        <PageNavigation
            savePage={savePage}
            loadPage={loadPage}
            currentPage={currentPage}
            setCurrentPage={(page) => {
                setPdfCurrentPage(page); // Sync with PDF
                setCurrentPage(page); // Always update Excalidraw
            }}
            overlayVisible={overlayVisible}
            pdfTotalPages={pdfTotalPages}
        />

        <Excalidraw
          onChange={(elements, state) => console.log('Canvas Updated', elements, state)}
          excalidrawAPI={(api) => setExcalidrawAPI(api as unknown as CustomExcalidrawAPI)}
          initialData={{
            appState: { viewBackgroundColor: 'transparent', gridSize: null },
          }}
        />
      </div>
    </div>
  );
}

export default TutorTool;
