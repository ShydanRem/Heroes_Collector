import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          [position === 'top' ? 'bottom' : 'top']: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: position === 'top' ? 6 : 0,
          marginTop: position === 'bottom' ? 6 : 0,
          padding: '6px 10px',
          background: '#26262c',
          border: '1px solid #3d3d48',
          borderRadius: 6,
          fontSize: 10,
          color: '#adadb8',
          whiteSpace: 'nowrap',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          animation: 'tooltipIn 0.15s ease',
          lineHeight: 1.4,
          maxWidth: 200,
          textAlign: 'center',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

/**
 * Banner hint dismissibile — appare una sola volta per tab.
 */
interface HintBannerProps {
  id: string; // chiave per localStorage
  text: string;
  icon?: string;
}

export function HintBanner({ id, text, icon = '💡' }: HintBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`hint_${id}`);
    if (!dismissed) setVisible(true);
  }, [id]);

  function dismiss() {
    localStorage.setItem(`hint_${id}`, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      background: 'rgba(145, 71, 255, 0.1)',
      border: '1px solid rgba(145, 71, 255, 0.25)',
      borderRadius: 8,
      padding: '8px 12px',
      marginBottom: 8,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      fontSize: 11,
      color: '#c4b5fd',
      lineHeight: 1.5,
      animation: 'contentFade 0.3s ease',
    }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{text}</span>
      <button onClick={dismiss} style={{
        background: 'none', border: 'none', color: '#737380',
        cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1,
        flexShrink: 0,
      }}>
        ×
      </button>
    </div>
  );
}
