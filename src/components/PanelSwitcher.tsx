import React, { useState } from 'react';
import PgpVerifier from './PgpVerifier';
import ChecksumVerifier from './ChecksumVerifier';

type Panel = 'pgp' | 'checksum';

const PanelSwitcher: React.FC = () => {
  const [active, setActive] = useState<Panel>('pgp');

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${active === 'pgp' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActive('pgp')}
        >
          PGP Verifier
        </button>
        <button
          className={`px-4 py-2 rounded ${active === 'checksum' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActive('checksum')}
        >
          Checksum Verifier
        </button>
      </div>
      <div>
        {active === 'pgp' ? <PgpVerifier /> : <ChecksumVerifier />}
      </div>
    </div>
  );
};

export default PanelSwitcher;
