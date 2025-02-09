import { useContext, useEffect, useState } from 'react';
import './App.css';
import Header from '@/components/Header/Header';
import LoginModal from './components/LoginModal/LoginModal';
import RegistrationModal from './components/RegistrationModal/RegistrationModal';
import WSConnectorContext from './contexts/WSConnector/WSConnectorContext';
import { useSelector } from 'react-redux';
import {
  callLogin,
  callRegister,
  getPlayer,
  setPlayer,
} from './store/GameSlice';
import { useAppDispatch } from './store/store';
import NameModal from './components/NameModal/NameModal';
import FullscreenModal from './components/FullscreenModal/FullscreenModal';
import { Route, Routes } from 'react-router';
import HomePage from './pages/Home/Home';
import RoomPage from './pages/Room/Room';

function App() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] =
    useState(false);
  const [fullscreenModalVisible, setFullscreenModalVisible] =
    useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const { socket } = useContext(WSConnectorContext);
  const player = useSelector(getPlayer);
  const dispatch = useAppDispatch();

  const toggleLoginModal = () => {
    setLoginModalVisible((visible) => !visible);
  };

  const toggleRegistrationModal = () => {
    setRegistrationModalVisible((visible) => !visible);
  };

  const toggleFullscreenModal = () => {
    setFullscreenModalVisible((visible) => !visible);
  };

  const sendRegistrationModal = (payload: {
    email: string;
    login: string;
    password: string;
  }) => {
    dispatch(callRegister(payload));
  };

  const sendLoginModal = (payload: {
    email: string;
    password: string;
  }) => {
    dispatch(callLogin(payload));
  };

  const selectDice = (diceId: string) => {
    window.localStorage.diceId = diceId;
    socket?.emit('selectDice', { diceId });
    dispatch(setPlayer({ diceId }));
  };

  const sendNameModal = ({
    login,
    diceId,
  }: {
    login: string;
    diceId: string;
  }) => {
    window.localStorage.diceId = diceId;
    window.localStorage.login = login;
    socket?.emit('selectDice', { diceId });
    socket?.emit('selectLogin', { login });
    dispatch(setPlayer({ diceId, login }));
    setNameModalVisible(false);
  };

  useEffect(() => {
    if (player.state === 'loggedIn') {
      setLoginModalVisible(false);
      setRegistrationModalVisible(false);
    }
  }, [player]);

  return (
    <div>
      <Header
        selectDice={selectDice}
        toggleLoginModal={toggleLoginModal}
        toggleRegistrationModal={toggleRegistrationModal}
      />
      <div className="main">
        <Routes>
          <Route path="/" element={<HomePage />} index />
          <Route path="/room/:roomId" element={<RoomPage />} />
          {/* <Route path="/engine" element={<EnginePage />} />
          <Route path="/admin" element={<AdminPage />} /> */}
        </Routes>
      </div>
      {loginModalVisible && (
        <LoginModal
          onClose={toggleLoginModal}
          onSubmit={sendLoginModal}
        />
      )}
      {registrationModalVisible && (
        <RegistrationModal
          onClose={toggleRegistrationModal}
          onSubmit={sendRegistrationModal}
        />
      )}
      {nameModalVisible && <NameModal onSubmit={sendNameModal} />}
      {fullscreenModalVisible && (
        <FullscreenModal
          onToggle={toggleFullscreenModal}
          onClose={toggleFullscreenModal}
        />
      )}
    </div>
  );
}

export default App;
