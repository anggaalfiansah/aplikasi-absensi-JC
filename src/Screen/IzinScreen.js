/* eslint-disable prettier/prettier */
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

const IzinScreen = ({route, navigation}) => {
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
  const [modal2, setModal2] = useState(false);
  const [lampiran2, setlampiran2] = useState(
    'https://img.icons8.com/ios-glyphs/100/000000/camera.png',
  );
  const [modal3, setModal3] = useState(false);
  const [lampiran3, setlampiran3] = useState(
    'https://img.icons8.com/ios-glyphs/100/000000/camera.png',
  );

  const captureImage = async (setFile, setVisibility, key) => {
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
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }

      uploadFile(response.uri, setFile, key);
      setVisibility(false);
    });
  };

  const chooseFile = async (setFile, setVisibility, key) => {
    let options = {
      maxWidth: 1280,
      maxHeight: 1024,
      quality: 1,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      uploadFile(response.uri, setFile, key);
      setVisibility(false);
    });
  };

  const uploadFile = (foto, setFile, key) => {
    const hariIni = new Date();
    const tanggalSekarang = hariIni.getDate();
    const bulan = [
      'Januari',
      'Februari',
      'Marcet',
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
    const tanggalIzin = `${tanggalSekarang} ${bulanSekarang} ${tahunSekarang}`;

    console.log('Mengupload File');
    const storageRef = storage().ref(
      `Izin/Lampiran${key} ${tanggalIzin}-${Data.nama}`,
    );
    storageRef.putFile(`${foto}`).on(
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
        storageRef.getDownloadURL().then((downloadUrl) => setFile(downloadUrl));
      },
    );
  };

  const submit = () => {
    for (
      var arr = [], dt = new Date(Tanggal.startDate);
      dt <= Tanggal.endDate;
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(new Date(dt));
    }
    const listTanggal = arr;

    // Mengambil List Lampiran
    const file = [];
    if (
      lampiran !== 'https://img.icons8.com/ios-glyphs/100/000000/camera.png'
    ) {
      file.push(lampiran);
    }
    if (
      lampiran2 !== 'https://img.icons8.com/ios-glyphs/100/000000/camera.png'
    ) {
      file.push(lampiran2);
    }
    if (
      lampiran3 !== 'https://img.icons8.com/ios-glyphs/100/000000/camera.png'
    ) {
      file.push(lampiran3);
    }

    const db = firestore();
    const batch = db.batch();

    listTanggal.forEach((tanggal) => {
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
      const tanggalLengkap = `${tanggal.getDate()} ${
        bulan[tanggal.getMonth()]
      } ${tanggal.getFullYear()}`;
      const doc = `${tanggalLengkap} - ${Data.nama} - ${Data.id}`;
      const data = {
        Periode: `${bulan[tanggal.getMonth()]} ${tanggal.getFullYear()}`,
        Tanggal: `${tanggal.getDate()} `,
        CheckIn: 'Izin',
        CheckOut: 'Izin',
        Lembur: '-',
        Kategori: `Izin - ${Kategori}`,
        Nama: Data.nama,
        Perihal: Perihal,
        Keterangan: Keterangan,
        UrlLampiran: file,
      };
      batch.set(db.collection('Absensi').doc(doc), data);
    });
    batch.commit().then(() => console.log('Upload Success'));

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
                onPress={() => captureImage(setlampiran, setModal, 1)}>
                <Text> Camera </Text>
              </Button>
              <Button
                block
                style={{marginVertical: 5}}
                onPress={() => chooseFile(setlampiran, setModal, 1)}>
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
                onPress={() => captureImage(setlampiran2, setModal2, 2)}>
                <Text> Camera </Text>
              </Button>
              <Button
                block
                style={{marginVertical: 5}}
                onPress={() => chooseFile(setlampiran2, setModal2, 2)}>
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
                onPress={() => captureImage(setlampiran3, setModal3, 3)}>
                <Text> Camera </Text>
              </Button>
              <Button
                block
                style={{marginVertical: 5}}
                onPress={() => chooseFile(setlampiran3, setModal3, 3)}>
                <Text> File </Text>
              </Button>
              <Button block light onPress={() => setModal3(false)}>
                <Text> Batal </Text>
              </Button>
            </Card>
          </Modal>
        </Form>
      </Content>
    </Container>
  );
};

export default IzinScreen;
