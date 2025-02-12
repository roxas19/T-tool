import React from 'react';

type PageNavigationProps = {
  savePage: () => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pdfTotalPages: number;
};

const PageNavigation: React.FC<PageNavigationProps> = ({
  savePage,
  currentPage,
  setCurrentPage,
  pdfTotalPages,
}) => {
  const goToNextPage = () => {
    savePage();
    // Update to the next page while ensuring we stay within bounds.
    setCurrentPage((prev) => Math.min(prev + 1, pdfTotalPages));
  };

  const goToPreviousPage = () => {
    savePage();
    // Update to the previous page while ensuring we do not go below 1.
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div
      className="page-navigation"
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 3,
        display: 'flex',
        gap: '10px',
      }}
    >
      <button
        onClick={goToPreviousPage}
        disabled={currentPage <= 1}
        style={{
          padding: '10px',
          fontSize: '16px',
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
        }}
      >
        Previous Page
      </button>
      <button
        onClick={goToNextPage}
        disabled={currentPage >= pdfTotalPages}
        style={{
          padding: '10px',
          fontSize: '16px',
          cursor: currentPage >= pdfTotalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Next Page
      </button>
    </div>
  );
};

export default PageNavigation;
