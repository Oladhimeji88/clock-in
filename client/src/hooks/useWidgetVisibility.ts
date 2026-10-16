import { useCallback, useEffect, useState } from 'react';

const KEY = 'chronotrack_widget_visible';
const EVENT = 'chronotrack:widget-visibility';

function read(): boolean {
  try {
    const v = localStorage.getItem(KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
}

/** Shared on/off state for the floating mini clock widget — closing it from
 * the widget itself and re-enabling it from Settings both go through this,
 * kept in sync (within the tab) via a custom event, since the native
 * `storage` event only fires in *other* tabs. */
export function useWidgetVisibility() {
  const [visible, setVisibleState] = useState(read);

  useEffect(() => {
    const onChange = () => setVisibleState(read());
    window.addEventListener(EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const setVisible = useCallback((next: boolean) => {
    try {
      localStorage.setItem(KEY, String(next));
    } catch {
      /* ignore storage errors */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [visible, setVisible] as const;
}
