import React, { useState } from 'react';
import { invoke, isTauri } from '@tauri-apps/api/core';

const PgpVerifier: React.FC = () => {
  const [sigPath, setSigPath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    console.log('handleVerify clicked', { sigPath, filePath });
    setError(null);
    setOutput(null);
    if (!isTauri()) {
      setError('Tauri environment not detected');
      return;
    }
    try {
      const result = await invoke<string>('verify_pgp_signature', {
        signaturePath: sigPath,
        filePath: filePath,
      });
      console.log('GPG verify output:', result);
      setOutput(result);
    } catch (e: any) {
      setOutput(null);
      // Convert thrown error object to string
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">PGP Verifier</h2>
      <input
        type="text"
        placeholder="Signature path"
        value={sigPath}
        onChange={(e) => setSigPath(e.currentTarget.value)}
        className="border p-1 my-2 w-full"
      />
      <input
        type="text"
        placeholder="File path"
        value={filePath}
        onChange={(e) => setFilePath(e.currentTarget.value)}
        className="border p-1 my-2 w-full"
      />
      <button
        onClick={handleVerify}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Verify
      </button>
      {output && (
        <pre className="mt-4 bg-gray-100 p-2 text-sm">{output}</pre>
      )}
      {error && (
        <pre className="mt-4 bg-red-100 p-2 text-sm text-red-600">{error}</pre>
      )}
    </div>
  );
};

export default PgpVerifier;
