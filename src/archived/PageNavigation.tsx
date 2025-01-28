import React from 'react';

type PageNavigationProps = {
    savePage: () => void;
    loadPage: (pageIndex: number) => void;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    overlayVisible: boolean;
    pdfTotalPages: number;
};

const PageNavigation = ({
    savePage,
    loadPage,
    currentPage,
    setCurrentPage,
    overlayVisible,
    pdfTotalPages,
}: PageNavigationProps) => {
    const goToNextPage = () => {
        savePage();
    
        if (overlayVisible) {
            // Ensure functional state update to avoid race conditions
            setCurrentPage((prev) => {
                const nextPage = prev + 1;
                return nextPage <= pdfTotalPages ? nextPage : prev; // Stay within bounds
            });
        } else {
            setCurrentPage((prev) => prev + 1);
            loadPage(currentPage + 1);
        }
    };
    
    const goToPreviousPage = () => {
        savePage();
    
        if (overlayVisible) {
            // Ensure functional state update to avoid race conditions
            setCurrentPage((prev) => {
                const previousPage = prev - 1;
                return previousPage >= 1 ? previousPage : prev; // Stay within bounds
            });
        } else {
            setCurrentPage((prev) => prev - 1);
            loadPage(currentPage - 1);
        }
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
                disabled={currentPage <= 1 && overlayVisible} // Disable on first page of PDF
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    cursor: currentPage <= 1 && overlayVisible ? 'not-allowed' : 'pointer',
                }}
            >
                Previous Page
            </button>
            <button
                onClick={goToNextPage}
                disabled={overlayVisible && currentPage >= pdfTotalPages} // Disable on last page of PDF
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    cursor: overlayVisible && currentPage >= pdfTotalPages ? 'not-allowed' : 'pointer',
                }}
            >
                Next Page
            </button>
        </div>
    );
};

export default PageNavigation;
