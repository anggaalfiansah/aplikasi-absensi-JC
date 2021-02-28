/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Container, Content, Icon, Item, List, ListItem, Picker} from 'native-base';

const HistoryScreen = ({route}) => {
  const data = route.params.Data;
  const bulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const [History, setHistory] = useState([]);
  const [Bulan, setBulan] = useState(bulan[new Date().getMonth()]);
  // const [Tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => {
    hariSekarang();
  });

  const hariSekarang = () => {
    const ref = firestore().collection(`Absensi`);
    ref
      .where('Periode', '==', `${Bulan} 2021`)
      .where('Nama', '==', data.nama)
      .get()
      .then((firestoreDocuments) => {
        const datahariini = firestoreDocuments;
        const history = [];
        datahariini.forEach((documentSnapshot) => {
          history.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setHistory(history);
      })
      .catch((error) => {
        alert(error);
      });
  };
  return (
    <Container
      style={{
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>
      <Item>
        <Picker
          mode="dropdown"
          iosIcon={<Icon name="arrow-down" />}
          style={{width: undefined}}
          placeholderIconColor="#007aff"
          selectedValue={Bulan}
          onValueChange={(value) => setBulan(value)}>
          <Picker.Item label="Januari 2021" value="Januari" />
          <Picker.Item label="Februari 2021" value="Februari" />
          <Picker.Item label="Maret 2021" value="Maret" />
          <Picker.Item label="April 2021" value="April" />
          <Picker.Item label="Mei 2021" value="Mei" />
          <Picker.Item label="Juni 2021" value="Juni" />
          <Picker.Item label="Juli 2021" value="Juli" />
          <Picker.Item label="Agustus 2021" value="Agustus" />
          <Picker.Item label="September 2021" value="Sebtember" />
          <Picker.Item label="Oktober 2021" value="Oktober" />
          <Picker.Item label="November 2021" value="November" />
          <Picker.Item label="Desember 2021" value="Desember" />
        </Picker>
      </Item>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Item
          style={{
            width: '10%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Tgl</Text>
        </Item>
        <Item
          style={{
            width: '15%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Masuk</Text>
        </Item>
        <Item
          style={{
            width: '15%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Pulang</Text>
        </Item>
        <Item
          style={{
            width: '15%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Lembur</Text>
        </Item>
        <Item
          style={{
            width: '45%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Keterangan</Text>
        </Item>
      </View>
      {History.map((data, key) => {
        return (
          <View
            key={key}
            style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Item
              style={{
                width: '10%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text>{data.Tanggal}</Text>
            </Item>
            <Item
              style={{
                width: '15%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text>{data.CheckIn}</Text>
            </Item>
            <Item
              style={{
                width: '15%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{padding: 2, textAlign: 'center'}}>
                {data.CheckOut}
              </Text>
            </Item>
            <Item
              style={{
                width: '15%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text>{data.Lembur}</Text>
            </Item>
            <Item
              style={{
                width: '45%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text>{data.Keterangan}</Text>
            </Item>
          </View>
        );
      })}
    </Container>
  );
};

export default HistoryScreen;
