// src/context/PdfContext.tsx
import React, { createContext, useContext, useReducer } from "react";

export type PdfState = {
  isViewerActive: boolean;
  src: string | null;
};

const initialPdfState: PdfState = {
  isViewerActive: false,
  src: null,
};

type PdfAction =
  | { type: "OPEN_PDF_VIEWER"; payload: string }
  | { type: "CLOSE_PDF_VIEWER" };

function pdfReducer(state: PdfState, action: PdfAction): PdfState {
  switch (action.type) {
    case "OPEN_PDF_VIEWER":
      return { isViewerActive: true, src: action.payload };
    case "CLOSE_PDF_VIEWER":
      return { isViewerActive: false, src: null };
    default:
      return state;
  }
}

type PdfContextType = {
  pdfState: PdfState;
  pdfDispatch: React.Dispatch<PdfAction>;
};

const PdfContext = createContext<PdfContextType | undefined>(undefined);

export const PdfProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pdfState, pdfDispatch] = useReducer(pdfReducer, initialPdfState);
  return (
    <PdfContext.Provider value={{ pdfState, pdfDispatch }}>
      {children}
    </PdfContext.Provider>
  );
};

export const usePdfContext = () => {
  const context = useContext(PdfContext);
  if (!context) {
    throw new Error("usePdfContext must be used within a PdfProvider");
  }
  return context;
};
