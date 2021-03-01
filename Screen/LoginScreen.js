/* eslint-disable prettier/prettier */
/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import {
  Button,
  Container,
  Content,
  Form,
  H1,
  Input,
  Item,
  Text,
} from 'native-base';
import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Image} from 'react-native';

const LoginScreen = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const Navigation = props.navigation;

  // Fungsi Untuk Login
  const onLoginPress = () => {
    if (email === '' && password === '') {
      alert('Silahkan Isi Email Dan Password');
    } else {
      auth()
        .signInWithEmailAndPassword(email, password)
        .then((response) => {
          console.log(response);
          const uid = response.user.uid;
          const usersRef = firestore().collection('Pegawai');
          usersRef
            .doc(uid)
            .get()
            .then((firestoreDocument) => {
              const user = firestoreDocument.data();
              console.log(user);
              Navigation.navigate('Home', {user});
            })
            .catch((error) => {
              alert(error);
            });
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

  return (
    <Container>
      <Content>
        <H1 style={{textAlign: 'center', marginTop: 25}}>Silahkan Login</H1>
        <Image
          style={{
            flex: 1,
            height: 120,
            width: 90,
            alignSelf: 'center',
            margin: 30,
          }}
          source={{
            uri:
              'https://firebasestorage.googleapis.com/v0/b/aplikasi-kang-lapor.appspot.com/o/images%2Fvector-creator.png?alt=media&token=45219237-90f9-46d7-aacc-564d57759511',
          }}
        />
        <Form style={{width: '95%', alignSelf: 'center', marginTop: 5}}>
          <Item regular style={{marginVertical: 5}}>
            <Input
              placeholder="Masukkan Email"
              value={email}
              onChangeText={(value) => setEmail(value)}
            />
          </Item>

          <Item regular style={{marginVertical: 5}}>
            <Input
              secureTextEntry={true}
              placeholder="Masukkan Password"
              value={password}
              onChangeText={(value) => setPassword(value)}
            />
          </Item>

          <Button onPress={onLoginPress} block info style={{marginVertical: 5}}>
            <Text> Login </Text>
          </Button>
        </Form>
      </Content>
    </Container>
  );
};

export default LoginScreen;
