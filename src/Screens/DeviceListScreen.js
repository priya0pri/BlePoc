import React,{Component} from 'react';
import { Platform } from 'react-native';

import RNBluetoothClassic from 'react-native-bluetooth-classic';
import {
  PermissionsAndroid,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  Button,
  Toast,
  ScrollView
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
/**
 * See https://reactnative.dev/docs/permissionsandroid for more information
 * on why this is required (dangerous permissions).
 */
  const manager = new BleManager();
const requestAccessFineLocationPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Access fine location required for discovery',
      message:
        'In order to perform discovery, you must enable/allow ' +
        'fine location access.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

class BlinkingText extends Component {
    constructor(props) {
      super(props);
      this.state = {showText: true};
   
      // Change the state every second 
      setInterval(() => {
        this.setState(previousState => {
          return { showText: !previousState.showText };
        });
      }, 
      // Define any blinking time.
      700);
    }
   
    render() {
        
      let display = this.state.showText ? this.props.text : ' ';
      return (
        <Text style = {{ fontWeight: 'bold', fontSize : 20,color:'red' }}>{display}</Text>
      );
    }
  }
export default class DeviceListScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      devices: [],
      accepting: false,
      discovering: false,
    };
  }

  componentDidMount() {
    this.getBondedDevices();
  }

  componentWillUnmount() {
    if (this.state.accepting) {
      this.cancelAcceptConnections(false);
    }

    if (this.state.discovering) {
      this.cancelDiscovery(false);
    }
  }

  /**
   * Gets the currently bonded devices.
   */
  getBondedDevices = async (unloading) => {
    console.log('DeviceListScreen::getBondedDevices');
    try {
      let bonded = await RNBluetoothClassic.getBondedDevices();
      console.log('DeviceListScreen::getBondedDevices found', bonded);

      if (!unloading) {
        this.setState({ devices: bonded });
      }
    } catch (error) {
      this.setState({ devices: [] });

      Toast.show({
        text: error.message,
        duration: 5000,
      });
    }
  };

  /**
   * Starts attempting to accept a connection.  If a device was accepted it will
   * be passed to the application context as the current device.
   */
  acceptConnections = async () => {
    if (this.state.accepting) {
      Toast.show({
        text: 'Already accepting connections',
        duration: 5000,
      });

      return;
    }

    this.setState({ accepting: true });

    try {
      let device = await RNBluetoothClassic.accept({ delimiter: '\r' });
      if (device) {
        this.props.selectDevice(device);
        this.props.selectDevice
      }
    } catch (error) {
      // If we're not in an accepting state, then chances are we actually
      // requested the cancellation.  This could be managed on the native
      // side but for now this gives more options.
      if (!this.state.accepting) {
        Toast.show({
          text: 'Attempt to accept connection failed.',
          duration: 5000,
        });
      }
    } finally {
      this.setState({ accepting: false });
    }
  };

  /**
   * Cancels the current accept - might be wise to check accepting state prior
   * to attempting.
   */
  cancelAcceptConnections = async () => {
    if (!this.state.accepting) {
      return;
    }

    try {
      let cancelled = await RNBluetoothClassic.cancelAccept();
      this.setState({ accepting: !cancelled });
    } catch (error) {
      Toast.show({
        text: 'Unable to cancel accept connection',
        duration: 2000,
      });
    }
  };

  startDiscovery = async () => {
    try {
      let granted = await requestAccessFineLocationPermission();

      if (!granted) {
        throw new Error('Access fine location was not granted');
      }

      this.setState({ discovering: true });

      let devices = [...this.state.devices];

      try {
        let unpaired = await RNBluetoothClassic.startDiscovery();

        let index = devices.findIndex(d => !d.bonded);
        if (index >= 0) { devices.splice(index, devices.length - index, ...unpaired); }
        else { devices.push(...unpaired); }

        Toast.show({
          text: `Found ${unpaired.length} unpaired devices.`,
          duration: 2000,
        });
      } finally {
        this.setState({ devices, discovering: false });
      }
    } catch (err) {
      Toast.show({
        text: err.message,
        duration: 2000,
      });
    }
  };

  cancelDiscovery = async () => {
    try {
    } catch (error) {
      Toast.show({
        text: 'Error occurred while attempting to cancel discover devices',
        duration: 2000,
      });
    }
  };

  requestEnabled = async () => {
    try {
       const enable=await RNBluetoothClassic.isBluetoothEnabled();
       console.log(enable,"enable");
    } catch (error) {
      Toast.show({
        text: `Error occurred while enabling bluetooth: ${error.message}`,
        duration: 200,
      });
    }
  };

  render() {
    let toggleAccept = this.state.accepting
      ? () => this.cancelAcceptConnections()
      : () => this.acceptConnections();

    let toggleDiscovery = this.state.discovering
      ? () => this.cancelDiscovery()
      : () => this.startDiscovery();

    return (
   <View >
      
          {this.props.bluetoothEnabled ? (
            
             
               <View >
                <View style={{margin:5}}>
                 <Button onPress={this.getBondedDevices} title="Connect Device">
              </Button>
              </View>
              <View style={{margin:5}}>
              <Button title= {this.state.accepting
                     ? 'Accepting (cancel)...'
                     : 'Accept Connection'} onPress={toggleAccept}>
                
               </Button>
              </View>
              <View style={{margin:5}}>
              <Button title={this.state.discovering
                     ? 'Finding (cancel)...'
                     : 'Find Devices'} onPress={toggleDiscovery}>
                
               </Button>
              </View>
              
             </View>
           
          ) : (
              undefined
            )}

        {this.props.bluetoothEnabled ? (
          <>
            <DeviceList
              devices={this.state.devices}
              onPress={this.props.selectDevice}
              onLongPress={this.props.selectDevice}
            />


            {/* {Platform.OS !== 'ios' ? (
              <View >
                <Button title= {this.state.accepting
                      ? 'Accepting (cancel)...'
                      : 'Accept Connection'} onPress={toggleAccept}>
                 
                </Button>
                <Button title={this.state.discovering
                      ? 'Discovering (cancel)...'
                      : 'Discover Devices'} onPress={toggleDiscovery}>
                 
                </Button>
              </View>
            ) : (
                undefined
              )} */}
          </>
        ) : (
           <View >
            <View style={{height:30,width:"100%",justifyContent:'center',alignItems:'center',marginTop:20}}>
            <BlinkingText text='Please enable Bluetooth' />
              </View>
              <TouchableOpacity  onPress={async () => {
            const btState = await manager.state()
            // test is bluetooth is supported
            if (btState==="Unsupported") {
              alert("Bluetooth is not supported");
              return (false);
            }
            // enable if it is not powered on
            if (btState=="PoweredOn") {
                await manager.disable();
              } else {
                await manager.enable();
              }
            return (true);
          }}
           style={{height:"30%",width:"70%",backgroundColor:"#A5F1E9",marginLeft:"15%",justifyContent:'center',alignItems:'center',marginTop:50,borderRadius:10}}>
                <Text style={{color:"black",fontWeight:'bold',fontSize:18}}>Enable Bluetooth</Text>
              </TouchableOpacity>
             
         </View>
          )}
     </View>
    );
  }
}

/**
 * Displays a list of Bluetooth devices.
 *

 */
export const DeviceList = ({ devices, onPress, onLongPress }) => {
  const renderItem = ({ item }) => {
    return (
      <DeviceListItem
        device={item}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
  };

  return (
    <FlatList
      data={devices}
      renderItem={renderItem}
      keyExtractor={item => item.address}
    />
  );
};

export const DeviceListItem = ({ device, onPress, onLongPress }) => {
  let bgColor = device.connected ? 'green' : 'white';
  let icon = device.bonded ? 'ios-bluetooth' : 'ios-cellular';

  return (
    <ScrollView>
    <TouchableOpacity
      onPress={() => onPress(device)}
      onLongPress={() => onLongPress(device)}
      style={{...styles.deviceListItem,backgroundColor:bgColor}}>
     
      <View>
        <Text>{device.name}</Text>
        <Text note>{device.address}</Text>
      </View>
    </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  deviceListItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    flex:1
  },
  deviceListItemIcon: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
