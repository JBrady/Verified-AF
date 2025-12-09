import React, { useState } from 'react';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const PgpVerifier: React.FC = () => {
  const [signatureFilePath, setSignatureFilePath] = useState('');
  const [mainFilePath, setMainFilePath] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusIcon, setStatusIcon] = useState<JSX.Element | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectSignatureFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Signatures', extensions: ['sig', 'asc', 'gpg'] }],
      });
      if (selected && typeof selected === 'string') {
        setSignatureFilePath(selected);
      }
    } catch (err) {
      console.error('Failed to open dialog:', err);
    }
  };

  const selectMainFile = async () => {
    try {
      const selected = await open({
        multiple: false,
      });
      if (selected && typeof selected === 'string') {
        setMainFilePath(selected);
      }
    } catch (err) {
      console.error('Failed to open dialog:', err);
    }
  };

  const handleVerify = async () => {
    setError(null);
    setOutput(null);
    setStatusIcon(null);
    setIsLoading(true);
    if (!signatureFilePath || !mainFilePath) {
      setError('Both signature and main file paths are required');
      setIsLoading(false);
      return;
    }
    console.log('handleVerify clicked', { signatureFilePath, mainFilePath });
    if (!isTauri()) {
      setError('Tauri environment not detected');
      setIsLoading(false);
      return;
    }
    try {
      const raw = await invoke<string>('verify_pgp_signature', {
        signaturePath: signatureFilePath,
        filePath: mainFilePath,
      });
      console.log('GPG verify output:', raw);
      let icon: JSX.Element | null = null;
      let summary: string;
      const goodMatch = raw.match(/Good signature from \"(.+?)\"/);
      if (goodMatch) {
        summary = `Valid signature from ${goodMatch[1]}`;
        icon = <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />;
      } else if (raw.includes('not certified with a trusted signature')) {
        summary = 'Signature valid, but not trusted. You must verify the key fingerprint manually.';
        icon = <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      } else if (raw.includes('BAD signature')) {
        summary = 'Bad signature!';
        icon = <XCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />;
      } else {
        summary = raw;
        icon = null;
      }
      setOutput(summary);
      setStatusIcon(icon);
    } catch (e: any) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">PGP Verifier</h2>

      <div className="my-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Signature file path"
            value={signatureFilePath}
            readOnly
            className="border p-1 w-full bg-gray-100 cursor-default"
          />
          <button
            onClick={selectSignatureFile}
            disabled={isLoading}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded border text-sm"
          >
            Browse
          </button>
        </div>
        {!signatureFilePath && !isLoading && (
          <p className="text-sm text-yellow-600 mt-1">Signature path required</p>
        )}
      </div>

      <div className="my-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Main file path"
            value={mainFilePath}
            readOnly
            className="border p-1 w-full bg-gray-100 cursor-default"
          />
          <button
            onClick={selectMainFile}
            disabled={isLoading}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded border text-sm"
          >
            Browse
          </button>
        </div>
        {!mainFilePath && !isLoading && (
          <p className="text-sm text-yellow-600 mt-1">Main file path required</p>
        )}
      </div>

      <button
        onClick={handleVerify}
        disabled={isLoading || !signatureFilePath || !mainFilePath}
        className={`mt-2 px-4 py-2 rounded ${isLoading || !signatureFilePath || !mainFilePath ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
      >
        {isLoading ? 'Verifying...' : 'Run Verification'}
      </button>

      {output && (
        <div className="mt-4">
          <label className="block font-bold">Result</label>
          <div className="flex items-center bg-gray-100 p-2 text-sm">
            {statusIcon}
            <span className="ml-2">{output}</span>
          </div>
        </div>
      )}
      {error && (
        <pre className="mt-4 bg-red-100 p-2 text-sm text-red-600">❌ {error}</pre>
      )}
    </div>
  );
};

export default PgpVerifier;
