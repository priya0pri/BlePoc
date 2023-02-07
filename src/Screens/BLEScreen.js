
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput
} from 'react-native';
// import and setup react-native-ble-manager
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

// import stringToBytes from convert-string package.
// this func is useful for making string-to-bytes conversion easier
import { stringToBytes } from 'convert-string';

// import Buffer function.
// this func is useful for making bytes-to-string conversion easier
const Buffer = require('buffer/').Buffer;

const Ble = ({navigation}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [list, setList] = useState([]);
  const peripherals = new Map();
  // const [testMode, setTestMode] = useState('read');
  const [Id, setId] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [text, onChangeText] = React.useState("{\"RequestData\":true}");
  // start to scan peripherals
  const startScan = () => {
    // skip if scan process is currenly happening
    if (isScanning) {
      return;
    }

    // first, clear existing peripherals
    peripherals.clear();
    setList(Array.from(peripherals.values()));

    // then re-scan it
    BleManager.scan([], 3, true)
      .then(() => {
        console.log('Scanning...');
        setIsScanning(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // handle discovered peripheral
  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);

    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }

    peripherals.set(peripheral.id, peripheral);
    setList(Array.from(peripherals.values()));
  };

  // handle stop scan event
  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  };
const disconnect=(id)=>{
  BleManager.disconnect(id)
  .then(() => {
    // Success code
    console.log("Disconnected");
  })
  .catch((error) => {
    // Failure code
    console.log(error,"disconnect err");
  });
}
  // handle disconnected peripheral
  const handleDisconnectedPeripheral = (data) => {
    console.log('Disconnected from ' + data.peripheral);

    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
  };

  // handle update value for characteristic
  const handleUpdateValueForCharacteristic = (data) => {
    console.log(
      'Received data from: ' + data.peripheral,
      'Characteristic: ' + data.characteristic,
      'Data: ' + data.value,
    );
  };

  // retrieve connected peripherals.
  // not currenly used
  const retrieveConnectedPeripheral = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      peripherals.clear();
      setList(Array.from(peripherals.values()));

      if (results.length === 0) {
        console.log('No connected peripherals');
      }

      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
    });
  };

  // update stored peripherals
  const updatePeripheral = (peripheral, callback) => {
    let p = peripherals.get(peripheral.id);
    if (!p) {
      return;
    }

    p = callback(p);
    peripherals.set(peripheral.id, p);
    setList(Array.from(peripherals.values()));
  };

  // get advertised peripheral local name (if exists). default to peripheral name
  const getPeripheralName = (item) => {
    if (item.advertising) {
      if (item.advertising.localName) {
        return item.advertising.localName;
      }
    }

    return item.name;
  };

  // connect to peripheral then test the communication
  const connectAndTestPeripheral = (peripheral) => {
    console.log(peripheral,"peripheral");
    // if (!peripheral) {
    //   return;
    // }

    // if (peripheral.connected) {
    //   BleManager.disconnect(peripheral.id);
    //   return;
    // }

    // connect to selected peripheral
   
    BleManager.connect(peripheral.id)
      .then(() => {
        console.log('Connected to ' + peripheral.id, peripheral);
alert("connected")
        // update connected attribute
        updatePeripheral(peripheral, (p) => {
          p.connected = true;
          return p;
        });

        // retrieve peripheral services info
        BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
          console.log('Retrieved peripheral services', peripheralInfo);

          // test read current peripheral RSSI value
          BleManager.readRSSI(peripheral.id).then((rssi) => {
            console.log('Retrieved actual RSSI value', rssi);

            // update rssi value
            updatePeripheral(peripheral, (p) => {
              p.rssi = rssi;
              return p;
            });
          });
          BleManager.requestMTU(peripheral.id, 512)
          .then((mtu) => {
            // Success code
            console.log("MTU size changed to " + mtu + " bytes");
          })
          .catch((error) => {
            // Failure code
            console.log(error);
          });
          // test read and write data to peripheral
          const serviceUUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
          const charasteristicUUID = '6E400006-B5A3-F393-E0A9-E50E24DCCA9E';

          console.log('peripheral id:', peripheral.id);
          console.log('service:', serviceUUID);
          console.log('characteristic:', charasteristicUUID);

          // switch (testMode) {
          //   case 'write':
          //     // ===== test write data
          //     const payload = 'test';
          //     const payloadBytes = stringToBytes(payload);
          //     console.log('payload:', payload);
          //     BleManager.write(peripheral.id, serviceUUID, charasteristicUUID, payloadBytes)
          //       .then((res) => {
          //         console.log('write response', res);
          //         alert(`your write data is"${payload}" Thank you!`);
          //       })
          //       .catch((error) => {
          //         console.log('write err', error);
          //       });
          //     break;

          //   case 'read':
          //     // ===== test read data
          //     BleManager.read(peripheral.id, serviceUUID, charasteristicUUID)
          //       .then((res) => {
          //         console.log('read response', res);
          //         if (res) {
          //           console.log(res,"response");
          //           const buffer = Buffer.from(res);
          //           const data = buffer.toString();
          //           console.log('data', data);
          //           alert("connected")
          //           // alert(`data"${data}"`);
          //           setTestMode(data)
          //         }
          //       })
          //       .catch((error) => {
          //         console.log('read err', error);
          //         alert(error);
          //       });
          //     break;

          //   case 'notify':
          //     // ===== test subscribe notification
          //     BleManager.startNotification(peripheral.id, serviceUUID, charasteristicUUID)
          //       .then((res) => {
          //         console.log('start notification response', res);
          //       });
          //     break;

          //   default:
          //     break;
          // }
        });
      })
      .catch((error) => {
        console.log('Connection error', error);
      });
  };
const  readData=(id)=>{
  const serviceUUID = '000000FF-0000-1000-8000-00805F9B34FB';
  const charasteristicUUID = '0000FF03-0000-1000-8000-00805F9B34FB';
  BleManager.read(id, serviceUUID, charasteristicUUID)
  .then((res) => {
    console.log('read response', res);
    if (res) {
      console.log(res,"response");
      const buffer = Buffer.from(res);
      const data = buffer.toString();
      console.log('data', data);
      alert(data)
      // alert(`data"${data}"`);
      // setTestMode(data)
    }
  })
  .catch((error) => {
    console.log('read err', error);
    alert(error);
  });
}

const writeData=(id)=>{
  const serviceUUID = '000000FF-0000-1000-8000-00805F9B34FB';
  const charasteristicUUID = '0000FF03-0000-1000-8000-00805F9B34FB';
  const payload =text;
  const payloadBytes = stringToBytes(payload);
  console.log('payload:', payload);
  BleManager.write(id, serviceUUID, charasteristicUUID, payloadBytes, 500)
    .then((res) => {
      console.log('write response', res);
      alert(`your write data is"${payload}" Thank you!`);
      setModalVisible(!modalVisible)
    })
    .catch((error) => {
      console.log('write err', error);
    });
}
const requestPermission = async () => {
  // alert("call")
  console.log(PermissionsAndroid,"PermissionsAndroid");
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
      title: "Request for Location Permission",
      message: "Bluetooth Scanner requires access to Fine Location Permission",
      buttonNeutral: "Ask Me Later",
      buttonNegative: "Cancel",
      buttonPositive: "OK"
    },
  );
  return (granted === PermissionsAndroid.RESULTS.GRANTED);
}
  // mount and onmount event handler

  useEffect(() => {
    console.log('Mount');
    requestPermission()
    // initialize BLE modules
    BleManager.start({ showAlert: false });

    // add ble listeners on mount
    bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    // check location permission only for android device
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r1) => {
        if (r1) {
          console.log('Permission is OK');
          return;
        }

        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r2) => {
          if (r2) {
            console.log('User accept');
            return
          }

          console.log('User refuse');
        });
      });
    }

    // remove ble listeners on unmount
    return () => {
      console.log('Unmount');

      bleEmitter.removeListener('BleManagerStopScan', handleStopScan);
      bleEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
      bleEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
      bleEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

    };
  }, []);

  // render list of devices
  const renderItem = (item) => {
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableOpacity onPress={() => connectAndTestPeripheral(item)}>
        <View style={styles.row}>
          <View style={{width:"60%"}}>
          <Text
            style={{
              fontSize: 14,
              textAlign: 'center',
              color: 'green',
              padding: 10,
            }}>
            {getPeripheralName(item)}
          </Text>
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
            }}>
            RSSI: {item.rssi}
          </Text>
          <Text
            style={{
              fontSize: 10,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
              paddingBottom: 20,
            }}>
            ID:{item.id}
          </Text>
          </View>
          <TouchableOpacity onPress={()=>readData(item.id)} style={{height:30,width:30,borderRadius:50,backgroundColor:"pink",justifyContent:'center',alignItems:'center',marginTop:10}}>
<Text style={{color:"white"}}>R</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>OpenModal(item.id)}  style={{height:30,width:30,borderRadius:50,backgroundColor:"gray",justifyContent:'center',alignItems:'center',marginTop:10}}>
<Text style={{color:"white"}}>W</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
 const OpenModal=(id)=>{
  setId(id)
      setModalVisible(true)
    }
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeAreaView}>
        {/* header */}
        <View style={styles.body}>
          <View style={styles.scanButton}>
            <TouchableOpacity   onPress={() => startScan()} style={{width:"100%",height:50,backgroundColor:"skyblue",justifyContent:'center',alignItems:'center',borderRadius:7}}>
              <Text style={{color:"#FFF",fontWeight:'bold',fontSize:18}}>Scan Devices</Text>
            </TouchableOpacity>
            <View style={{width:"100%",alignItems:'center',flexDirection:'row',justifyContent:"space-between",paddingHorizontal:20}}>
          <TouchableOpacity onPress={()=>navigation.navigate("PairedDeviceScreen")} style={{height:50,width:"45%",backgroundColor:"pink",marginTop:10,alignItems:'center',justifyContent:'center',borderRadius:8}}>
        <Text style={{color:"white",fontWeight:'bold'}}>List Paired Device</Text>
        </TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate("unpairedDevice")} style={{height:50,width:"45%",backgroundColor:"#8ABEB7",marginTop:10,alignItems:'center',justifyContent:'center',borderRadius:8}}>
        <Text style={{color:"white",fontWeight:'bold'}}>List All Unpair device</Text>
        </TouchableOpacity>
        
          </View>
          </View>
         
          <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Write to Device</Text>
            <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
      />
       <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => writeData(Id)}
            >
              <Text style={styles.textStyle}>Write Data</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
          {list.length === 0 && (
            <View style={styles.noPeripherals}>
              <Text style={styles.noPeripheralsText}>No peripherals</Text>
            </View>
          )}
        </View>

        {/* ble devices */}
        <FlatList
          data={list}
          renderItem={({item}) => renderItem(item)}
          keyExtractor={(item) => item.id}
        />

        {/* bottom footer */}
        {/* <View style={styles.footer}>
          <TouchableHighlight>
            <View style={styles.footerButton}>
              <Text>Write Data</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight>
            <View style={styles.footerButton}>
              <Text>Read Data</Text>
            </View>
          </TouchableHighlight>
        </View> */}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    // backgroundColor: "white",
  },
  body: {
    backgroundColor: "white",
  },
  scanButton: {
    margin: 10,
  },
  noPeripherals: {
    flex: 1,
    margin: 20,
  },
  noPeripheralsText: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  footerButton: {
    alignSelf: 'stretch',
    padding: 10,
    backgroundColor: 'grey',
  },
  row:{
    height:80,
    width:"90%",
    // backgroundColor:"pink",
    marginVertical:5,
    marginLeft:20,
    borderWidth:0.5,
    borderColor:"gray",
    borderRadius:5,
    flexDirection:'row',
    justifyContent:'space-evenly'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 0.6,
    padding: 10,
    width:"30%"
  },
});

export default Ble;