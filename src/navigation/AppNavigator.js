import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

// Import screens
import HomeScreen from "../screens/HomeScreen"
import PlaylistScreen from "../screens/PlaylistScreen"
import ActivityLogScreen from "../screens/ActivityLogScreen"
import MemoryStimulationScreen from "../screens/MemoryStimulationScreen"
import SettingsScreen from "../screens/SettingsScreen"
import HelpScreen from "../screens/HelpScreen"
import MusicPlayerScreen from "../screens/MusicPlayerScreen"
import CreatePlaylistScreen from "../screens/CreatePlaylistScreen"
import AddMemoryScreen from "../screens/AddMemoryScreen"

// Using NativeStackNavigator instead of StackNavigator
const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
      <Stack.Screen name="CreatePlaylist" component={CreatePlaylistScreen} />
      <Stack.Screen name="AddMemory" component={AddMemoryScreen} />
    </Stack.Navigator>
  )
}

const PlaylistStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PlaylistMain" component={PlaylistScreen} />
      <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
      <Stack.Screen name="CreatePlaylist" component={CreatePlaylistScreen} />
    </Stack.Navigator>
  )
}

const MemoryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MemoryMain" component={MemoryStimulationScreen} />
      <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
      <Stack.Screen name="AddMemory" component={AddMemoryScreen} />
    </Stack.Navigator>
  )
}

const ActivityStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ActivityMain" component={ActivityLogScreen} />
    </Stack.Navigator>
  )
}

const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  )
}

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Playlists") {
            iconName = focused ? "musical-notes" : "musical-notes-outline"
          } else if (route.name === "Memory") {
            iconName = focused ? "brain" : "brain-outline"
          } else if (route.name === "Activity") {
            iconName = focused ? "analytics" : "analytics-outline"
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Playlists" component={PlaylistStack} />
      <Tab.Screen name="Memory" component={MemoryStack} />
      <Tab.Screen name="Activity" component={ActivityStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  )
}

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  )
}

export default AppNavigator
