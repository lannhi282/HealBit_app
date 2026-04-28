import NameScreen from '../screen/NameScreen';

<Stack.Navigator
    screenOptions={{
        headerShown: false,
    }}
>
    <Stack.Screen name="IntroScreen" component={IntroScreen} />
    <Stack.Screen name="NameScreen" component={NameScreen} />
    <Stack.Screen name="ScreenFirst" component={ScreenFirst} />
    // ... rest of the screens ...
</Stack.Navigator> 