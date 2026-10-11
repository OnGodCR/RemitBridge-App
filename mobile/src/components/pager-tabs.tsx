import { withLayoutContext } from 'expo-router';
import { createNavigatorFactory, useNavigationBuilder } from 'expo-router/build/react-navigation/native';
import { TabActions, TabRouter, type TabNavigationState } from 'expo-router/build/react-navigation/routers';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

/**
 * Android's tabs as pages side by side (Angad, 2026-10-11: swiping between tabs was "way
 * too choppy"). Before, a swipe only changed tabs once the finger lifted, and the next tab
 * then rose in on its own. Here the tabs sit in a native pager, so the next one slides in
 * under the finger and settles with the platform's own physics. The bottom bar is the same
 * one as before (app-tabs.tsx), handed the navigator's state.
 *
 * Tabs render once first shown, or once they're next to the one showing, so a swipe never
 * lands on an empty page and the app doesn't build all five at launch.
 */
type BarProps = {
  state: TabNavigationState<Record<string, object | undefined>>;
  navigation: { emit: (e: object) => { defaultPrevented: boolean }; navigate: (name: string, params?: object) => void };
};

function PagerTabsNavigator({
  initialRouteName,
  children,
  screenOptions,
  tabBar,
}: {
  initialRouteName?: string;
  children: ReactNode;
  screenOptions?: object;
  tabBar: (props: BarProps) => ReactNode;
}) {
  const { state, navigation, descriptors, NavigationContent } = useNavigationBuilder(TabRouter, {
    initialRouteName,
    children,
    screenOptions,
  });
  const pager = useRef<PagerView>(null);
  // The page the pager is on, so a tab change it caused isn't sent back to it.
  const shown = useRef(state.index);
  const near = (i: number) => [i - 1, i, i + 1];
  const [loaded, setLoaded] = useState(() => new Set(near(state.index)));
  // Load the new tab and its neighbours as the index changes (set during render, React's
  // pattern for state that follows a prop).
  const [loadedFor, setLoadedFor] = useState(state.index);
  if (loadedFor !== state.index) {
    setLoadedFor(state.index);
    setLoaded((prev) => new Set([...prev, ...near(state.index)]));
  }

  useEffect(() => {
    if (shown.current === state.index) return;
    // A tap on the bar: slide to a neighbour, jump further without passing every tab.
    if (Math.abs(shown.current - state.index) === 1) pager.current?.setPage(state.index);
    else pager.current?.setPageWithoutAnimation(state.index);
    shown.current = state.index;
  }, [state.index]);

  return (
    <NavigationContent>
      <PagerView
        ref={pager}
        style={styles.fill}
        initialPage={state.index}
        offscreenPageLimit={1}
        onPageSelected={(e) => {
          const i = e.nativeEvent.position;
          shown.current = i;
          if (i !== state.index) navigation.dispatch({ ...TabActions.jumpTo(state.routes[i].name), target: state.key });
        }}>
        {state.routes.map((route, i) => (
          <View key={route.key} style={styles.fill} collapsable={false}>
            {loaded.has(i) ? descriptors[route.key].render() : null}
          </View>
        ))}
      </PagerView>
      {tabBar({ state, navigation: navigation as unknown as BarProps['navigation'] })}
    </NavigationContent>
  );
}

const PagerTabsNav = createNavigatorFactory(PagerTabsNavigator)().Navigator;

export const PagerTabs = withLayoutContext(PagerTabsNav);

const styles = StyleSheet.create({ fill: { flex: 1 } });
