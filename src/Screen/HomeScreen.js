/* eslint-disable prettier/prettier */
/* eslint-disable no-alert */

import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  //   FlatList,
  Image,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = ({extraData, navigation}) => {
  const [Data, setData] = useState();
  const [DataHariIni, setDataHariIni] = useState();
  const [controllerCheckIn, setcontrollerCheckIn] = useState(true);
  const [controllerCheckOut, setcontrollerCheckOut] = useState(true);

  const uid = extraData.uid;

  const hariIni = new Date();
  let hariKemarin = new Date();
  hariKemarin.setDate(hariKemarin.getDate() - 1);
  const tanggalSekarang = hariIni.getDate();
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
  const bulanSekarang = bulan[hariIni.getMonth()];
  const tahunSekarang = hariIni.getFullYear();
  const tanggalHariIni = `${tanggalSekarang} ${bulanSekarang} ${tahunSekarang}`;
  const tanggalKemarin = `${hariKemarin.getDate()} ${
    bulan[hariKemarin.getMonth()]
  } ${hariKemarin.getFullYear()}`;

  useEffect(() => {
    home();
  });

  const home = () => {
    const ref = firestore().collection('Pegawai');
    ref
      .doc(uid)
      .get()
      .then((firestoreDocument) => {
        const user = firestoreDocument.data();
        setData(user);
        hariSekarang(user);
        hariSebelumnya(user);
      })
      .catch((error) => {
        alert(error);
      });
  };

  const hariSekarang = (user) => {
    const ref = firestore().collection(`Absensi`);
    ref
      .doc(`${tanggalHariIni} - ${user.nama} - ${user.id}`)
      .get()
      .then((firestoreDocuments) => {
        const datahariini = firestoreDocuments.data();
        setDataHariIni(datahariini);
        if (datahariini == undefined) {
          setcontrollerCheckIn(false);
          setcontrollerCheckOut(true);
        } else if (datahariini.CheckOut == '-') {
          setcontrollerCheckIn(true);
          setcontrollerCheckOut(false);
        } else {
          setcontrollerCheckIn(true);
          setcontrollerCheckOut(true);
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  const hariSebelumnya = (user) => {
    const ref = firestore().collection(`Absensi`);
    ref
      .doc(`${tanggalKemarin} - ${user.nama} - ${user.id}`)
      .get()
      .then((firestoreDocuments) => {
        const dataKemarin = firestoreDocuments.data();
        if (dataKemarin === undefined) {
          const data = {
            Periode: `${
              bulan[hariKemarin.getMonth()]
            } ${hariKemarin.getFullYear()}`,
            Tanggal: `${hariKemarin.getDate()} `,
            CheckIn: '-',
            CheckOut: '-',
            Lembur: '-',
            Keterangan: 'Tidak Masuk',
            Nama: user.nama,
            Location: '-',
            UrlGambar: '-',
            PathGambar: '-',
          };
          ref.doc(`${tanggalKemarin} - ${user.nama} - ${user.id}`).set(data);
        }
        if (dataKemarin.CheckIn !== '-' && dataKemarin.CheckOut === '-') {
          const data = {
            Keterangan: `${dataKemarin.Keterangan}, Telat Check Out`,
            CheckOut: '19:00',
            Lembur: '-',
          };
          console.log('Upload Data...');
          const ref = firestore().collection(`Absensi`);
          ref.doc(`${tanggalKemarin} - ${user.nama} - ${user.id}`).update(data);
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  const checkOut = () => {
    console.log('memulai Check Out...');
    const HariIni = new Date();
    const jamPulang = HariIni.toString().substr(16, 5);
    const hadir = DataHariIni.CheckIn.split(':');
    const pulang = jamPulang.split(':');
    const diff =
      new Date(0, 0, 0, pulang[0], pulang[1], 0).getTime() -
      new Date(0, 0, 0, hadir[0], hadir[1], 0).getTime();
    const jamLembur = Math.floor(diff / 1000 / 60 / 60);
    const menitLembur = Math.floor(diff / 1000 / 60);
    console.log('Set Waktu...');
    if (jamLembur < 0) jamLembur = jamLembur + 24;

    let lembur = '';
    let keterangan = '';
    if (HariIni.getHours() < 19) {
      lembur = '-';
      keterangan = `${DataHariIni.Keterangan}, Pulang Awal`;
    } else if (HariIni.getHours() < 20) {
      lembur = '-';
      keterangan = `${DataHariIni.Keterangan}, Pulang Tepat Waktu`;
    } else {
      lembur =
        (jamLembur <= 9 ? '0' : '') +
        jamLembur +
        ':' +
        (menitLembur <= 9 ? '0' : '') +
        menitLembur;

      keterangan = `${DataHariIni.Keterangan}, Lembur`;
    }

    console.log('Set Data...');
    const data = {
      Keterangan: keterangan,
      CheckOut: jamPulang,
      Lembur: lembur,
    };
    console.log('Upload Data...');
    const ref = firestore().collection(`Absensi`);
    ref
      .doc(`${tanggalHariIni} - ${Data.nama} - ${Data.id}`)
      .update(data)
      .then(() => {
        alert(`Check Out pada ${jamPulang}`);
        setcontrollerCheckIn(true);
        setcontrollerCheckOut(true);
        console.log('Check Out Selesai');
      });
  };

  const logout = () => {
    auth()
      .signOut()
      .then(() => {
        console.log('User signed out!');
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        <TouchableOpacity
          disabled={controllerCheckIn}
          style={styles.card}
          onPress={() => {
            navigation.navigate('Check In', {Data});
          }}>
          <View style={styles.cardFooter} />
          <Image
            style={styles.cardImage}
            source={{
              uri:
                'https://img.icons8.com/color/100/000000/login-rounded-right.png',
            }}
          />
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Check In</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={controllerCheckOut}
          style={styles.card}
          onPress={checkOut}>
          <View style={styles.cardFooter} />
          <Image
            style={styles.cardImage}
            source={{
              uri: 'https://img.icons8.com/color/100/000000/sign-out.png',
            }}
          />
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Check Out</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            navigation.navigate('Izin', {Data});
          }}>
          <View style={styles.cardFooter} />
          <Image
            style={styles.cardImage}
            source={{uri: 'https://img.icons8.com/color/100/000000/leave.png'}}
          />
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Izin</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            navigation.navigate('History', {Data});
          }}>
          <View style={styles.cardFooter} />
          <Image
            style={styles.cardImage}
            source={{
              uri: 'https://img.icons8.com/color/100/000000/timetable.png',
            }}
          />
          <View style={styles.cardHeader}>
            <Text style={styles.title}>History</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={logout}>
          <View style={styles.cardFooter} />
          <Image
            style={styles.cardImage}
            source={{
              uri: 'https://img.icons8.com/color/100/000000/shutdown.png',
            }}
          />
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'pink',
    alignItems: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  /******** card **************/
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,

    marginVertical: 10,
    backgroundColor: 'white',
    // flexBasis: '45%',
    marginHorizontal: 10,
    width: '45%',
    height: 200,
  },
  cardHeader: {
    alignSelf: 'center',
  },
  cardContent: {
    paddingVertical: 12.5,
    paddingHorizontal: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12.5,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  cardImage: {
    height: 90,
    width: 90,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    flex: 1,
    alignSelf: 'center',
    color: '#696969',
  },
  card2: {
    shadowColor: '#474747',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    elevation: 12,
    marginVertical: 20,
    marginHorizontal: 40,
    marginTop: 50,
    marginBottom: 40,
    backgroundColor: '#e2e2e2',
    //flexBasis: '42%',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage2: {
    height: 50,
    width: 50,
    alignSelf: 'center',
  },
});
