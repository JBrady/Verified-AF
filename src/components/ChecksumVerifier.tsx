import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ChecksumVerifier: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [expectedChecksum, setExpectedChecksum] = useState('');
  const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-512'>('SHA-256');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusIcon, setStatusIcon] = useState<JSX.Element | null>(null);
  const [calculatedHash, setCalculatedHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleVerify = async () => {
    setError(null);
    setOutput(null);
    setStatusIcon(null);
    setCalculatedHash(null);
    if (!file || !expectedChecksum.trim()) {
      setError('File and expected checksum are required');
      return;
    }
    setIsLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const expected = expectedChecksum.trim().toLowerCase();
      const calculated = hashHex.toLowerCase();
      setCalculatedHash(calculated);
      let icon: JSX.Element | null = null;
      let summary: string;
      if (expected === calculated) {
        summary = `Checksum MATCHES (${algorithm})`;
        icon = <CheckCircleIcon width={16} height={16} strokeWidth={2} className="text-green-500 flex-shrink-0" />;
      } else {
        summary = `Checksum MISMATCH: Expected ${expected} vs Calculated ${calculated}`;
        icon = <XCircleIcon width={16} height={16} strokeWidth={2} className="text-red-500 flex-shrink-0" />;
      }
      setOutput(summary);
      setStatusIcon(icon);
    } catch (e: any) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Checksum Verifier</h2>
      <input type="file" onChange={handleFileChange} disabled={isLoading} className="my-2 disabled:opacity-50 disabled:cursor-not-allowed" />
      {!file && !isLoading && <p className="text-sm text-yellow-600">File required</p>}
      <input
        type="text"
        placeholder="Expected checksum"
        value={expectedChecksum}
        onChange={(e) => setExpectedChecksum(e.currentTarget.value)}
        disabled={isLoading}
        className="border p-1 my-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {!expectedChecksum.trim() && !isLoading && <p className="text-sm text-yellow-600">Checksum required</p>}
      <select
        value={algorithm}
        onChange={(e) => setAlgorithm(e.target.value as 'SHA-256' | 'SHA-512')}
        disabled={isLoading}
        className="border p-1 my-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="SHA-256">SHA-256</option>
        <option value="SHA-512">SHA-512</option>
      </select>
      <button
        onClick={handleVerify}
        disabled={isLoading || !file || !expectedChecksum.trim()}
        className={`px-4 py-2 rounded ${isLoading || !file || !expectedChecksum.trim() ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
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
      {error && <pre className="mt-4 bg-red-100 p-2 text-sm text-red-600">❌ {error}</pre>}
      {calculatedHash && (
        <div className="mt-2">
          <span className="block text-sm font-semibold">Calculated Hash:</span>
          <div className="flex items-center">
            <code className="bg-gray-100 p-1 text-sm break-all">{calculatedHash}</code>
            <button
              onClick={() => navigator.clipboard.writeText(calculatedHash)}
              className="ml-2 text-blue-500 underline text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecksumVerifier;
