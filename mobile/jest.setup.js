// Reanimated and its worklets runtime are native; tests use the stand-ins they ship, plus
// the reduced-motion hook the stand-in leaves out.
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  useReducedMotion: () => false,
}));
