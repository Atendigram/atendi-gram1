import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const TelegramPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/disparo', { replace: true });
  }, [navigate]);

  return null;
};

export default TelegramPage;