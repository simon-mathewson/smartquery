import React from 'react';
import { useModal } from './useModal';
import type { ModalProps } from './Modal';
import { Modal } from './Modal';
import { TestApp } from '~/test/componentTests/TestApp';
import type { StoryProps } from '~/test/componentTests/StoryProps';

export type ModalStoryProps = StoryProps<Partial<ModalProps>>;

export const ModalStory: React.FC<ModalStoryProps> = ({ componentProps, testApp }) => {
  const modal = useModal();

  return (
    <TestApp {...testApp}>
      <Modal htmlProps={{ className: 'w-[200px]' }} {...modal} isOpen {...componentProps} />
    </TestApp>
  );
};
