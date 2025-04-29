import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ChecksumVerifier: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [expectedChecksum, setExpectedChecksum] = useState('');
  const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-512'>('SHA-256');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusIcon, setStatusIcon] = useState<JSX.Element | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleVerify = async () => {
    setError(null);
    setOutput(null);
    setStatusIcon(null);
    if (!file) {
      setError('Please select a file to hash');
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const expected = expectedChecksum.trim().toLowerCase();
      const calculated = hashHex.toLowerCase();
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
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Checksum Verifier</h2>
      <input type="file" onChange={handleFileChange} className="my-2" />
      <input
        type="text"
        placeholder="Expected checksum"
        value={expectedChecksum}
        onChange={(e) => setExpectedChecksum(e.currentTarget.value)}
        className="border p-1 my-2 w-full"
      />
      <select
        value={algorithm}
        onChange={(e) => setAlgorithm(e.target.value as 'SHA-256' | 'SHA-512')}
        className="border p-1 my-2 w-full"
      >
        <option value="SHA-256">SHA-256</option>
        <option value="SHA-512">SHA-512</option>
      </select>
      <button
        onClick={handleVerify}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Run Verification
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
      {error && <pre className="mt-4 bg-red-100 p-2 text-sm text-red-600">{error}</pre>}
    </div>
  );
};
export default ChecksumVerifier;
