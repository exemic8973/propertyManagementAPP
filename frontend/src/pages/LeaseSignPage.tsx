import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api, { WizardData, LeaseTemplate, LeaseSignDocument } from '../services/api';

const initialWizardData: WizardData = {
  landlord: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'TX',
    zip: '',
  },
  tenant: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
  },
  property: {
    address: '',
    city: '',
    state: 'TX',
    zip: '',
    propertyType: 'single_family',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 0,
    furnished: false,
  },
  terms: {
    startDate: '',
    endDate: '',
    leaseType: 'fixed',
    isRenewal: false,
  },
  rent: {
    monthlyRent: 0,
    securityDeposit: 0,
    petDeposit: 0,
    petRent: 0,
    lateFee: 50,
    gracePeriod: 5,
    rentDueDay: 1,
    paymentMethods: ['check', 'bank_transfer'],
  },
  rules: {
    smokingAllowed: false,
    petAllowed: false,
    petDetails: '',
    guestPolicy: 'Guests may stay up to 14 consecutive days with landlord approval.',
    quietHours: '10:00 PM - 8:00 AM',
    subletAllowed: false,
    alterationsAllowed: false,
  },
  additional: {
    utilities: ['electricity', 'gas', 'water', 'internet'],
    appliances: ['refrigerator', 'stove', 'dishwasher', 'microwave'],
    parkingSpaces: 1,
    parkingFee: 0,
    storageIncluded: false,
    specialProvisions: '',
    leadPaintDisclosure: true,
    moldDisclosure: true,
  },
  additionalTenants: [],
  otherOccupants: [],
};

const steps = [
  { id: 1, name: 'Parties', icon: '👥' },
  { id: 2, name: 'Property', icon: '🏠' },
  { id: 3, name: 'Terms', icon: '📅' },
  { id: 4, name: 'Rent', icon: '💰' },
  { id: 5, name: 'Rules', icon: '📋' },
  { id: 6, name: 'Additional', icon: '📝' },
];

const LeaseSignPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<LeaseTemplate[]>([]);
  const [savingAsTemplate, setSavingAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    loadTemplates();
    if (editId) {
      loadDocument(editId);
    }
  }, [editId]);

  const loadTemplates = async () => {
    const result = await api.templates.getAll();
    if (result.data) {
      setTemplates(result.data.templates);
    }
  };

  const loadDocument = async (id: string) => {
    setLoading(true);
    const result = await api.leaseSign.getDocument(id);
    if (result.data) {
      // Merge with initial data to ensure all fields have defaults
      const loadedData = result.data.document.wizard_data || {};
      setWizardData({
        ...initialWizardData,
        ...loadedData,
        landlord: { ...initialWizardData.landlord, ...loadedData.landlord },
        tenant: { ...initialWizardData.tenant, ...loadedData.tenant },
        property: { ...initialWizardData.property, ...loadedData.property },
        terms: { ...initialWizardData.terms, ...loadedData.terms },
        rent: { ...initialWizardData.rent, ...loadedData.rent },
        rules: { ...initialWizardData.rules, ...loadedData.rules },
        additional: { ...initialWizardData.additional, ...loadedData.additional },
        additionalTenants: loadedData.additionalTenants || [],
        otherOccupants: loadedData.otherOccupants || [],
      });
    }
    setLoading(false);
  };

  const applyTemplate = (template: LeaseTemplate) => {
    setWizardData(template.template_data);
    setShowTemplates(false);
  };

  const updateWizardData = (section: keyof WizardData, data: any) => {
    setWizardData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const updateArray = (section: keyof WizardData, field: string, value: string, checked: boolean) => {
    setWizardData(prev => {
      const sectionData = prev[section] as any;
      const currentArray = sectionData[field] || [];
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: checked
            ? [...currentArray, value]
            : currentArray.filter((item: string) => item !== value),
        },
      };
    });
  };

  const addAdditionalTenant = () => {
    setWizardData(prev => ({
      ...prev,
      additionalTenants: [
        ...(prev.additionalTenants || []),
        { firstName: '', lastName: '', email: '', relationship: '' },
      ],
    }));
  };

  const updateAdditionalTenant = (index: number, field: string, value: string) => {
    setWizardData(prev => ({
      ...prev,
      additionalTenants: prev.additionalTenants?.map((t, i) =>
        i === index ? { ...t, [field]: value } : t
      ),
    }));
  };

  const removeAdditionalTenant = (index: number) => {
    setWizardData(prev => ({
      ...prev,
      additionalTenants: prev.additionalTenants?.filter((_, i) => i !== index),
    }));
  };

  const addOtherOccupant = () => {
    setWizardData(prev => ({
      ...prev,
      otherOccupants: [
        ...(prev.otherOccupants || []),
        { name: '', age: 0, relationship: '' },
      ],
    }));
  };

  const updateOtherOccupant = (index: number, field: string, value: string | number) => {
    setWizardData(prev => ({
      ...prev,
      otherOccupants: prev.otherOccupants?.map((o, i) =>
        i === index ? { ...o, [field]: value } : o
      ),
    }));
  };

  const removeOtherOccupant = (index: number) => {
    setWizardData(prev => ({
      ...prev,
      otherOccupants: prev.otherOccupants?.filter((_, i) => i !== index),
    }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          wizardData.landlord?.firstName &&
          wizardData.landlord?.lastName &&
          wizardData.landlord?.email &&
          wizardData.tenant?.firstName &&
          wizardData.tenant?.lastName &&
          wizardData.tenant?.email
        );
      case 2:
        return !!(
          wizardData.property?.address &&
          wizardData.property?.city &&
          wizardData.property?.zip
        );
      case 3:
        return !!(wizardData.terms?.startDate && wizardData.terms?.endDate);
      case 4:
        return !!(wizardData.rent?.monthlyRent && wizardData.rent?.monthlyRent > 0);
      case 5:
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    if (editId) {
      await api.leaseSign.updateDocument(editId, wizardData);
    } else {
      await api.leaseSign.createDocument(wizardData);
    }
    setSaving(false);
    navigate('/lease-sign/documents');
  };

  const handleSendForSignature = async () => {
    setSaving(true);
    let documentId = editId;

    if (!documentId) {
      const createResult = await api.leaseSign.createDocument(wizardData);
      if (createResult.data) {
        documentId = createResult.data.document.id;
      }
    } else {
      await api.leaseSign.updateDocument(documentId, wizardData);
    }

    if (documentId) {
      const sendResult = await api.leaseSign.sendForSignature(documentId);
      if (sendResult.data) {
        navigate('/lease-sign/documents');
      }
    }
    setSaving(false);
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) return;
    setSaving(true);
    await api.templates.create(templateName, wizardData);
    setSavingAsTemplate(false);
    setTemplateName('');
    loadTemplates();
    setSaving(false);
  };

  const renderStepIndicator = () => (
    <div className="step-indicator" style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '10px' }}>
      {steps.map(step => (
        <div
          key={step.id}
          onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '25px',
            cursor: step.id <= currentStep ? 'pointer' : 'default',
            backgroundColor: step.id === currentStep ? '#2563eb' : step.id < currentStep ? '#10b981' : '#e5e7eb',
            color: step.id <= currentStep ? 'white' : '#6b7280',
            transition: 'all 0.3s',
          }}
        >
          <span>{step.icon}</span>
          <span style={{ fontWeight: 500 }}>{step.name}</span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="step-content">
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>1. Parties Information</h2>
      
      {/* Landlord Section */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>👤 Landlord Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>First Name *</label>
            <input
              type="text"
              value={wizardData.landlord?.firstName || ''}
              onChange={e => updateWizardData('landlord', { firstName: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="John"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Last Name *</label>
            <input
              type="text"
              value={wizardData.landlord?.lastName || ''}
              onChange={e => updateWizardData('landlord', { lastName: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="Smith"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Email *</label>
            <input
              type="email"
              value={wizardData.landlord?.email || ''}
              onChange={e => updateWizardData('landlord', { email: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="landlord@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Phone</label>
            <input
              type="tel"
              value={wizardData.landlord?.phone || ''}
              onChange={e => updateWizardData('landlord', { phone: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="(555) 123-4567"
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Address</label>
            <input
              type="text"
              value={wizardData.landlord?.address || ''}
              onChange={e => updateWizardData('landlord', { address: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="123 Main St"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>City</label>
            <input
              type="text"
              value={wizardData.landlord?.city || ''}
              onChange={e => updateWizardData('landlord', { city: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="Houston"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>State</label>
            <input
              type="text"
              value={wizardData.landlord?.state || ''}
              onChange={e => updateWizardData('landlord', { state: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="TX"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>ZIP</label>
            <input
              type="text"
              value={wizardData.landlord?.zip || ''}
              onChange={e => updateWizardData('landlord', { zip: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="77001"
            />
          </div>
        </div>
      </div>

      {/* Tenant Section */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>👤 Tenant Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>First Name *</label>
            <input
              type="text"
              value={wizardData.tenant?.firstName || ''}
              onChange={e => updateWizardData('tenant', { firstName: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="Jane"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Last Name *</label>
            <input
              type="text"
              value={wizardData.tenant?.lastName || ''}
              onChange={e => updateWizardData('tenant', { lastName: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="Doe"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Email *</label>
            <input
              type="email"
              value={wizardData.tenant?.email || ''}
              onChange={e => updateWizardData('tenant', { email: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="tenant@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Phone</label>
            <input
              type="tel"
              value={wizardData.tenant?.phone || ''}
              onChange={e => updateWizardData('tenant', { phone: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="(555) 987-6543"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Date of Birth</label>
            <input
              type="date"
              value={wizardData.tenant?.dateOfBirth || ''}
              onChange={e => updateWizardData('tenant', { dateOfBirth: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Emergency Contact</label>
            <input
              type="text"
              value={wizardData.tenant?.emergencyContact || ''}
              onChange={e => updateWizardData('tenant', { emergencyContact: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="Contact Name"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Emergency Phone</label>
            <input
              type="tel"
              value={wizardData.tenant?.emergencyPhone || ''}
              onChange={e => updateWizardData('tenant', { emergencyPhone: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="(555) 111-2222"
            />
          </div>
        </div>
      </div>

      {/* Additional Tenants */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: '#374151' }}>👥 Additional Tenants (Co-signers)</h3>
          <button
            onClick={addAdditionalTenant}
            style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            + Add Co-tenant
          </button>
        </div>
        {wizardData.additionalTenants?.map((tenant, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
            <input
              type="text"
              value={tenant.firstName}
              onChange={e => updateAdditionalTenant(index, 'firstName', e.target.value)}
              placeholder="First Name"
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={tenant.lastName}
              onChange={e => updateAdditionalTenant(index, 'lastName', e.target.value)}
              placeholder="Last Name"
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="email"
              value={tenant.email}
              onChange={e => updateAdditionalTenant(index, 'email', e.target.value)}
              placeholder="Email"
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={tenant.relationship}
              onChange={e => updateAdditionalTenant(index, 'relationship', e.target.value)}
              placeholder="Relationship"
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <button
              onClick={() => removeAdditionalTenant(index)}
              style={{ padding: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Other Occupants */}
      <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: '#374151' }}>👨‍👩‍👧‍👦 Other Occupants (Minors/Dependents)</h3>
          <button
            onClick={addOtherOccupant}
            style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            + Add Occupant
          </button>
        </div>
        {wizardData.otherOccupants?.map((occupant, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
            <input
              type="text"
              value={occupant.name}
              onChange={e => updateOtherOccupant(index, 'name', e.target.value)}
              placeholder="Full Name"
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="number"
              value={occupant.age}
              onChange={e => updateOtherOccupant(index, 'age', parseInt(e.target.value) || 0)}
              placeholder="Age"
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={occupant.relationship}
              onChange={e => updateOtherOccupant(index, 'relationship', e.target.value)}
              placeholder="Relationship"
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <button
              onClick={() => removeOtherOccupant(index)}
              style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>2. Property Information</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Street Address *</label>
          <input
            type="text"
            value={wizardData.property?.address || ''}
            onChange={e => updateWizardData('property', { address: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            placeholder="456 Oak Avenue"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>City *</label>
          <input
            type="text"
            value={wizardData.property?.city || ''}
            onChange={e => updateWizardData('property', { city: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            placeholder="Austin"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>State</label>
          <input
            type="text"
            value={wizardData.property?.state || ''}
            onChange={e => updateWizardData('property', { state: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            placeholder="TX"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>ZIP Code *</label>
          <input
            type="text"
            value={wizardData.property?.zip || ''}
            onChange={e => updateWizardData('property', { zip: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            placeholder="78701"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Property Type</label>
          <select
            value={wizardData.property?.propertyType || 'single_family'}
            onChange={e => updateWizardData('property', { propertyType: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
          >
            <option value="single_family">Single Family</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="duplex">Duplex</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Bedrooms</label>
          <input
            type="number"
            value={wizardData.property?.bedrooms || 1}
            onChange={e => updateWizardData('property', { bedrooms: parseInt(e.target.value) || 0 })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            min="0"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Bathrooms</label>
          <input
            type="number"
            value={wizardData.property?.bathrooms || 1}
            onChange={e => updateWizardData('property', { bathrooms: parseFloat(e.target.value) || 0 })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            min="0"
            step="0.5"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Square Feet</label>
          <input
            type="number"
            value={wizardData.property?.squareFeet || 0}
            onChange={e => updateWizardData('property', { squareFeet: parseInt(e.target.value) || 0 })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            min="0"
          />
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wizardData.property?.furnished || false}
              onChange={e => updateWizardData('property', { furnished: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Furnished</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>3. Lease Terms</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Start Date *</label>
          <input
            type="date"
            value={wizardData.terms?.startDate || ''}
            onChange={e => updateWizardData('terms', { startDate: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>End Date *</label>
          <input
            type="date"
            value={wizardData.terms?.endDate || ''}
            onChange={e => updateWizardData('terms', { endDate: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Lease Type</label>
          <select
            value={wizardData.terms?.leaseType || 'fixed'}
            onChange={e => updateWizardData('terms', { leaseType: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
          >
            <option value="fixed">Fixed Term</option>
            <option value="month_to_month">Month-to-Month</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wizardData.terms?.isRenewal || false}
              onChange={e => updateWizardData('terms', { isRenewal: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span>This is a renewal lease</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>4. Rent & Deposits</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Monthly Rent *</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontSize: '18px' }}>$</span>
            <input
              type="number"
              value={wizardData.rent?.monthlyRent || 0}
              onChange={e => updateWizardData('rent', { monthlyRent: parseFloat(e.target.value) || 0 })}
              style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Security Deposit</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontSize: '18px' }}>$</span>
            <input
              type="number"
              value={wizardData.rent?.securityDeposit || 0}
              onChange={e => updateWizardData('rent', { securityDeposit: parseFloat(e.target.value) || 0 })}
              style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Pet Deposit</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontSize: '18px' }}>$</span>
            <input
              type="number"
              value={wizardData.rent?.petDeposit || 0}
              onChange={e => updateWizardData('rent', { petDeposit: parseFloat(e.target.value) || 0 })}
              style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Monthly Pet Rent</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontSize: '18px' }}>$</span>
            <input
              type="number"
              value={wizardData.rent?.petRent || 0}
              onChange={e => updateWizardData('rent', { petRent: parseFloat(e.target.value) || 0 })}
              style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Late Fee</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontSize: '18px' }}>$</span>
            <input
              type="number"
              value={wizardData.rent?.lateFee || 0}
              onChange={e => updateWizardData('rent', { lateFee: parseFloat(e.target.value) || 0 })}
              style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Grace Period (days)</label>
          <input
            type="number"
            value={wizardData.rent?.gracePeriod || 5}
            onChange={e => updateWizardData('rent', { gracePeriod: parseInt(e.target.value) || 0 })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            min="0"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Rent Due Day</label>
          <input
            type="number"
            value={wizardData.rent?.rentDueDay || 1}
            onChange={e => updateWizardData('rent', { rentDueDay: parseInt(e.target.value) || 1 })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            min="1"
            max="28"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Prorated First Month Rent</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontSize: '18px' }}>$</span>
            <input
              type="number"
              value={wizardData.rent?.proratedRent || 0}
              onChange={e => updateWizardData('rent', { proratedRent: parseFloat(e.target.value) || 0 })}
              style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500 }}>Payment Methods Accepted</label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {['check', 'bank_transfer', 'credit_card', 'cash', 'online_payment'].map(method => (
              <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={wizardData.rent?.paymentMethods?.includes(method) || false}
                  onChange={e => updateArray('rent', 'paymentMethods', method, e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ textTransform: 'capitalize' }}>{method.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="step-content">
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>5. Rules & Restrictions</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wizardData.rules?.smokingAllowed || false}
              onChange={e => updateWizardData('rules', { smokingAllowed: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Smoking Allowed</span>
          </label>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wizardData.rules?.petAllowed || false}
              onChange={e => updateWizardData('rules', { petAllowed: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Pets Allowed</span>
          </label>
        </div>
        {wizardData.rules?.petAllowed && (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Pet Details</label>
            <textarea
              value={wizardData.rules?.petDetails || ''}
              onChange={e => updateWizardData('rules', { petDetails: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px' }}
              placeholder="Describe allowed pets, breed restrictions, weight limits, etc."
            />
          </div>
        )}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wizardData.rules?.subletAllowed || false}
              onChange={e => updateWizardData('rules', { subletAllowed: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Subletting Allowed</span>
          </label>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wizardData.rules?.alterationsAllowed || false}
              onChange={e => updateWizardData('rules', { alterationsAllowed: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Alterations Allowed</span>
          </label>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Guest Policy</label>
          <textarea
            value={wizardData.rules?.guestPolicy || ''}
            onChange={e => updateWizardData('rules', { guestPolicy: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px' }}
            placeholder="Guest policy details..."
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Quiet Hours</label>
          <input
            type="text"
            value={wizardData.rules?.quietHours || ''}
            onChange={e => updateWizardData('rules', { quietHours: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            placeholder="10:00 PM - 8:00 AM"
          />
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="step-content">
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>6. Additional Information</h2>
      
      {/* Utilities */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>⚡ Utilities (Tenant Responsibility)</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {['electricity', 'gas', 'water', 'sewer', 'trash', 'internet', 'cable', 'landscaping'].map(utility => (
            <label key={utility} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={wizardData.additional?.utilities?.includes(utility) || false}
                onChange={e => updateArray('additional', 'utilities', utility, e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ textTransform: 'capitalize' }}>{utility}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Appliances */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>🏠 Appliances Included</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {['refrigerator', 'stove', 'oven', 'dishwasher', 'microwave', 'washer', 'dryer', 'garbage_disposal'].map(appliance => (
            <label key={appliance} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={wizardData.additional?.appliances?.includes(appliance) || false}
                onChange={e => updateArray('additional', 'appliances', appliance, e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ textTransform: 'capitalize' }}>{appliance.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Parking & Storage */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>🚗 Parking & Storage</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Parking Spaces</label>
            <input
              type="number"
              value={wizardData.additional?.parkingSpaces || 0}
              onChange={e => updateWizardData('additional', { parkingSpaces: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              min="0"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Monthly Parking Fee</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px', fontSize: '18px' }}>$</span>
              <input
                type="number"
                value={wizardData.additional?.parkingFee || 0}
                onChange={e => updateWizardData('additional', { parkingFee: parseFloat(e.target.value) || 0 })}
                style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={wizardData.additional?.storageIncluded || false}
                onChange={e => updateWizardData('additional', { storageIncluded: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Storage Space Included</span>
            </label>
          </div>
        </div>
      </div>

      {/* Disclosures */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>📋 Required Disclosures</h3>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wizardData.additional?.leadPaintDisclosure || false}
              onChange={e => updateWizardData('additional', { leadPaintDisclosure: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Lead Paint Disclosure (pre-1978)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wizardData.additional?.moldDisclosure || false}
              onChange={e => updateWizardData('additional', { moldDisclosure: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Mold Disclosure</span>
          </label>
        </div>
      </div>

      {/* Special Provisions */}
      <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>📝 Special Provisions</h3>
        <textarea
          value={wizardData.additional?.specialProvisions || ''}
          onChange={e => updateWizardData('additional', { specialProvisions: e.target.value })}
          style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '120px' }}
          placeholder="Enter any special provisions, additional terms, or notes..."
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '15px', color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Navigation />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
            {editId ? 'Edit Lease Document' : 'Create New Lease'}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              📋 Templates
            </button>
          </div>
        </div>

        {/* Template Selector */}
        {showTemplates && (
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '15px' }}>Select a Template</h3>
            {templates.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No templates available. Save a lease as template to see it here.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {templates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    style={{
                      padding: '15px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  >
                    <div style={{ fontWeight: 500 }}>{template.name}</div>
                    {template.description && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>{template.description}</div>
                    )}
                    {template.is_public && <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '5px' }}>🌐 Public</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ padding: '30px' }}>
            {renderCurrentStep()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              style={{
                padding: '12px 24px',
                backgroundColor: currentStep === 1 ? '#e5e7eb' : '#6b7280',
                color: currentStep === 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
              }}
            >
              ← Back
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            
            {currentStep < 6 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: canProceed() ? '#2563eb' : '#93c5fd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                }}
              >
                Next →
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSavingAsTemplate(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  💾 Save as Template
                </button>
                <button
                  onClick={handleSendForSignature}
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  {saving ? 'Processing...' : '✉️ Send for Signature'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save as Template Modal */}
        {savingAsTemplate && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px' }}>
              <h3 style={{ marginBottom: '15px' }}>Save as Template</h3>
              <input
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="Template name..."
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '15px' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSavingAsTemplate(false)}
                  style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={saving || !templateName.trim()}
                  style={{ padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LeaseSignPage;
