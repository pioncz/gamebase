import { useNavigate } from 'react-router';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { useCallback, useEffect } from 'react';

const RoomNonExistentModal = () => {
  const navigate = useNavigate();

  const redirect = useCallback(() => {
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      redirect();
    }, 5000);

    return () => {
      clearTimeout(redirectTimeout);
    };
  }, [redirect]);

  return (
    <Modal className="modal--registration">
      <h3>Taka gra nie istnieje</h3>
      <p>Zaraz zostaniesz przekierowany na stronę główną</p>
      <Button onClick={redirect}>NOWA GRA</Button>
    </Modal>
  );
};

export default RoomNonExistentModal;
