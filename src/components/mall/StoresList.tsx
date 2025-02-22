
import React from 'react';
import { PublicStoreCard } from './PublicStoreCard';
import { Store } from '@/types/store';
import { useNavigate } from 'react-router-dom';

interface StoresListProps {
  stores: Store[];
}

export const StoresList = ({ stores }: StoresListProps) => {
  const navigate = useNavigate();

  const handleStoreClick = (storeId: string) => {
    navigate(`/store/${storeId}`);
  };

  return (
    <>
      {stores.map((store) => (
        <PublicStoreCard
          key={store.id}
          store={store}
          onClick={() => handleStoreClick(store.id)}
        />
      ))}
    </>
  );
};
