
import React from 'react';
import { PublicStoreCard } from './PublicStoreCard';
import { AdminStoreCard } from './AdminStoreCard';
import { Store } from '@/types/store';
import { useNavigate } from 'react-router-dom';

interface StoresListProps {
  stores: Store[];
  mallId?: string;
  mallUserId?: string;
  onStoreClick?: (storeId: string) => void;
  onEdit?: (storeId: string) => void;
  onDelete?: (storeId: string) => void;
}

export const StoresList = ({ 
  stores, 
  mallId, 
  mallUserId,
  onStoreClick, 
  onEdit, 
  onDelete 
}: StoresListProps) => {
  const navigate = useNavigate();
  const isAdminView = !!onEdit && !!onDelete;

  const handleStoreClick = (storeId: string) => {
    if (onStoreClick) {
      onStoreClick(storeId);
    } else {
      navigate(`/store/${storeId}`);
    }
  };

  return (
    <>
      {stores.map((store) => (
        isAdminView ? (
          <AdminStoreCard 
            key={store.id} 
            store={store}
            mallId={mallId || ''}
            mallUserId={mallUserId || ''}
            onClick={() => handleStoreClick(store.id)}
            onEdit={onEdit!}
            onDelete={onDelete!}
          />
        ) : (
          <PublicStoreCard 
            key={store.id} 
            store={store} 
            onClick={() => handleStoreClick(store.id)}
          />
        )
      ))}
    </>
  );
};
