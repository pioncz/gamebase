import { styled } from '@/lib/stitches.config';
import { Player } from '@/lib/types';

const Profile = ({
  player,
  onClick,
}: {
  player: Player;
  onClick: () => void;
}) => {
  return (
    <Root onClick={onClick}>
      {player && (
        <Avatar
          style={{
            backgroundImage: `url(${player.avatar})`,
          }}
        ></Avatar>
      )}
      {player && <Name>{player.login}</Name>}
    </Root>
  );
};

const Root = styled('div', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

const Avatar = styled('div', {
  position: 'absolute',
  zIndex: 10,
  width: '35px',
  height: '35px',
  backgroundSize: 'cover',
  borderRadius: '50%',
});

const Name = styled('div', {
  position: 'absolute',
  zIndex: 5,
  left: '29px',
  padding: '2px 12px',
  background: 'rgba(0, 0, 0, 0.4)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.31)',
  boxShadow: 'inset 0px 0px 17px rgba(255, 255, 255, 0.23)',
  borderTopLeftRadius: '4px',
  borderBottomLeftRadius: '4px',
});

export default Profile;
