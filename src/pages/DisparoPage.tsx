import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import Disparo from '@/components/Disparo';
import UploadAudioTest from '@/components/UploadAudioTest';

const DisparoPage = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Disparo 🚀"
        description="Gerencie seus disparos de mensagens"
        onTitleChange={() => {}}
        onDescriptionChange={() => {}}
      />
      <div className="mt-6">
        <Disparo />
      </div>
    </PageLayout>
  );
};

export default DisparoPage;