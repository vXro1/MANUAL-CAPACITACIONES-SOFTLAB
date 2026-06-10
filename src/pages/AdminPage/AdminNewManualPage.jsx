import { useNavigate } from 'react-router-dom';
import { ManualForm } from '@/features/manual-form/ManualForm';

export function AdminNewManualPage() {
  const navigate = useNavigate();
  return (
    <ManualForm
      isOpen={true}
      onClose={() => navigate(-1)}
      onSuccess={() => navigate('/panel-softlab-admin/manuales')}
    />
  );
}
