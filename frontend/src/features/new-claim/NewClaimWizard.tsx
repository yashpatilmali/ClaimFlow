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
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { api } from '../../lib/api-client';
import { useToast } from '../../components/ui/toast';
import { formatDate } from '../../lib/format';

const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Delhi',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Kerala',
  'Rajasthan',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Bihar',
  'Odisha',
];

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
  const [claimantName, setClaimantName] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('9876543210');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('400001');
  const [vehicleReg, setVehicleReg] = useState('MH 02 CE 4589');
  const [lossType, setLossType] = useState('Collision');
  const [narrative, setNarrative] = useState(
    'I was slowly reversing into a parking slot at the mall in Bandra, Mumbai and bumped into a low concrete pillar. Front bumper cover and lower grille got dented.'
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
      setClaimantName(selected.claimant_name || 'Rajesh Sharma');
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
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setInvoiceError('Please select a valid PDF repair invoice.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setInvoiceError('File size is larger than 10MB limit.');
      return;
    }
    setInvoiceFile(file);
  };

  const validateStep2 = () => {
    if (!policyNumber.trim()) {
      showToast('Policy number is required.', 'error');
      return false;
    }
    if (!claimantName.trim()) {
      showToast('Claimant name is required.', 'error');
      return false;
    }
    if (narrative.trim().length < 20) {
      showToast('Please describe what happened in at least 20 characters.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      showToast('Submitting claim…', 'info');

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

      showToast(`Claim ${claimId} created! Running checks…`, 'success');
      navigate(`/claims/${claimId}?view=run`);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit claim', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Quick Fill Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">New Claim</h1>
          <p className="text-xs text-muted mt-0.5">
            Fill in accident details and attach garage bills.
          </p>
        </div>

        {/* Fill from test packet dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="test-packet-select" className="text-xs text-muted font-medium whitespace-nowrap">
            Fill from sample:
          </label>
          <select
            id="test-packet-select"
            onChange={handlePacketSelect}
            className="h-8 rounded-input border border-field bg-surface px-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-status-processing"
            defaultValue=""
          >
            <option value="" disabled>
              Select sample case…
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
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold font-payload ${
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
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold font-payload ${
              step >= 2 ? 'bg-ink text-surface' : 'bg-rule text-muted'
            }`}
          >
            2
          </span>
          <span className={`text-xs font-medium ${step >= 2 ? 'text-ink' : 'text-muted'}`}>
            Accident details
          </span>
        </div>
        <div className="flex-1 h-[1px] bg-rule mx-4" />

        <div className="flex items-center gap-2">
          <span
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold font-payload ${
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
            <h2 className="text-sm font-semibold text-ink">Repair Bill or Estimate (PDF)</h2>
            <p className="text-xs text-muted mt-0.5">
              Upload the workshop bill or estimate. Parts and labor rates will be checked automatically.
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
                ? 'border-status-approved/50 bg-status-approved/5'
                : invoiceError
                ? 'border-status-denied/50 bg-status-denied/5'
                : 'border-rule hover:border-field bg-paper/50'
            }`}
          >
            {invoiceFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileCheck className="h-10 w-10 text-status-approved" />
                <span className="text-sm font-semibold text-ink">{invoiceFile.name}</span>
                <span className="text-xs text-muted font-payload">
                  {(invoiceFile.size / 1024).toFixed(1)} KB · Ready to scan
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInvoiceFile(null)}
                  className="mt-2 text-xs text-status-denied hover:text-status-denied"
                >
                  Remove bill
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
                    Click to select PDF bill
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
            <div className="flex items-center gap-2 p-3 rounded-input bg-status-denied/10 text-status-denied text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{invoiceError}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-rule">
            <span className="text-xs text-muted">
              {invoiceFile ? '1 document attached' : 'Optional: You can also proceed with description only'}
            </span>
            <Button variant="primary" size="sm" onClick={() => setStep(2)}>
              <span>Next: Accident details</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Incident Details */}
      {step === 2 && (
        <div className="rounded-panel border border-rule bg-surface p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Accident & Policy Details</h2>
            <p className="text-xs text-muted mt-0.5">
              Enter policyholder details, contact info, and what happened.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Policy Number"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="POL-882910"
              helperText="Active motor insurance policy number"
            />

            <Input
              label="Claimant Name"
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
            />

            <div>
              <label className="block text-xs font-medium text-ink mb-1">Mobile Number (+91)</label>
              <div className="flex rounded-input border border-field overflow-hidden">
                <span className="inline-flex items-center px-3 bg-paper text-xs text-muted border-r border-rule">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="flex-1 px-3 py-2 text-xs bg-surface text-ink focus:outline-none"
                />
              </div>
            </div>

            <Input
              label="Vehicle Registration Number"
              value={vehicleReg}
              onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
              placeholder="e.g. MH 02 CE 4589"
              helperText="Indian registration plate number"
            />

            <div>
              <label className="block text-xs font-medium text-ink mb-1">State</label>
              <select
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="h-9 w-full rounded-input border border-field bg-surface px-2.5 text-xs text-ink focus:outline-none"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="PIN Code"
              value={pinCode}
              maxLength={6}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 400001"
              helperText="6-digit postal PIN code"
            />

            <Input
              label="Policy Start Date"
              type="date"
              value={policyBoundDate}
              onChange={(e) => setPolicyBoundDate(e.target.value)}
            />

            <Input
              label="Date of Accident"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              helperText="Must be within policy active period"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-ink">Type of Damage</label>
            <select
              value={lossType}
              onChange={(e) => setLossType(e.target.value)}
              className="h-9 w-full rounded-input border border-field bg-surface px-2.5 text-xs text-ink focus:outline-none"
            >
              <option value="Collision">Collision (Accident with another vehicle, wall, or pillar)</option>
              <option value="Comprehensive">Comprehensive (Weather, flood, windshield glass, animal contact)</option>
              <option value="Liability">Third-party damage only</option>
            </select>
          </div>

          <Textarea
            label="What Happened (Accident Description)"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={3}
            maxLength={1000}
            showCount
            helperText="Describe where the accident happened, damages, and if another vehicle was involved."
          />

          <div className="flex justify-between items-center pt-4 border-t border-rule">
            <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (validateStep2()) setStep(3);
              }}
            >
              <span>Next: Review & submit</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <div className="rounded-panel border border-rule bg-surface p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Review Claim Details</h2>
            <p className="text-xs text-muted mt-0.5">
              Confirm details before starting automatic checks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule rounded-input p-4 bg-paper/50 text-xs">
            <div>
              <span className="text-muted block">Policy Number:</span>
              <span className="font-semibold text-ink font-payload">{policyNumber}</span>
            </div>
            <div>
              <span className="text-muted block">Claimant:</span>
              <span className="font-semibold text-ink">{claimantName} (+91 {phone})</span>
            </div>
            <div>
              <span className="text-muted block">Vehicle Registration:</span>
              <span className="font-semibold text-ink font-payload">{vehicleReg}</span>
            </div>
            <div>
              <span className="text-muted block">Location:</span>
              <span className="font-semibold text-ink">{stateName} ({pinCode})</span>
            </div>
            <div>
              <span className="text-muted block">Date of Accident:</span>
              <span className="font-semibold text-ink font-payload">{formatDate(incidentDate)}</span>
            </div>
            <div>
              <span className="text-muted block">Damage Type:</span>
              <span className="font-semibold text-ink">{lossType}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted block">Attached Bill:</span>
              <span className="font-semibold text-ink">
                {invoiceFile ? invoiceFile.name : 'None (Description only)'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-muted block mb-1">Accident Description:</span>
            <div className="p-3 rounded-input bg-paper border border-rule text-xs font-document text-ink/90 italic leading-relaxed">
              "{narrative}"
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-rule">
            <Button variant="secondary" size="sm" onClick={() => setStep(2)} disabled={isSubmitting}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Checking claim…' : 'Submit claim & check'}</span>
              <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
