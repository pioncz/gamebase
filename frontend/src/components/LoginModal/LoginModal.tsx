import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import { useState } from 'react';

const LoginModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const disabled = !email || !password;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'email') {
      setEmail(e.target.value);
    } else if (e.target.name === 'password') {
      setPassword(e.target.value);
    }
  };

  const handleSubmit = () => {
    onSubmit({ email, password });
  };

  return (
    <Modal className="modal--login" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h3>Login</h3>
        <div>
          <label>Email</label>
          <input
            name="email"
            placeholder={'Email'}
            onChange={handleChange}
            value={email}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            name="password"
            placeholder={'Password'}
            type="password"
            onChange={handleChange}
            value={email}
          />
        </div>
        <Button type="submit" disabled={disabled}>
          Submit
        </Button>
      </form>
    </Modal>
  );
};

export default LoginModal;
