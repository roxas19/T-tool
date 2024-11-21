import React from 'react';

type MainToolbarProps = {
  excalidrawAPI: any;
  onToggleWebcam: () => void;
  onUploadPDF: () => void;  // Update this to remove event parameter
};

const MainToolbar: React.FC<MainToolbarProps> = ({ excalidrawAPI, onToggleWebcam, onUploadPDF }) => {
  const handleOpen = () => {
    excalidrawAPI?.resetScene();
  };

  const handleSave = () => {
    const elements = excalidrawAPI?.getSceneElements();
    const appState = excalidrawAPI?.getAppState();
    const scene = JSON.stringify({ elements, appState });
    localStorage.setItem("excalidraw-scene", scene);
    alert("Canvas saved!");
  };

  const handleExportImage = () => {
    excalidrawAPI?.exportToBlob().then((blob: Blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'excalidraw-image.png';
      link.click();
    });
  };

  const handleResetCanvas = () => {
    excalidrawAPI?.updateScene({
      elements: [],
      appState: { ...excalidrawAPI.getAppState(), viewBackgroundColor: '#ffffff' },
    });
  };

  const handleUndo = () => {
    (document.querySelector('.undo-button-container button') as HTMLButtonElement)?.click();
  };

  const handleRedo = () => {
    (document.querySelector('.redo-button-container button') as HTMLButtonElement)?.click();
  };

  const handleImageUpload = () => {
    excalidrawAPI?.setActiveTool({
      type: 'image',
      insertOnCanvasDirectly: true,
    });
    console.log("Image tool activated for upload.");
  };

  return (
    <div className="main-toolbar">
      <button onClick={handleOpen}>Open</button>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleExportImage}>Export Image</button>
      <button onClick={handleResetCanvas}>Reset</button>
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      <button onClick={onToggleWebcam}>Toggle Webcam</button>
      <button onClick={handleImageUpload}>Upload Image</button>
      {/* Update the PDF upload button to use onUploadPDF prop */}
      <button onClick={onUploadPDF}>Upload PDF</button>
    </div>
  );
};

export default MainToolbar;
