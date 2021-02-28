/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import {Button, Container, Content, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {RNCamera} from 'react-native-camera';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {Card, Modal} from '@ui-kitten/components';

const CheckInScreen = ({route, navigation}) => {
  const Data = route.params.Data;
  const [Koordinat, setKoordinat] = useState('');
  const [camera, setcamera] = useState();
  const [Progress, setProgress] = useState(
    'Proses Check In Akan Segera berjalan',
  );
  const [modal, setModal] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        // console.log(position)
        setKoordinat(
          `${position.coords.longitude},${position.coords.latitude}`,
        );
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
      },
    );
  };

  const submit = async () => {
    setModal(true);
    const options = {quality: 1, base64: true};
    const capture = await camera.takePictureAsync(options);
    console.log(capture.uri);

    const hariIni = new Date();
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
    const tanggalHadir = `${tanggalSekarang} ${bulanSekarang} ${tahunSekarang}`;
    const jamHadir = hariIni.toString().substr(16, 5);

    setProgress('Mengupload File')
    const storageRef = storage().ref(`Absensi/${tanggalHadir}-${Data.nama}`);
    storageRef.putFile(`${capture.uri}`).on(
      storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        console.log('snapshot: ' + snapshot.state);
        console.log(
          'progress: ' +
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );

        if (snapshot.state === storage.TaskState.SUCCESS) {
          setProgress('Upload Success');
        }
      },
      (error) => {
        console.log('image upload error: ' + error.toString());
      },
      () => {
        // Untuk mendapatkan url dari file yang kita upload
        storageRef.getDownloadURL().then((downloadUrl) => {
          const pathGambar = `Absensi/${tanggalHadir} - ${Data.nama}`;
          const doc = `${tanggalHadir} - ${Data.nama} - ${Data.id}`;
          let keterangan = '';
          if (hariIni.getHours() < 7) {
            keterangan = 'Tepat waktu';
          }
          if (hariIni.getHours() > 7) {
            keterangan = 'Telat';
          }
          const data = {
            Periode: `${bulanSekarang} ${tahunSekarang}`,
            Tanggal: `${tanggalSekarang} `,
            CheckIn: jamHadir,
            CheckOut: '-',
            Lembur: '-',
            Keterangan: keterangan,
            Nama: Data.nama,
            Location: Koordinat,
            UrlGambar : downloadUrl,
            PathGambar: pathGambar,
          };
          setProgress('Set data ok');
          uploadData(doc, data, jamHadir);
        });
      },
    );
  };

  const uploadData = (doc, data) => {
    setProgress('Mengupload...');
    const ref = firestore().collection(`Absensi`);
    ref
      .doc(doc)
      .set(data)
      .then(() => {
        setProgress('Mengarahkan ke halaman hasil');
        navigation.navigate('Check In Result', {DataCheckIn: data});
        setModal(false)
      })
      .catch((error) => {
        alert(error);
      });
  };

  return (
    <Container>
      <Content>
        <RNCamera
          ref={(ref) => setcamera(ref)}
          style={{height: 500, width: 500}}
          type={RNCamera.Constants.Type.front}
          flashMode={RNCamera.Constants.FlashMode.on}
        />
      </Content>
      <Content>
        <Button
          active={modal}
          info
          style={{marginVertical: 5, alignSelf: 'center'}}
          onPress={submit}>
          <Text> Check In </Text>
        </Button>
      </Content>
      <Modal
        style={{width: 300, height: 100}}
        visible={modal}
        backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
        onBackdropPress={() => setModal(false)}>
        <Card disabled={true}>
          <Text>{Progress}</Text>
        </Card>
      </Modal>
    </Container>
  );
};

export default CheckInScreen;
