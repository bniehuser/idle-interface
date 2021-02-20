import React, { FC, PropsWithChildren } from 'react';

interface ModalProps {
  visible: boolean;
}

const Modal: FC<PropsWithChildren<ModalProps>> = ({visible, children}) => {
  return visible ? <div className={'modal-screen'}>
    <div className={'interface'}>{children}</div>
  </div> : null;
};

export default Modal;
