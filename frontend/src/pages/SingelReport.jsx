import React from 'react';
import PDFViewer from '../components/PDFviwer';



const SingelReport = () => {
  

  

  return (
    <div className="App">
      <h1>PDF Viewer</h1>
      <PDFViewer pdfUrl="https://cors-anywhere.herokuapp.com/https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" />
    </div>
  )
    
};

export default SingelReport;
