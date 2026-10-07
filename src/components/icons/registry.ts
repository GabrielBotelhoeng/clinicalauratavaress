// Ícones Phosphor (peso Light; "star" em Fill) importados como SVG bruto e renderizados inline pelo Icon.astro.
import armchair from '@phosphor-icons/core/light/armchair-light.svg?raw';
import arrowRight from '@phosphor-icons/core/light/arrow-right-light.svg?raw';
import arrowsClockwise from '@phosphor-icons/core/light/arrows-clockwise-light.svg?raw';
import arrowsLeftRight from '@phosphor-icons/core/light/arrows-left-right-light.svg?raw';
import calendarCheck from '@phosphor-icons/core/light/calendar-check-light.svg?raw';
import clipboardText from '@phosphor-icons/core/light/clipboard-text-light.svg?raw';
import drop from '@phosphor-icons/core/light/drop-light.svg?raw';
import ear from '@phosphor-icons/core/light/ear-light.svg?raw';
import instagram from '@phosphor-icons/core/light/instagram-logo-light.svg?raw';
import leaf from '@phosphor-icons/core/light/leaf-light.svg?raw';
import list from '@phosphor-icons/core/light/list-light.svg?raw';
import mapPin from '@phosphor-icons/core/light/map-pin-light.svg?raw';
import mapTrifold from '@phosphor-icons/core/light/map-trifold-light.svg?raw';
import medal from '@phosphor-icons/core/light/medal-light.svg?raw';
import navigationArrow from '@phosphor-icons/core/light/navigation-arrow-light.svg?raw';
import pause from '@phosphor-icons/core/light/pause-light.svg?raw';
import person from '@phosphor-icons/core/light/person-light.svg?raw';
import play from '@phosphor-icons/core/light/play-light.svg?raw';
import scan from '@phosphor-icons/core/light/scan-light.svg?raw';
import sparkle from '@phosphor-icons/core/light/sparkle-light.svg?raw';
import userFocus from '@phosphor-icons/core/light/user-focus-light.svg?raw';
import whatsapp from '@phosphor-icons/core/light/whatsapp-logo-light.svg?raw';
import x from '@phosphor-icons/core/light/x-light.svg?raw';
import starFill from '@phosphor-icons/core/fill/star-fill.svg?raw';

export const icons = {
  'arrow-right': arrowRight,
  'arrows-clockwise': arrowsClockwise,
  'arrows-left-right': arrowsLeftRight,
  armchair,
  'calendar-check': calendarCheck,
  'clipboard-text': clipboardText,
  close: x,
  drop,
  ear,
  instagram,
  leaf,
  map: mapTrifold,
  'map-pin': mapPin,
  medal,
  menu: list,
  navigation: navigationArrow,
  pause,
  person,
  play,
  scan,
  sparkle,
  'star-fill': starFill,
  'user-focus': userFocus,
  whatsapp,
} as const satisfies Record<string, string>;

export type IconName = keyof typeof icons;
