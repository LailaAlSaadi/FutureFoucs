import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

const dummy = [
  { url: '1', title: 'News A', description: 'Desc A', urlToImage: 'https://picsum.photos/200', source: { name: 'S1' }, publishedAt: '2026-01-01' },
  { url: '2', title: 'News B', description: 'Desc B', urlToImage: 'https://picsum.photos/201', source: { name: 'S2' }, publishedAt: '2026-01-02' }
];

const Ctx = createContext();

const Prov = ({ children }) => {
  const [favs, setFavs] = useState([]);
  useEffect(() => {
    AsyncStorage.getItem('f').then(d => d && setFavs(JSON.parse(d)));
  }, []);
  const tog = async (i) => {
    const n = favs.find(f => f.url === i.url) ? favs.filter(f => f.url !== i.url) : [...favs, i];
    setFavs(n);
    await AsyncStorage.setItem('f', JSON.stringify(n));
  };
  return <Ctx.Provider value={{ favs, tog }}>{children}</Ctx.Provider>;
};

const List = ({ navigation }) => {
  const [l, setL] = useState(dummy);
  const [r, setR] = useState(false);
  const onR = () => {
    setR(true);
    setTimeout(() => setR(false), 500);
  };
  const search = (t) => setL(dummy.filter(i => i.title.toLowerCase().includes(t.toLowerCase()) || i.source.name.toLowerCase().includes(t.toLowerCase())));

  return (
    <View>
      <TextInput onChangeText={search} placeholder="Search" />
      <FlatList 
        data={l} 
        onRefresh={onR}
        refreshing={r}
        keyExtractor={i => i.url}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Detail', { item })}>
            <Text>{item.title}</Text>
            <Text>{item.source.name}</Text>
          </TouchableOpacity>
        )} 
      />
    </View>
  );
};

const Detail = ({ route }) => {
  const { item } = route.params;
  const { favs, tog } = useContext(Ctx);
  const isF = favs.some(f => f.url === item.url);
  return (
    <View>
      <Image source={{ uri: item.urlToImage }} style={{ width: 100, height: 100 }} />
      <Text>{item.title}</Text>
      <Text>{item.description}</Text>
      <TouchableOpacity onPress={() => tog(item)}>
        <Text>{isF ? 'Remove' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const Favs = ({ navigation }) => {
  const { favs } = useContext(Ctx);
  return (
    <FlatList 
      data={favs} 
      keyExtractor={i => i.url}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Detail', { item })}>
          <Text>{item.title}</Text>
        </TouchableOpacity>
      )} 
    />
  );
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Nav = () => (
  <Stack.Navigator>
    <Stack.Screen name="List" component={List} />
    <Stack.Screen name="Detail" component={Detail} />
  </Stack.Navigator>
);

// REMOVED NavigationContainer from here
export default function App() {
  return (
    <Prov>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={Nav} />
        <Tab.Screen name="Favs" component={Favs} options={{ headerShown: true }} />
      </Tab.Navigator>
    </Prov>
  );
}