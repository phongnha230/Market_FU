import { useState, useEffect } from 'react';

export interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  formattedHours: string;
  formattedMinutes: string;
  formattedSeconds: string;
  isExpired: boolean;
  totalSeconds: number;
}

export function useCountdown(initialSeconds: number): CountdownResult {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    setSecondsRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  return {
    hours,
    minutes,
    seconds,
    formattedHours: hours.toString().padStart(2, '0'),
    formattedMinutes: minutes.toString().padStart(2, '0'),
    formattedSeconds: seconds.toString().padStart(2, '0'),
    isExpired: secondsRemaining <= 0,
    totalSeconds: secondsRemaining,
  };
}
