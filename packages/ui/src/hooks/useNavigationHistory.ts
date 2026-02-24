import { useCallback, useEffect, useRef, useState } from 'react';

const TAB_TO_ROUTE_SEGMENT = {
  tests: 'tests',
  testdata: 'test-data',
  execution: 'execution',
  settings: 'settings',
} as const;

type TabKey = keyof typeof TAB_TO_ROUTE_SEGMENT;

const ROUTE_SEGMENT_TO_TAB: Record<string, TabKey> = Object.entries(
  TAB_TO_ROUTE_SEGMENT
).reduce(
  (acc, [tab, segment]) => {
    acc[segment] = tab as TabKey;
    return acc;
  },
  {} as Record<string, TabKey>
);

const normalizeBasePath = () => {
  const base = import.meta.env.BASE_URL || '/';
  const withLeadingSlash = base.startsWith('/') ? base : `/${base}`;
  if (withLeadingSlash === '/') {
    return '';
  }
  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
};

const isTabKey = (value: string): value is TabKey => {
  return value in TAB_TO_ROUTE_SEGMENT;
};

const getTabFromPathname = (pathname: string): TabKey | null => {
  const basePath = normalizeBasePath();
  let relativePath = pathname;

  if (basePath && relativePath.startsWith(basePath)) {
    relativePath = relativePath.slice(basePath.length);
  }

  const [firstSegment] = relativePath.replace(/^\//, '').split('/');
  return ROUTE_SEGMENT_TO_TAB[firstSegment] ?? null;
};

const buildTabPath = (tab: TabKey) => {
  const basePath = normalizeBasePath();
  return `${basePath}/${TAB_TO_ROUTE_SEGMENT[tab]}`;
};

export function useNavigationHistory(initialTab: string) {
  const safeInitialTab: TabKey = isTabKey(initialTab) ? initialTab : 'tests';
  const [currentTab, setCurrentTab] = useState<TabKey>(safeInitialTab);
  const ignoreNextPush = useRef(false);
  const ignorePopState = useRef(false);

  // Initialize URL with route path and migrate legacy ?tab= URLs.
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const legacyTab = currentUrl.searchParams.get('tab');

    if (legacyTab && isTabKey(legacyTab)) {
      const legacyPath = buildTabPath(legacyTab);
      window.history.replaceState({ tab: legacyTab }, '', legacyPath);
      setCurrentTab(legacyTab);
      return;
    }

    const tabFromPath = getTabFromPathname(window.location.pathname);
    if (tabFromPath) {
      setCurrentTab(tabFromPath);
      return;
    }

    // Use pushState so the previous entry (e.g. login) is preserved.
    window.history.pushState(
      { tab: safeInitialTab },
      '',
      buildTabPath(safeInitialTab)
    );
    setCurrentTab(safeInitialTab);
  }, [safeInitialTab]);

  // Handle browser back/forward events
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (ignorePopState.current) {
        ignorePopState.current = false;
        return;
      }

      const state = event.state;
      if (state && state.tab && isTabKey(state.tab)) {
        setCurrentTab(state.tab);
      } else {
        // Fallback: read from current route.
        const tab = getTabFromPathname(window.location.pathname);
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

      if (!isTabKey(newTab) || newTab === currentTab) {
        return;
      }

      window.history.pushState(
        { tab: newTab, timestamp: Date.now() },
        '',
        buildTabPath(newTab)
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
