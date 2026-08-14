import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTokens } from '../../src/theme/tokens';

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  const { colors } = useTokens();
  return (
    <Text style={{ color: focused ? colors.primary : colors.textTertiary, fontSize: 11 }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { colors } = useTokens();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarLabel: ({ focused }) => <TabLabel label="Activity" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarLabel: ({ focused }) => <TabLabel label="+" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarLabel: ({ focused }) => <TabLabel label="Analytics" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarLabel: ({ focused }) => <TabLabel label="More" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
