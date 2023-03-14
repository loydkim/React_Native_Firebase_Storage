/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {
  Button,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'react-native-image-picker';

const reference = storage();

type ItemData = {
  imageName: string;
  imageUrl: string;
};

type ItemProps = {
  item: ItemData;
};

const Item = ({item}: ItemProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.imageName}>{item.imageName}</Text>
      <Image style={styles.image} source={{uri: item.imageUrl}} />
    </View>
  );
};

function App(): JSX.Element {
  const [images, setImages] = useState<Array<ItemData>>([]);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    reference
      .ref('images')
      .listAll()
      .then(res => {
        setImages([]);
        res.items.forEach(async ref => {
          const imagePath = ref.fullPath; // images/image-3920.jpeg
          const url = await reference.ref(imagePath).getDownloadURL();
          const itemData: ItemData = {
            imageName: imagePath,
            imageUrl: url,
          };
          setImages(prev => [...prev, itemData]);
        });
      });
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        {images?.map(value => (
          <Item key={value.imageName} item={value} />
        ))}
        <Button
          title="Add Image"
          onPress={async () => {
            console.log('Add Image');

            await ImagePicker.launchImageLibrary(
              {
                selectionLimit: 0,
                mediaType: 'photo',
                includeBase64: false,
              },
              async response => {
                if (response.didCancel) {
                  console.log('User cancelled image picker');
                } else if (response.errorCode) {
                  console.log('error code', response.errorCode);
                } else if (response.errorMessage) {
                  console.log('error message', response.errorMessage);
                } else if (response.assets) {
                  const fileUri = response.assets[0]['uri'];
                  console.log('uri is', fileUri);

                  const randomNumber = Math.floor(Math.random() * 100) + 1;
                  const imagePath =
                    'images/image-' + randomNumber * randomNumber;

                  await reference
                    .ref(imagePath)
                    .putFile(fileUri!)
                    .then(async ressult => {
                      console.log('added image');
                      const url = await reference
                        .ref(imagePath)
                        .getDownloadURL();
                      const itemData: ItemData = {
                        imageName: imagePath,
                        imageUrl: url,
                      };
                      setImages(prev => [...prev, itemData]);
                    });
                }
              },
            );
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 16,
    padding: 10,
    margin: 10,
  },
  imageName: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  image: {
    width: '100%',
    height: windowWidth * 0.7,
    borderRadius: 10,
  },
});

export default App;
