import { Fonts } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';

/** Native header styling shared by the pushed stacks (tools, learn, admin). */
export function stackOptions(t: ThemeColors) {
  return {
    headerTintColor: t.primary,
    headerTitleStyle: { fontFamily: Fonts.semibold, color: t.text },
    headerStyle: { backgroundColor: t.background },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
    contentStyle: { backgroundColor: t.background },
  };
}
