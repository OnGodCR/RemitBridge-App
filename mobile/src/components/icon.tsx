import { SymbolView, type AndroidSymbol, type SFSymbol, type SymbolViewProps, type SymbolWeight } from 'expo-symbols';
import { Platform } from 'react-native';

export type { SFSymbol };

/**
 * Every icon in the app, on both platforms. Screens name icons the iOS way (SF Symbols); a
 * bare SF name draws nothing on Android, which left the first Android build with no
 * checkmarks, arrows, back buttons or streak flame (Angad, 2026-10-09: "the learn tab is
 * very weird on the android version"). This maps each SF name the app uses to the matching
 * Material Symbol, so Android gets its own native icon. A name missing here draws nothing on
 * Android, so add it when adding an icon (icon.test.ts checks the ones in use).
 */
export const ANDROID_SYMBOLS: Partial<Record<SFSymbol, AndroidSymbol>> = {
  'arrow.counterclockwise': 'refresh',
  'arrow.left.arrow.right': 'compare_arrows',
  'arrow.right': 'arrow_forward',
  'arrow.up.right': 'north_east',
  'arrow.uturn.left.circle.fill': 'undo',
  bell: 'notifications',
  'bell.fill': 'notifications',
  'bolt.fill': 'bolt',
  book: 'menu_book',
  bookmark: 'bookmark',
  'bookmark.fill': 'bookmark',
  'camera.fill': 'photo_camera',
  'chart.bar': 'bar_chart',
  checkmark: 'check',
  'checkmark.circle.fill': 'check_circle',
  'bubble.left': 'chat_bubble',
  'chevron.down': 'expand_more',
  'chevron.left': 'arrow_back',
  'chevron.right': 'chevron_right',
  'chevron.up': 'expand_less',
  'doc.richtext': 'article',
  'doc.text': 'description',
  'doc.text.magnifyingglass': 'find_in_page',
  'doc.text.viewfinder': 'document_scanner',
  'envelope.fill': 'mail',
  'exclamationmark.circle.fill': 'error',
  'flame.fill': 'local_fire_department',
  globe: 'language',
  'hand.raised': 'pan_tool',
  link: 'link',
  'list.bullet': 'list',
  'lock.shield': 'shield_lock',
  magnifyingglass: 'search',
  map: 'map',
  message: 'chat',
  'message.fill': 'chat',
  minus: 'remove',
  'minus.circle.fill': 'do_not_disturb_on',
  newspaper: 'newspaper',
  pencil: 'edit',
  'person.2': 'group',
  'person.crop.circle': 'account_circle',
  'photo.on.rectangle': 'photo_library',
  plus: 'add',
  'plus.circle': 'add_circle',
  'questionmark.circle': 'help',
  scope: 'target',
  sparkles: 'auto_awesome',
  'square.and.arrow.up': 'share',
  trash: 'delete',
  'wrench.and.screwdriver': 'build',
  xmark: 'close',
  'arrow.up': 'arrow_upward',
  'square.grid.2x2': 'grid_view',
  'flag.fill': 'flag',
};

type IconProps = Omit<SymbolViewProps, 'name' | 'weight'> & {
  name: SFSymbol;
  /** iOS only; Material Symbols on Android keep their own weight. */
  weight?: SymbolWeight;
};

export function Icon({ name, weight, ...rest }: IconProps) {
  return (
    <SymbolView
      name={{ ios: name, android: ANDROID_SYMBOLS[name] }}
      {...(Platform.OS === 'ios' && weight ? { weight } : {})}
      {...rest}
    />
  );
}
