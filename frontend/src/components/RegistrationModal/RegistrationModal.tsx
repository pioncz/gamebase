import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import { useState } from 'react';

const RegistrationModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: ({
    email,
    login,
    password,
  }: {
    email: string;
    login: string;
    password: string;
  }) => void;
}) => {
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const disabled = !login || !email || !password;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'email') {
      setEmail(e.target.value);
    } else if (e.target.name === 'password') {
      setPassword(e.target.value);
    } else if (e.target.name === 'login') {
      setLogin(e.target.value);
    }
  };

  const handleSubmit = () => {
    onSubmit({ email, login, password });
  };

  return (
    <Modal className="modal--registration" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h3>Registration</h3>
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
          <label>Login</label>
          <input
            name="login"
            placeholder={'Login'}
            onChange={handleChange}
            value={login}
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

export default RegistrationModal;
