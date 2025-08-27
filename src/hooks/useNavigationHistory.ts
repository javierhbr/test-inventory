import { useCallback, useEffect, useRef, useState } from 'react';

interface NavigationState {
  tab: string;
  timestamp: number;
}

export function useNavigationHistory(initialTab: string) {
  const [currentTab, setCurrentTab] = useState(initialTab);
  const ignoreNextPush = useRef(false);
  const ignorePopState = useRef(false);

  // Initialize URL with current tab
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('tab')) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', initialTab);
      window.history.replaceState({ tab: initialTab }, '', newUrl.toString());
    } else {
      const urlTab = currentUrl.searchParams.get('tab');
      if (urlTab && urlTab !== initialTab) {
        setCurrentTab(urlTab);
      }
    }
  }, [initialTab]);

  // Handle browser back/forward events
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (ignorePopState.current) {
        ignorePopState.current = false;
        return;
      }

      const state = event.state;
      if (state && state.tab) {
        setCurrentTab(state.tab);
      } else {
        // Fallback: read from URL
        const url = new URL(window.location.href);
        const tab = url.searchParams.get('tab');
        if (tab) {
          setCurrentTab(tab);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const pushToHistory = useCallback(
    (newTab: string) => {
      if (ignoreNextPush.current) {
        ignoreNextPush.current = false;
        return;
      }

      if (newTab === currentTab) {
        return;
      }

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', newTab);

      window.history.pushState(
        { tab: newTab, timestamp: Date.now() },
        '',
        newUrl.toString()
      );

      setCurrentTab(newTab);
    },
    [currentTab]
  );

  const goBack = useCallback(() => {
    ignoreNextPush.current = true;
    window.history.back();
  }, []);

  const goForward = useCallback(() => {
    ignoreNextPush.current = true;
    window.history.forward();
  }, []);

  // Check if we can go back/forward (approximate)
  const canGoBack = window.history.length > 1;
  const canGoForward = false; // Browser doesn't provide a reliable way to check this

  return {
    currentTab,
    pushToHistory,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  };
}
