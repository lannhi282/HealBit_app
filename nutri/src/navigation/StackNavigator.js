import NameScreen from "../screen/NameScreen";
import ProgressHistoryScreen from "../screen/ProgressHistoryScreen";
<Stack.Navigator
  screenOptions={{
    headerShown: false,
  }}
>
  <Stack.Screen name="IntroScreen" component={IntroScreen} />
  <Stack.Screen name="NameScreen" component={NameScreen} />
  <Stack.Screen name="ScreenFirst" component={ScreenFirst} />
  <Stack.Screen name="Calories" component={CaloriesScreen} />
  <Stack.Screen
    name="ProgressHistory"
    component={ProgressHistoryScreen}
    options={{ headerShown: false }}
  />
  {/* // ... rest of the screens ... */}
</Stack.Navigator>;
