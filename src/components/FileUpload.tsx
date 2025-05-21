'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface FileUploadProps {
  onUploadSuccess: (generatedCode: { html: string; css: string; js: string }) => void;
  onUploadError: (error: string) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      onUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    onUploadError(''); // Clear previous errors

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('customInstructions', customInstructions);

    try {
      const response = await fetch('/api/generate-portfolio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      onUploadSuccess(result);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate portfolio. Please try again.';
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="resume-upload" className="block text-sm font-medium text-gray-300">
          Upload Resume (PDF)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-400">
              <label
                htmlFor="resume-upload"
                className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500"
              >
                <span>Upload a file</span>
                <input id="resume-upload" name="resume-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF up to 10MB</p>
            {file && <p className="text-sm text-gray-300 mt-2">Selected file: {file.name}</p>}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="custom-instructions" className="block text-sm font-medium text-gray-300">
          Custom Instructions (Optional)
        </label>
        <div className="mt-1">
          <textarea
            id="custom-instructions"
            name="custom-instructions"
            rows={3}
            maxLength={100}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md bg-gray-700 text-gray-200 placeholder-gray-500 p-2"
            placeholder="e.g. Dark theme"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">{customInstructions.length}/100 characters</p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isUploading || !file}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          {isUploading && (
            <div className="animate-indeterminate-progress-bar"></div>
          )}
          <span className="relative z-10"> {/* Ensure text is above the progress bar */}
            {isUploading ? 'Generating...' : 'Generate Portfolio'}
          </span>
        </button>
      </div>
    </form>
  );
}
