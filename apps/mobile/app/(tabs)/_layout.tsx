import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { useTokens } from '../../src/theme/tokens';

function TabIcon({
  icon,
  label,
  focused,
  isAdd = false,
}: {
  icon: string;
  label: string;
  focused: boolean;
  isAdd?: boolean;
}) {
  const { colors, radius } = useTokens();

  if (isAdd) {
    return (
      <View
        style={[
          styles.addTab,
          {
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
          },
        ]}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: -2 }}>+</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabItem}>
      <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>{icon}</Text>
      <Text
        style={{
          color: focused ? colors.primary : colors.textTertiary,
          fontSize: 11,
          fontWeight: focused ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTokens();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Activity',
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Activity" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ focused }) => <TabIcon icon="+" label="Add" focused={focused} isAdd />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Reports',
          tabBarIcon: ({ focused }) => <TabIcon icon="📈" label="Reports" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Hub',
          tabBarIcon: ({ focused }) => <TabIcon icon="⚡" label="Hub" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  addTab: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
