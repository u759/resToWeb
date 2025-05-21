'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload'; // Using import alias
import JSZip from 'jszip'; // Import JSZip

interface GeneratedCode {
  html: string;
  css: string;
  js: string;
}

export default function HomePage() {
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [error, setError] = useState<string>('');

  const handleUploadSuccess = (code: GeneratedCode) => {
    setGeneratedCode(code);
    setError('');
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setGeneratedCode(null);
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const downloadAllFilesAsZip = () => {
    if (!generatedCode) return;

    const zip = new JSZip();
    zip.file("index.html", generatedCode.html);
    zip.file("style.css", generatedCode.css);
    zip.file("script.js", generatedCode.js);

    zip.generateAsync({ type: "blob" })
      .then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "portfolio-files.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      });
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
      <div className="z-10 w-full max-w-3xl items-center justify-between font-mono text-sm lg:flex flex-col">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Resume to Portfolio
          </h1>
          <p className="text-lg text-gray-300">
            Upload your PDF resume and instantly generate a modern static portfolio website using Gen AI!
          </p>
        </header>

        <div className="w-full bg-gray-800 shadow-2xl rounded-lg p-6 sm:p-8">
          <FileUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 text-red-300 border border-red-500 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        {generatedCode && (
          <section className="mt-12 w-full bg-gray-800 shadow-2xl rounded-lg p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-indigo-400">Your Portfolio is Ready!</h2>
            <p className="text-gray-300 mb-6 text-center">
              Download the generated HTML, CSS, and JavaScript files below. You can host these files on any static site hosting platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => downloadFile('index.html', generatedCode.html, 'text/html')}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
              >
                Download HTML
              </button>
              <button
                onClick={() => downloadFile('style.css', generatedCode.css, 'text/css')}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                Download CSS
              </button>
              <button
                onClick={() => downloadFile('script.js', generatedCode.js, 'text/javascript')}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-400"
              >
                Download JavaScript
              </button>
            </div>
            
            {/* Add Download All Button */}
            <div className="mt-4 text-center"> 
              <button
                onClick={downloadAllFilesAsZip}
                className="w-full md:w-auto py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
              >
                Download All (ZIP)
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">Preview HTML:</h3>
              <div className="bg-gray-900 p-4 rounded-md max-h-96 overflow-auto border border-gray-700">
                <pre className="text-sm text-gray-200 whitespace-pre-wrap">
                  <code>{generatedCode.html}</code>
                </pre>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
