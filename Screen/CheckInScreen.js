/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import {Button, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {RNCamera} from 'react-native-camera';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {View} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const CheckInScreen = ({route, navigation}) => {
  // Data dari lemparan dari HomeScreen untuk validasi upload data
  const Data = route.params.Data;

  const [Koordinat, setKoordinat] = useState('');
  const [camera, setcamera] = useState();
  const [modal, setModal] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  // Fungsi untuk mengambil data koordinat perangkat
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

  // fFungsi untuk memproses data CheckIn yang akan dikirim ke firebase
  const submit = async () => {
    // Untuk menampilkan modal proses
    setModal(true);

    // Option untuk mengeset pengaturan gambar yang akan dicapture
    const options = {
      quality: 0.65,
      fixOrientation: true,
      forceUpOrientation: true,
    };

    // variabel untuk mengcapture gambar
    const capture = await camera.takePictureAsync(options);
    console.log(capture.uri);
    // Untuk mengambil Jam, tanggal, bulan, tahun untuk digunakan saat upload dan validasi
    const hariIni = new Date();
    const tanggalSekarang = ('0' + hariIni.getDate()).slice(-2);
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

    // Untuk Mengupload file hasil capture ke firebase
    const storageRef = storage().ref(`Absensi/${tanggalHadir}-${Data.nama}`);
    storageRef.putFile(`${capture.uri}`).on(
      // Untuk menampilkan progress Upload
      storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        console.log('snapshot: ' + snapshot.state);
        console.log(
          'progress: ' +
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );

        if (snapshot.state === storage.TaskState.SUCCESS) {
          console.log('Upload Success');
        }
      },
      (error) => {
        console.log('image upload error: ' + error.toString());
      },

      // Untuk mendapatkan url dari file yang kita upload & memproses data yang akan di upload
      () => {
        // Untuk mendapatkan url dari file yang kita upload
        storageRef.getDownloadURL().then((downloadUrl) => {
          // Untuk Mendapatkan data pathGambar
          const pathGambar = `Absensi/${tanggalHadir} - ${Data.nama}`;
          // Untuk menentukan nama document di firestore
          const doc = `${tanggalHadir} - ${Data.nama} - ${Data.id}`;
          // Untuk menentukan data keterangan
          let keterangan = '';
          if (hariIni.getHours() <= 7) {
            keterangan = 'Tepat waktu';
          }
          if (hariIni.getHours() > 7) {
            keterangan = 'Telat';
          }

          // Untuk menentukan data yang akan di Upload
          const data = {
            Periode: `${bulanSekarang} ${tahunSekarang}`,
            Tanggal: `${tanggalSekarang} `,
            CheckIn: jamHadir,
            CheckOut: '-',
            Lembur: '-',
            Keterangan: keterangan,
            Nama: Data.nama,
            Location: Koordinat,
            UrlGambar: downloadUrl,
            PathGambar: pathGambar,
          };

          // Menjalankan fungsi upload ke firestore dan melempar data yang telah kita proses
          uploadData(doc, data, jamHadir);
        });
      },
    );
  };

  // Fungsi untuk upload ke firestore dengan data yang berasal dari submit
  const uploadData = (doc, data) => {
    const ref = firestore().collection('Absensi');
    ref
      .doc(doc)
      .set(data)
      .then(() => {
        navigation.navigate('Check In Result', {DataCheckIn: data});
        setModal(false);
      })
      .catch((error) => {
        // eslint-disable-next-line no-alert
        alert(error);
      });
  };

  return (
    <View style={{flexDirection: 'column', justifyContent: 'space-between'}}>
      {/* View Camera */}
      <RNCamera
        ref={(ref) => setcamera(ref)}
        style={{height: 500, width: 500}}
        // Menentukan Kamera depan atau belakang( ubah front menjadi back untuk menggunakan camera belakang)
        type={RNCamera.Constants.Type.front}
        flashMode={RNCamera.Constants.FlashMode.on}
        ratio={'4:4'}
      />

      {/* Tombol untuk menjalankan submit */}
      <Button
        info
        style={{marginVertical: 5, alignSelf: 'center'}}
        onPress={submit}>
        <Text> Check In </Text>
      </Button>

      {/* Modal Proses */}
      <Spinner
        visible={modal}
        textContent={'Memproses...'}
        textStyle={{color: '#FFF'}}
      />
    </View>
  );
};

export default CheckInScreen;
