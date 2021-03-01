/* eslint-disable prettier/prettier */
/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  Container,
  Content,
  Form,
  Item,
  Input,
  H1,
  Button,
  Picker,
  Icon,
  Textarea,
  Label,
  View,
} from 'native-base';
import {Card, Text, Modal, RangeDatepicker} from '@ui-kitten/components';
import {Image, TouchableOpacity} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Spinner from 'react-native-loading-spinner-overlay';

const IzinScreen = ({route, navigation}) => {
  // Data dari lemparan dari HomeScreen untuk validasi upload data
  const Data = route.params.Data;

  const [Kategori, setKategori] = useState();
  const [Tanggal, setTanggal] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [Perihal, setPerihal] = useState();
  const [Keterangan, setKeterangan] = useState();

  const [modal, setModal] = useState(false);
  const [lampiran, setlampiran] = useState(
    'https://img.icons8.com/ios-glyphs/100/000000/camera.png',
  );
  const [lampiranPath, setlampiranPath] = useState();

  const [modal2, setModal2] = useState(false);
  const [lampiran2, setlampiran2] = useState(
    'https://img.icons8.com/ios-glyphs/100/000000/camera.png',
  );
  const [lampiranPath2, setlampiranPath2] = useState();

  const [modal3, setModal3] = useState(false);
  const [lampiran3, setlampiran3] = useState(
    'https://img.icons8.com/ios-glyphs/100/000000/camera.png',
  );
  const [lampiranPath3, setlampiranPath3] = useState();

  const [modalProgres, setModalProgres] = useState(false);

  // Fungsi untuk menjalankan ImagePicker Untuk mengambil gambar melalui Kamera
  const captureImage = async (setFile, setPath, setVisibility, key) => {
    let options = {
      maxWidth: 1280,
      maxHeight: 1024,
      quality: 1,
      saveToPhotos: true,
    };
    launchCamera(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode === 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode === 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode === 'others') {
        alert(response.errorMessage);
        return;
      }

      // Menjalankan fungsi upload gambar
      uploadFile(response.uri, setFile, setPath, key);
      // mematikan modal pilihan
      setVisibility(false);
    });
  };

  // // Fungsi untuk menjalankan ImagePicker Untuk mengambil gambar melalui file
  const chooseFile = async (setFile, setPath, setVisibility, key) => {
    let options = {
      maxWidth: 1280,
      maxHeight: 1024,
      quality: 1,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode === 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode === 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode === 'others') {
        alert(response.errorMessage);
        return;
      }
      // Menjalankan fungsi upload gambar
      uploadFile(response.uri, setFile, setPath, key);
      // mematikan modal pilihan
      setVisibility(false);
    });
  };

  // Fungsi Untuk Upload gambar ke fireStorage yang telah diambil dari kamera/file
  const uploadFile = (foto, setFile, setPath, key) => {
    // Untuk menampilkan modal proses
    setModalProgres(true);

    // Menentukan tanggal, bulan, tahun untuk validasi upload ke firestorage
    const tanggalAwal = ('0' + Tanggal.startDate.getDate()).slice(-2);
    const tanggalAkhir = ('0' + Tanggal.endDate.getDate()).slice(-2);
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
    const bulanAwal = bulan[Tanggal.startDate.getMonth()];
    const bulanAkhir = bulan[Tanggal.endDate.getMonth()];
    const tahunAwal = Tanggal.startDate.getFullYear();
    const tahunAkhir = Tanggal.endDate.getFullYear();
    const tanggalIzinAwal = `${tanggalAwal} ${bulanAwal} ${tahunAwal}`;
    const tanggalIzinAkhir = `${tanggalAkhir} ${bulanAkhir} ${tahunAkhir}`;

    // Untuk Mengupload gambar ke firebase
    const storageRef = storage().ref(
      `Izin/Lampiran${key}-${Data.nama}-${Data.id} ${tanggalIzinAwal}-${tanggalIzinAkhir}`,
    );
    storageRef.putFile(`${foto}`).on(
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
      () => {
        // Untuk mendapatkan url dari file yang kita upload
        storageRef.getDownloadURL().then((downloadUrl) => {
          setFile(downloadUrl);
          setPath(
            `Izin/Lampiran${key}-${Data.nama}-${Data.id} ${tanggalIzinAwal}-${tanggalIzinAkhir}`,
          );

          setModalProgres(false);
        });
      },
    );
  };

  // Fungsi untuk mengirim data ke firestore
  const submit = () => {
    setModalProgres(true);
    // Untuk mengambil list data dari jangka waktu izin dan memasukkannya ke array
    for (
      var arr = [], dt = new Date(Tanggal.startDate);
      dt <= Tanggal.endDate;
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(new Date(dt));
    }
    const listTanggal = arr;
    console.log('set tanggal');

    // Mengambil List Lampiran dan menggabungkannya menjadi satu array
    const file = [];
    // Mengambil List lampiranPath dan menggabungkannya menjadi satu array
    const filePath = [];
    // Pengkondisian untuk membuat array lampiran dan lampiranPath, jika lampiran masih default maka tidak akan membuat array lampiran & lampiranPath
    if (
      lampiran !== 'https://img.icons8.com/ios-glyphs/100/000000/camera.png'
    ) {
      file.push(lampiran);
      filePath.push(lampiranPath);
    }
    if (
      lampiran2 !== 'https://img.icons8.com/ios-glyphs/100/000000/camera.png'
    ) {
      file.push(lampiran2);
      filePath.push(lampiranPath2);
    }
    if (
      lampiran3 !== 'https://img.icons8.com/ios-glyphs/100/000000/camera.png'
    ) {
      file.push(lampiran3);
      filePath.push(lampiranPath3);
    }

    console.log('file');
    console.log(file);
    console.log(filePath);

    // membongkar array jangka waktu untuk dimasukkan kedalam batch supaya bisa di upload sekaligus
    listTanggal.forEach((tanggal) => {
      console.log('set batch item');
      // menentukan tanggal, bulan, tahun untuk data
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
      let date = ('0' + tanggal.getDate()).slice(-2);
      const tanggalLengkap = `${date} ${
        bulan[tanggal.getMonth()]
      } ${tanggal.getFullYear()}`;

      // Untuk menentukan nama document di firestore
      const doc = `${tanggalLengkap} - ${Data.nama} - ${Data.id}`;

      // Untuk mengupload
      const data = {
        Periode: `${bulan[tanggal.getMonth()]} ${tanggal.getFullYear()}`,
        Tanggal: `${date} `,
        CheckIn: 'Izin',
        CheckOut: 'Izin',
        Lembur: '-',
        Kategori: `Izin - ${Kategori}`,
        Nama: Data.nama,
        Perihal: Perihal,
        Keterangan: Keterangan,
        UrlLampiran: file,
        pathLampiran: filePath,
      };

      // Memasukan data dan nama document ke dalam batch
      firestore()
        .collection('Absensi')
        .doc(doc)
        .set(data)
        .then(() => console.log('upload berhasil'));
    });
    console.log('Upload Data Berhasil');

    // Mengarahkan ke halaman utama
    navigation.goBack();
  };

  const cancel = () => {
    // Menghapus file lampiran di fireStorage
    if (
      lampiran !== 'https://img.icons8.com/ios-glyphs/100/000000/camera.png'
    ) {
      const storageRef = storage().ref(lampiranPath);
      storageRef.delete().then(() => {
        console.log('Data Berhasil Dihapus');
      });
    }
    if (
      lampiran2 !== 'https://img.icons8.com/ios-glyphs/100/000000/camera.png'
    ) {
      const storageRef = storage().ref(lampiranPath2);
      storageRef.delete().then(() => {
        console.log('Data Berhasil Dihapus');
      });
    }
    if (
      lampiran3 !== 'https://img.icons8.com/ios-glyphs/100/000000/camera.png'
    ) {
      const storageRef = storage().ref(lampiranPath3);
      storageRef.delete().then(() => {
        console.log('Data Berhasil Dihapus');
      });
    }
    // Untuk Mengarahkan kita kehalaman home
    navigation.goBack();
  };

  return (
    <Container>
      <Content>
        <H1 style={{textAlign: 'center', marginTop: 5}}>Form Izin</H1>
        <Form style={{width: '95%', alignSelf: 'center', marginTop: 5}}>
          <Label>Kategori</Label>
          <Item regular style={{marginVertical: 5}}>
            <Picker
              mode="dropdown"
              iosIcon={<Icon name="arrow-down" />}
              style={{width: undefined}}
              placeholderIconColor="#007aff"
              selectedValue={Kategori}
              onValueChange={(value) => setKategori(value)}>
              <Picker.Item label="Pilih Kategori" />
              <Picker.Item label="Sakit" value="Sakit" />
              <Picker.Item label="Musibah" value="Musibah" />
              <Picker.Item label="Acara Keluarga" value="Acara Keluarga" />
            </Picker>
          </Item>

          <Label>Jangka Waktu</Label>
          <View style={{marginVertical: 5}}>
            <RangeDatepicker
              range={Tanggal}
              onSelect={(nextRange) => setTanggal(nextRange)}
            />
          </View>

          <Label>Perihal</Label>
          <Item regular style={{marginVertical: 5}}>
            <Input
              placeholder="Masukkan Perihal"
              value={Perihal}
              onChangeText={(value) => setPerihal(value)}
            />
          </Item>

          <Label>Keterangan</Label>
          <Textarea
            style={{marginVertical: 5}}
            rowSpan={5}
            bordered
            placeholder="Masukkan Keterangan"
            value={Keterangan}
            onChangeText={(value) => setKeterangan(value)}
          />

          <Label>Lampiran</Label>
          <Container
            style={{
              height: 125,
              marginVertical: 5,
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}>
            <TouchableOpacity onPress={() => setModal(true)}>
              <Image
                style={{
                  width: 100,
                  height: 100,
                  borderWidth: 1,
                  borderColor: 'gray',
                }}
                source={{
                  uri: lampiran,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal2(true)}>
              <Image
                style={{
                  width: 100,
                  height: 100,
                  borderWidth: 1,
                  borderColor: 'gray',
                }}
                source={{
                  uri: lampiran2,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal3(true)}>
              <Image
                style={{
                  width: 100,
                  height: 100,
                  borderWidth: 1,
                  borderColor: 'gray',
                }}
                source={{
                  uri: lampiran3,
                }}
              />
            </TouchableOpacity>
          </Container>

          <Button block info style={{marginVertical: 5}} onPress={submit}>
            <Text> Kirim </Text>
          </Button>
          <Button block light style={{marginVertical: 5}} onPress={cancel}>
            <Text> Cancel </Text>
          </Button>

          <Modal
            style={{width: 300}}
            visible={modal}
            backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
            onBackdropPress={() => setModal(false)}>
            <Card disabled={true}>
              <Text>Lampiran 1</Text>
              <Button
                block
                style={{marginVertical: 5}}
                onPress={() =>
                  captureImage(setlampiran, setlampiranPath, setModal, 1)
                }>
                <Text> Camera </Text>
              </Button>
              <Button
                block
                style={{marginVertical: 5}}
                onPress={() =>
                  chooseFile(setlampiran, setlampiranPath, setModal, 1)
                }>
                <Text> File </Text>
              </Button>
              <Button block light onPress={() => setModal(false)}>
                <Text> Batal </Text>
              </Button>
            </Card>
          </Modal>
          <Modal
            style={{width: 300}}
            visible={modal2}
            backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
            onBackdropPress={() => setModal2(false)}>
            <Card disabled={true}>
              <Text>Lampiran 2</Text>
              <Button
                block
                style={{marginVertical: 5}}
                onPress={() =>
                  captureImage(setlampiran2, setlampiranPath2, setModal2, 2)
                }>
                <Text> Camera </Text>
              </Button>
              <Button
                block
                style={{marginVertical: 5}}
                onPress={() =>
                  chooseFile(setlampiran2, setlampiranPath2, setModal2, 2)
                }>
                <Text> File </Text>
              </Button>
              <Button block light onPress={() => setModal2(false)}>
                <Text> Batal </Text>
              </Button>
            </Card>
          </Modal>
          <Modal
            style={{width: 300}}
            visible={modal3}
            backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
            onBackdropPress={() => setModal3(false)}>
            <Card disabled={true}>
              <Text>Lampiran 3</Text>
              <Button
                block
                style={{marginVertical: 5}}
                onPress={() =>
                  captureImage(setlampiran3, setlampiranPath3, setModal3, 3)
                }>
                <Text> Camera </Text>
              </Button>
              <Button
                block
                style={{marginVertical: 5}}
                onPress={() =>
                  chooseFile(setlampiran3, setlampiranPath3, setModal3, 3)
                }>
                <Text> File </Text>
              </Button>
              <Button block light onPress={() => setModal3(false)}>
                <Text> Batal </Text>
              </Button>
            </Card>
          </Modal>
        </Form>
      </Content>

      {/* Modal Proses */}
      <Spinner
        visible={modalProgres}
        textContent={'Memproses...'}
        textStyle={{color: '#FFF'}}
      />
    </Container>
  );
};

export default IzinScreen;
