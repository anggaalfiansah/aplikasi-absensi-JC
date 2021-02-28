import {Button, H3} from 'native-base';
import React, {useEffect, useState} from 'react';
import {View, Text, Image} from 'react-native';

const CheckInResultScreen = ({route, navigation}) => {
  const data = route.params.DataCheckIn;
  console.log(data)
  return (
    <View
      style={{
        flex: 1,
        alignSelf: 'center',
        paddingVertical: 10,
        backgroundColor: 'pink',
      }}>
      <View style={{width: 425, height: 425, alignItems: 'center'}}>
        <Image
          source={{uri: data.UrlGambar}}
          style={{width: '80%', height: '80%'}}
        />
      </View>
      <H3 style={{textAlign: 'center', marginBottom: 20}}>Chek In Berhasil</H3>
      <Text style={{textAlign: 'center'}}>
        Berhasil Chek In Pada Pukul {data.CheckIn}
      </Text>
      <Text style={{textAlign: 'center'}}>GeoTag ({data.Location})</Text>
      <Button
        block
        success
        style={{marginHorizontal: 20, marginVertical: 15}}
        onPress={()=>navigation.navigate('Home')}>
        <Text style={{fontSize: 20}}>Done</Text>
      </Button>
    </View>
  );
};

export default CheckInResultScreen;
