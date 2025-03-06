import React from "react";
import { MeetingProvider } from "./MeetingContext";
import { PdfProvider } from "./PdfContext";
import { WebcamProvider } from "./WebcamContext";
import { ExcalidrawProvider } from "./ExcalidrawContext";
import { OverlayManagerProvider } from "./OverlayManagerContext";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MeetingProvider>
      <PdfProvider>
        <WebcamProvider>
          <ExcalidrawProvider>
            <OverlayManagerProvider>
              {children}
            </OverlayManagerProvider>
          </ExcalidrawProvider>
        </WebcamProvider>
      </PdfProvider>
    </MeetingProvider>
  );
};