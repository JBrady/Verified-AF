import React, { useState } from 'react';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const PgpVerifier: React.FC = () => {
	const [signatureFilePath, setSignatureFilePath] = useState('');
	const [mainFilePath, setMainFilePath] = useState('');
	const [output, setOutput] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [statusIcon, setStatusIcon] = useState<JSX.Element | null>(null);

	const handleVerify = async () => {
		console.log('handleVerify clicked', { signatureFilePath, mainFilePath });
		setError(null);
		setOutput(null);
		setStatusIcon(null);
		if (!isTauri()) {
			setError('Tauri environment not detected');
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
				icon = <CheckCircleIcon style={{ width: 16, height: 16 }} className="text-green-500 flex-shrink-0" />;
			} else if (raw.includes('not certified with a trusted signature')) {
				summary = 'Signature valid, but not trusted. You must verify the key fingerprint manually.';
				icon = <ExclamationTriangleIcon style={{ width: 16, height: 16 }} className="text-yellow-500 flex-shrink-0" />;
			} else if (raw.includes('BAD signature')) {
				summary = 'Bad signature!';
				icon = <XCircleIcon style={{ width: 16, height: 16 }} className="text-red-500 flex-shrink-0" />;
			} else {
				summary = raw;
				icon = null;
			}
			setOutput(summary);
			setStatusIcon(icon);
		} catch (e: any) {
			setOutput(null);
			setStatusIcon(null);
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
				placeholder="Signature file path"
				value={signatureFilePath}
				onChange={(e) => setSignatureFilePath(e.currentTarget.value)}
				className="border p-1 my-2 w-full"
			/>
			<input
				type="text"
				placeholder="Main file path"
				value={mainFilePath}
				onChange={(e) => setMainFilePath(e.currentTarget.value)}
				className="border p-1 my-2 w-full"
			/>
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
			{error && (
				<pre className="mt-4 bg-red-100 p-2 text-sm text-red-600">{error}</pre>
			)}
		</div>
	);
};

export default PgpVerifier;
