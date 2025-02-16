// react-pdf.d.ts
declare module "react-pdf" {
    import * as React from "react";
  
    export interface DocumentProps {
      file: any;
      onLoadSuccess?: (pdf: any) => void;
      onLoadError?: (error: any) => void;
      [key: string]: any;
    }
  
    export class Document extends React.Component<DocumentProps> {}
  
    export interface PageProps {
      pageNumber: number;
      scale?: number;
      renderTextLayer?: boolean;
      renderAnnotationLayer?: boolean;
      [key: string]: any;
    }
  
    export class Page extends React.Component<PageProps> {}
  
    export const pdfjs: {
      GlobalWorkerOptions: {
        workerSrc: string;
      };
      version: string;
    };
  }
  