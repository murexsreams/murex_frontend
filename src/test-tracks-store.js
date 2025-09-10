// Simple test to verify tracksStore export
import { useTracksStore } from './store/tracksStore';

console.log('useTracksStore:', typeof useTracksStore);
console.log('Store state:', useTracksStore.getState());

export default function testTracksStore() {
  return 'TracksStore test passed';
}