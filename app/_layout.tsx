import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onlineManager } from "@tanstack/react-query";
import { NativeTabs } from "expo-router/unstable-native-tabs";

// Sync React Query's online state with the device network status.
// Queries will automatically pause when offline and resume when reconnected.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(state.isConnected ?? true);
  })
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NativeTabs>
        <NativeTabs.Trigger name="(tournaments)">
          <NativeTabs.Trigger.Icon sf="trophy" md="emoji_events" />
          <NativeTabs.Trigger.Label>Tournaments</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(clubs)">
          <NativeTabs.Trigger.Icon sf="building.2" md="groups" />
          <NativeTabs.Trigger.Label>Clubs</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(matches)">
          <NativeTabs.Trigger.Icon sf="sportscourt" md="sports_tennis" />
          <NativeTabs.Trigger.Label>Matches</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(specialties)">
          <NativeTabs.Trigger.Icon sf="list.star" md="category" />
          <NativeTabs.Trigger.Label>Specialties</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </QueryClientProvider>
  );
}
