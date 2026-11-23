import React from 'react';
import { Tooltip } from './tooltip';
import { getGlossaryTerm } from '../../lib/glossary';

export interface TermProps {
  termKey: string;
  children?: React.ReactNode;
}

export const Term: React.FC<TermProps> = ({ termKey, children }) => {
  const item = getGlossaryTerm(termKey);
  const displayText = children || item?.term || termKey;

  if (!item) {
    return <span>{displayText}</span>;
  }

  return (
    <Tooltip
      content={
        <div className="space-y-1">
          <p className="font-semibold text-highlighter">{item.term}</p>
          <p className="text-xs text-surface/90">{item.shortDefinition}</p>
        </div>
      }
    >
      <span className="cursor-help border-b border-dotted border-field-border font-medium hover:border-ink">
        {displayText}
      </span>
    </Tooltip>
  );
};
