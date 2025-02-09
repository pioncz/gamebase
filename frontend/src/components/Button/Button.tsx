import { styled } from '@/lib/stitches.config';

const Button = ({
  children,
  ...respProps
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <Root className="button" {...respProps}>
      {children}
    </Root>
  );
};

const Root = styled('button', {
  border: '1px solid $primary',
  background: 'rgba(0,0,0,0.6)',
  color: '#e5ebed',
  display: 'inline-block',
  userSelect: 'none',
  cursor: 'pointer',
  padding: '$1 $2',
  borderRadius: '2px',
  transition: 'all .1s ease-in-out',
  margin: '$1',
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
  fontSize: '14px',
  fontWeight: '600',

  '&:hover:enabled': {
    background: '$primary',
  },

  '&:disabled': {
    opacity: '.3',
    cursor: 'default',
  },
});

export default Button;
