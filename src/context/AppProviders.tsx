import React from "react";
import { MeetingProvider } from "./MeetingContext";
import { PdfProvider } from "./PdfContext";
import { RealViewProvider } from "./RealViewContext";
// Removed WebcamOverlayProvider since we're managing the small webcam locally.
import { ExcalidrawProvider } from "./ExcalidrawContext";
import { OverlayManagerProvider } from "./OverlayManagerContext";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MeetingProvider>
      <PdfProvider>
        <RealViewProvider>
          <ExcalidrawProvider>
            <OverlayManagerProvider>
              {children}
            </OverlayManagerProvider>
          </ExcalidrawProvider>
        </RealViewProvider>
      </PdfProvider>
    </MeetingProvider>
  );
};
