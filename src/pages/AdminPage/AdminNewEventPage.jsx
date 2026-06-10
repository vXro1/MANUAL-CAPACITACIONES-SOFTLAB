import { useNavigate } from 'react-router-dom';
import { EventForm } from '@/features/event-form/EventForm';

export function AdminNewEventPage() {
  const navigate = useNavigate();
  return (
    <EventForm
      isOpen={true}
      onClose={() => navigate(-1)}
      onSuccess={() => navigate('/panel-softlab-admin/eventos')}
    />
  );
}
