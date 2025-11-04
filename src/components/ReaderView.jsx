// src/components/ReaderView.jsx
import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import "../styles/ReaderContainer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export default function ReaderView({ filePath = "/books/test.pdf" }) {
  const [textContent, setTextContent] = useState("Loading PDF...");

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(filePath);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const text = await page.getTextContent();
        const textItems = text.items.map((item) => item.str).join(" ");
        setTextContent(textItems);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setTextContent("Failed to load PDF.");
      }
    };

    loadPDF();
  }, [filePath]);

  return (
    <div className="reader-view">
                <div className="pdf-placeholder">
                    <p>PDF Viewer Placeholder</p>
                </div>
    </div>
  );
}