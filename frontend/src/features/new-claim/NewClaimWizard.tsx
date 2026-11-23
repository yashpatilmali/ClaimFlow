import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Upload,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { api } from '../../lib/api-client';
import { useToast } from '../../components/ui/toast';

export const NewClaimWizard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const [policyNumber, setPolicyNumber] = useState('POL-882910');
  const [policyBoundDate, setPolicyBoundDate] = useState('2026-01-01');
  const [incidentDate, setIncidentDate] = useState('2026-11-08');
  const [claimantName, setClaimantName] = useState('Jordan Kelly');
  const [lossType, setLossType] = useState('Collision');
  const [narrative, setNarrative] = useState(
    'I was pulling into my parking spot at the grocery store and bumped into a concrete bollard at 5 mph. Damaged the front bumper cover and plastic lower grille.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Test Packets for "Fill from test packet" dropdown
  const { data: packets = [] } = useQuery({
    queryKey: ['test-packets'],
    queryFn: api.getTestPackets,
  });

  const handlePacketSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const packetId = e.target.value;
    if (!packetId) return;

    const selected = packets.find((p: any) => p.id === packetId);
    if (selected) {
      setPolicyNumber(selected.policy_number || 'POL-882910');
      setPolicyBoundDate(selected.policy_bound_date || '2026-01-01');
      setIncidentDate(selected.incident_date || '2026-11-08');
      setClaimantName(selected.claimant_name || 'Alex Mercer');
      setLossType(selected.loss_type || 'Collision');
      setNarrative(selected.full_narrative || selected.story || '');
      showToast(`Loaded ${selected.name}`, 'info');
    }
  };

  const handleFileChange = (file: File | null) => {
    setInvoiceError(null);
    if (!file) {
      setInvoiceFile(null);
      return;
    }
    // Validation: PDF only, max 10MB
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setInvoiceError('Only PDF repair invoices are accepted. Please select a valid .pdf file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setInvoiceError('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }
    setInvoiceFile(file);
  };

  const validateStep2 = () => {
    if (!policyNumber.trim()) {
      showToast('Policy number is required.', 'error');
      return false;
    }
    if (narrative.trim().length < 20) {
      showToast('Incident narrative must be at least 20 characters.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      showToast('Submitting FNOL document packet…', 'info');

      const formData = new FormData();
      formData.append('narrative', narrative);
      formData.append('policy_number', policyNumber);
      formData.append('policy_bound_date', policyBoundDate);
      formData.append('claimant_name', claimantName);
      formData.append('loss_type', lossType);
      if (invoiceFile) {
        formData.append('invoice_file', invoiceFile);
      }

      const res = await api.submitClaim(formData);
      const claimId = res.claim_id;

      showToast(`Claim ${claimId} created! Launching orchestrator…`, 'success');
      navigate(`/claims/${claimId}?view=run`);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit claim', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header with Quick Fill Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">New Claim Intake</h1>
          <p className="text-xs text-muted mt-0.5">
            Follow the 3-step First Notice of Loss (FNOL) wizard.
          </p>
        </div>

        {/* Fill from test packet dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="test-packet-select" className="text-xs text-muted font-medium whitespace-nowrap">
            Fill from packet:
          </label>
          <select
            id="test-packet-select"
            onChange={handlePacketSelect}
            className="h-8 rounded-input border border-field-border bg-surface px-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-status-processing"
            defaultValue=""
          >
            <option value="" disabled>
              Select a test case…
            </option>
            {packets.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.id.substring(0, 4)}: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step Progress Tracker */}
      <div className="flex items-center justify-between border-b border-rule pb-4">
        <div className="flex items-center gap-2">
          <span
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold tnum ${
              step >= 1 ? 'bg-ink text-surface' : 'bg-rule text-muted'
            }`}
          >
            1
          </span>
          <span className={`text-xs font-medium ${step >= 1 ? 'text-ink' : 'text-muted'}`}>
            Documents
          </span>
        </div>
        <div className="flex-1 h-[1px] bg-rule mx-4" />

        <div className="flex items-center gap-2">
          <span
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold tnum ${
              step >= 2 ? 'bg-ink text-surface' : 'bg-rule text-muted'
            }`}
          >
            2
          </span>
          <span className={`text-xs font-medium ${step >= 2 ? 'text-ink' : 'text-muted'}`}>
            Incident details
          </span>
        </div>
        <div className="flex-1 h-[1px] bg-rule mx-4" />

        <div className="flex items-center gap-2">
          <span
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold tnum ${
              step === 3 ? 'bg-ink text-surface' : 'bg-rule text-muted'
            }`}
          >
            3
          </span>
          <span className={`text-xs font-medium ${step === 3 ? 'text-ink' : 'text-muted'}`}>
            Review & submit
          </span>
        </div>
      </div>

      {/* STEP 1: Documents */}
      {step === 1 && (
        <div className="rounded-panel border border-rule bg-surface p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Repair Invoice Document (PDF)</h2>
            <p className="text-xs text-muted mt-0.5">
              Upload the mechanic estimate or repair invoice PDF. Line items, hours, and rates will be extracted and benchmarked.
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-panel p-8 text-center transition-colors ${
              invoiceFile
                ? 'border-status-approved/50 bg-status-approved-bg/20'
                : invoiceError
                ? 'border-status-denied/50 bg-status-denied-bg/20'
                : 'border-rule hover:border-field-border bg-paper/50'
            }`}
          >
            {invoiceFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileCheck className="h-10 w-10 text-status-approved" />
                <span className="text-sm font-semibold text-ink">{invoiceFile.name}</span>
                <span className="text-xs text-muted tnum">
                  {(invoiceFile.size / 1024).toFixed(1)} KB · Ready for processing
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInvoiceFile(null)}
                  className="mt-2 text-xs text-status-denied hover:text-status-denied"
                >
                  Remove document
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-8 w-8 text-muted" />
                <div>
                  <label
                    htmlFor="invoice-upload-input"
                    className="cursor-pointer font-semibold text-sm text-ink hover:underline"
                  >
                    Click to select an invoice PDF
                  </label>
                  <span className="text-sm text-muted"> or drag and drop</span>
                  <p className="text-xs text-muted mt-1">PDF format up to 10MB</p>
                </div>
                <input
                  id="invoice-upload-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {invoiceError && (
            <div className="flex items-center gap-2 p-3 rounded-input bg-status-denied-bg text-status-denied text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{invoiceError}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-rule">
            <span className="text-xs text-muted">
              {invoiceFile ? '1 document attached' : 'Optional: Proceeding without PDF uses pure narrative intake'}
            </span>
            <Button variant="primary" size="md" onClick={() => setStep(2)}>
              <span>Next: Incident details</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Incident Details */}
      {step === 2 && (
        <div className="rounded-panel border border-rule bg-surface p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Incident Narrative & Coverage Information</h2>
            <p className="text-xs text-muted mt-0.5">
              Enter the policyholder statement and reported loss circumstances.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Policy Number"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="POL-882910"
              helperText="Active auto policy ID"
            />

            <Input
              label="Claimant Name"
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              placeholder="Full name of insured driver"
            />

            <Input
              label="Policy Inception / Bound Date"
              type="date"
              value={policyBoundDate}
              onChange={(e) => setPolicyBoundDate(e.target.value)}
              helperText="Date policy coverage began"
            />

            <Input
              label="Incident Date (Date of Loss)"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              helperText="Must fall within active policy term"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-ink">Loss Type Category</label>
            <select
              value={lossType}
              onChange={(e) => setLossType(e.target.value)}
              className="h-10 w-full rounded-input border border-field-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-status-processing"
            >
              <option value="Collision">Collision (Impact with vehicle, stationary object, or road barrier)</option>
              <option value="Comprehensive">Comprehensive (Weather, hail, animal impact, windshield, theft)</option>
              <option value="Liability">Liability (Third-party property damage only)</option>
            </select>
          </div>

          <Textarea
            label="Claimant Incident Description (Narrative)"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={4}
            maxLength={1000}
            showCount
            helperText="Describe what happened, where, speed, impact mechanism, and any third parties involved."
          />

          <div className="flex justify-between items-center pt-4 border-t border-rule">
            <Button variant="secondary" size="md" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (validateStep2()) setStep(3);
              }}
            >
              <span>Next: Review & submit</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <div className="rounded-panel border border-rule bg-surface p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Confirm FNOL Document Packet</h2>
            <p className="text-xs text-muted mt-0.5">
              Review details before launching the multi-agent adjudication pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule rounded-input p-4 bg-paper/50 text-xs">
            <div>
              <span className="text-muted block">Policy Number:</span>
              <span className="font-semibold text-ink font-payload">{policyNumber}</span>
            </div>
            <div>
              <span className="text-muted block">Claimant:</span>
              <span className="font-semibold text-ink">{claimantName}</span>
            </div>
            <div>
              <span className="text-muted block">Date of Loss:</span>
              <span className="font-semibold text-ink tnum">{incidentDate}</span>
            </div>
            <div>
              <span className="text-muted block">Coverage Loss Type:</span>
              <span className="font-semibold text-ink">{lossType}</span>
            </div>
            <div>
              <span className="text-muted block">Attached Invoice PDF:</span>
              <span className="font-semibold text-ink">
                {invoiceFile ? invoiceFile.name : 'None (Narrative-only extraction)'}
              </span>
            </div>
            <div>
              <span className="text-muted block">Policy Bound Date:</span>
              <span className="font-semibold text-ink tnum">{policyBoundDate}</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-muted block mb-1">Claimant Narrative Statement:</span>
            <div className="p-3 rounded-input bg-paper border border-rule text-xs font-document text-ink/90 italic leading-relaxed">
              "{narrative}"
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-rule">
            <Button variant="secondary" size="md" onClick={() => setStep(2)} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Submitting & launching…' : 'Submit claim & run agents'}</span>
              <CheckCircle2 className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
