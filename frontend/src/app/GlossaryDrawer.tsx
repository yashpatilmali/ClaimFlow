import React, { useState } from 'react';
import { Drawer, DrawerContent } from '../components/ui/drawer';
import { GLOSSARY } from '../lib/glossary';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

interface GlossaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');

  const terms = Object.values(GLOSSARY).filter(
    (item) =>
      item.term.toLowerCase().includes(query.toLowerCase()) ||
      item.fullDefinition.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        title="Insurance & System Glossary"
        description="Definitions of adjudication, governance, and model terms used in ClaimFlow."
      >
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <Input
              placeholder="Search glossary terms…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div className="space-y-4 divide-y divide-rule/60">
          {terms.map((item) => (
            <div key={item.term} className="pt-3 first:pt-0">
              <h4 className="text-sm font-semibold text-ink">{item.term}</h4>
              <p className="mt-1 text-xs text-muted leading-relaxed prose-reading">
                {item.fullDefinition}
              </p>
            </div>
          ))}

          {terms.length === 0 && (
            <p className="text-xs text-muted py-6 text-center">No matching glossary terms found.</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
