import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// pdfjs 4.x (bundled inside react-pdf 9.x) uses .mjs workers; cdnjs doesn't carry this version.
// Use unpkg which mirrors every pdfjs-dist release.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoading(false);
    setLoadError(null);
  }

  function onDocumentLoadError(error) {
    setIsLoading(false);
    setLoadError(error?.message || 'Failed to load PDF');
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  if (loadError) {
    return (
      <div style={{ padding: '16px', background: '#fff3f3', border: '1px solid #fcc', borderRadius: '6px' }}>
        <p style={{ color: '#c00', marginBottom: '8px' }}>Unable to display PDF inline.</p>
        <a href={pdfUrl} target="_blank" rel="noreferrer">
          Open / Download PDF
        </a>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      {isLoading && <div className="loading">Loading PDF...</div>}

      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div>Loading PDF...</div>}
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          scale={1.2}
        />
      </Document>

      {numPages && (
        <div className="controls">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;