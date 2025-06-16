import React from 'react';
import { useModal } from './useModal';
import type { ModalProps } from './Modal';
import { Modal } from './Modal';

export type ModalStoryProps = Partial<ModalProps>;

export const ModalStory: React.FC<ModalStoryProps> = (props) => {
  const modal = useModal();

  return <Modal htmlProps={{ className: 'w-[200px]' }} {...modal} isOpen {...props} />;
};
