import { useNavigate } from 'react-router-dom';
import './BackButton.css';

/**
 * BackButton - Reusable back button component
 * Always navigates with explicit 'back' direction
 * 
 * Usage:
 * <BackButton />
 * <BackButton to="/" />
 * <BackButton onClick={customHandler} />
 */
export default function BackButton({ to = null, onClick = null, label = null }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      // Explicit back direction
      navigate(to, { state: { direction: 'back' } });
    } else {
      // Use history back with explicit direction
      navigate(-1);
    }
  };

  return (
    <button className="back-button" onClick={handleClick}>
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label && <span className="back-label">{label}</span>}
    </button>
  );
}
