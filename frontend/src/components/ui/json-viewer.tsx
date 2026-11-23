import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './button';

export interface JsonViewerProps {
  data: any;
  title?: string;
  maxHeight?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title, maxHeight = '360px' }) => {
  const [copied, setCopied] = useState(false);

  const formattedJson = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-input border border-rule bg-paper overflow-hidden">
      <div className="flex items-center justify-between border-b border-rule bg-surface/80 px-3 py-1.5">
        <span className="text-xs font-medium text-muted">{title || 'Payload (JSON)'}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2 text-xs">
          {copied ? (
            <>
              <Check className="h-3 w-3 text-status-approved" />
              <span className="text-status-approved">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      <div className="overflow-auto p-3" style={{ maxHeight }}>
        <pre className="font-payload text-xs text-ink/90 whitespace-pre-wrap leading-relaxed select-all">
          {formattedJson}
        </pre>
      </div>
    </div>
  );
};
