import React from 'react';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import {
  FlatList,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Button,
  Toast,
  
} from 'react-native';
import { Buffer } from 'buffer';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { err } from 'react-native-svg/lib/typescript/xml';
var mainArray = [] ;
export default class ConnectionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      data: [],
      polling: false,
      connection: false,
      connectionOptions: {
        DELIMITER: '9',
      },
      receivedData:[],
      getData:"",
      callData:"true",
      printData:[],
      receiveButton:false,
      accepting: false,
    };
  }
  /**
   * Removes the current subscriptions and disconnects the specified
   * device.  It could be possible to maintain the connection across
   * the application, but for now the connection is within the context
   * of this screen.
   */
  async componentWillUnmount() {
    if (this.state.connection) {
      try {
        await this.props.device.disconnect();
      } catch (error) {
        // Unable to disconnect from device
      }
    }
    this.uninitializeRead();
  }
  /**
   * Attempts to connect to the provided device.  Once a connection is
   * made the screen will either start listening or polling for
   * data based on the configuration.
   */
  // componentDidMount() {
  //   setTimeout(() => this.connect(), 0);
  // }
  async connect() {
    try {
      console.log("connectionpart",this.props.device);
      let connection = await this.props.device.isConnected();
      console.log( this.props.device,"deviceinfo");
      // alert(connection)
      if (!connection) {
        console.log("!!!!!!!!!connectionpart");
        this.addData({
          data: `Attempting connection to ${this.props.device.address}`,
          timestamp: new Date(),
          type: 'error',
        });
        console.log(this.state.connectionOptions,"connectionOptions");
        connection = await this.props.device.connect(this.state.connectionOptions);
        // console.log(this.props.device._bluetoothModule._nativeModule.readFromDevice(),"cconnection###",this.props.device.onDataReceived());
        let da=await this.props.device._bluetoothModule._nativeModule.readFromDevice(this.props.device.address).then((data)=>{
            console.log(data,"dAAAA");
          }).catch((err)=>console.log(err,"errrrrrr"))
        console.log(da,"dddd");
        // this.props.device._bluetoothModule._nativeModule.readFromDevice().then((data)=>{
        //   console.log(data,"dAAAA");
        // }).catch((err)=>console.log(err,"errrrrrr"))
        this.addData({
          data: 'Connection successful',
          timestamp: new Date(),
          type: 'info',
        });
      } else {
        console.log("elsepart");
        this.addData({
          data: `Connected to ${this.props.device.address}`,
          timestamp: new Date(),
          type: 'error',
        });
      }
      this.setState({ connection });
      // this.initializeRead();
     this.props.device.onDataReceived(async data =>{
        console.log(data,"dataaa",data.device.address);
      })
     
    setInterval(async() => {
      let data = await this.props.device.read();
      console.log (data,"readdata");
    }, 3000);
      
    } catch (error) {
      this.addData({
        data: `Connection failed: ${error.message}`,
        timestamp: new Date(),
        type: 'error',
      });
    }
  }
  async disconnect(disconnected) {
    try {
      if (!disconnected) {
        disconnected = await this.props.device.disconnect();
      }
      this.addData({
        data: 'Disconnected',
        timestamp: new Date(),
        type: 'info',
      });
      this.setState({ connection: !disconnected });
    } catch (error) {
      this.addData({
        data: `Disconnect failed: ${error.message}`,
        timestamp: new Date(),
        type: 'error',
      });
    }
    // Clear the reads, so that they don't get duplicated
    this.uninitializeRead();
  }
  initializeRead() {
   
    this.disconnectSubscription = RNBluetoothClassic.onDeviceDisconnected(() => this.disconnect(true));
    if (this.state.polling) {
      this.readInterval = setInterval(() => this.performRead(), 5000);
    } else {
        console.log("readdata",this.props.device);
        // this.setState({findDevice:false})
      this.readSubscription = this.props.device.onDataReceived(async data =>{
        console.log(data,"dataaa",data.device.address);
        this.setState({receiveButton:true})
        if(data.data=="reqdata"){
          
          try {
            // let connection = await this.props.device.isConnected();
            // console.log( this.props.device,"deviceinfo",connection);
            // // alert(connection)
            // if (!connection) {
            //   console.log("!!!!!!!!!connectionpart");
            //   this.addData({
            //     data: `Attempting connection to ${this.props.device.address}`,
            //     timestamp: new Date(),
            //     type: 'error',
            //   });
            //   console.log(this.state.connectionOptions,"connectionOptions");
            //   connection = await this.props.device.connect(this.state.connectionOptions);
            //   console.log(connection,"cconnection###");
            //   this.addData({
            //     data: 'Connection successful',
            //     timestamp: new Date(),
            //     type: 'info',
            //   });
            // } 
            console.log(`Attempting to sendback data to mobile`);
            let message = "sendreversedata" + '\r';
            let senddata=await RNBluetoothClassic.writeToDevice(
              data.device.address,
              message
            );
            console.log(senddata,"senddata");
            // this.readSubscription = this.props.device.onDataReceived(data =>{
            //   console.log(data,"reversedata");
            // })
            this.addData({
              timestamp: new Date(),
              data: this.state.text,
              type: 'sent',
            });
            let data = Buffer.alloc(10, 0xEF);
            await this.props.device.write(data);
            this.addData({
              timestamp: new Date(),
              data: `Byte array: ${data.toString()}`,
              type: 'sent',
            });
            this.setState({ text: undefined });
            const datas = [];
            datas.push(this.state.text);
          } catch (error) {
            console.log(error,"err to send");
            // this.setState({getData:error})
          }
          
        }
        // this.setState({receivedData:data.data})
       
        
        //   this.onReceivedData(data)

        
        // this.syncFunc(data)

        // this.sendBack()
      }
      );
    
    }
  }
  async connect2(){
    try {
      let connection = await this.props.device.isConnected();
      if (!connection) {
        connection = await this.props.device.connect({  CONNECTOR_TYPE: "rfcomm",
        DELIMITER: "\n",
        DEVICE_CHARSET:"utf-8",});
      }
  
      this.initializeRead();
    } catch (error) {
      // Handle error accordingly
    }
  }
  getData() {  
    // this.initializeRead("true")
   this.setState({getData:this.state.receivedData})
  }
  /**
   * Clear the reading functionality.
   */
  //  async sendBack() {
  //   try {
  //     console.log(`Attempting to send data ${this.state.text}`);
  //     let message = "sendback" + '\r';
  //     await RNBluetoothClassic.writeToDevice(
  //       this.props.device.address,
  //       message
  //     );
  //     this.addData({
  //       timestamp: new Date(),
  //       data: this.state.text,
  //       type: 'sent',
  //     });
  //     let data = Buffer.alloc(10, 0xEF);
  //     await this.props.device.write(data);
  //     this.addData({
  //       timestamp: new Date(),
  //       data: `Byte array: ${data.toString()}`,
  //       type: 'sent',
  //     });
  //     this.setState({ text: undefined });
  //     const datas = [];
  //     datas.push(this.state.text);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
  uninitializeRead() {
    if (this.readInterval) {
      clearInterval(this.readInterval);
    }
    if (this.readSubscription) {
      this.readSubscription.remove();
    }
  }
//  async afterRead() {
//   this.disconnectSubscription = RNBluetoothClassic.onDeviceDisconnected(() => this.disconnect(true));
//     if (this.state.polling) {
//       this.readInterval = setInterval(() => this.performRead(), 5000);
//     } else {
//       this.readSubscription = this.props.device.onDataReceived(data =>{
//         console.log(data,"dataaa");
//         this.setState({receivedData:data.data})
//         this.onReceivedData(data)
//         this.syncFunc(data)

//       }
//       );
//     }
// }
  
  /**
   * Handles the ReadEvent by adding a timestamp and applying it to
   * list of received data.
   *
   * @param {ReadEvent} event
   */
  async onReceivedData(event) {
    this.setState({findDevice:true})
    console.log(event,"receivedata");
    event.timestamp = new Date();
    this.addData({
      ...event,
      timestamp: new Date(),
      type: 'receive',
    });
  }
  async addData(message) {
    this.setState({ data: [message, ...this.state.data] });
  }
  /**
   * Attempts to send data to the connected Device.  The input text is
   * padded with a NEWLINE (which is required for most commands)
   */
  // async sendData() {
  //   // mainArray.push(this.state.text.toString());
  //   // await AsyncStorage.setItem('@MySuperStore:key', JSON.stringify(mainArray));
  //   // console.log(mainArray,"mainArray");
  //   // const sendData= await AsyncStorage.getItem('@MySuperStore:key');
  //   // this.setState({printData:JSON.parse(sendData)+ '\r'})
  //   try {
  //     console.log(`Attempting to sendback data ${this.state.text}`);
  //     let message = "sendreversedata" + '\r';
  //     await RNBluetoothClassic.writeToDevice(
  //       "D8:32:E3:28:55:1B",
  //       message
  //     );
  //     this.readSubscription = this.props.device.onDataReceived(data =>{
  //       console.log(data,"reversedata");
  //     })
  //     this.addData({
  //       timestamp: new Date(),
  //       data: this.state.text,
  //       type: 'sent',
  //     });
  //     let data = Buffer.alloc(10, 0xEF);
  //     await this.props.device.write(data);
  //     this.addData({
  //       timestamp: new Date(),
  //       data: `Byte array: ${data.toString()}`,
  //       type: 'sent',
  //     });
  //     this.setState({ text: undefined });
  //     const datas = [];
  //     datas.push(this.state.text);
  //   } catch (error) {
  //     console.log(error,"err to send");
  //   }
  // }
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
        // this.props.selectDevice
        console.log( this.props.selectDevice,"aceeptingconnectio");
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
  async requestData() {
    try {
      console.log(`Attempting to send data ${this.state.text}`,this.props.device.address);
      let message = "reqdata" + '\r';
      await RNBluetoothClassic.writeToDevice(
        this.props.device.address,
        message
      );
      this.addData({
        timestamp: new Date(),
        data: this.state.text,
        type: 'sent',
      });
      let data = Buffer.alloc(10, 0xEF);
      await this.props.device.write(data);
      this.addData({
        timestamp: new Date(),
        data: `Byte array: ${data.toString()}`,
        type: 'sent',
      });
      this.setState({ text: undefined });
      const datas = [];
      datas.push(this.state.text);
    } catch (error) {
      console.log(error,"err to send");
    }
  }
  async toggleConnection() {
    if (this.state.connection) {
      this.disconnect();
    } else {
      this.connect();
    }
  }

  async readData(){
    try {
      const message = await this.props.device.read();
      console.log(message,"readmessage");
    } catch (error) {
      // Handle error accordingly
    }
   }
  render() {
    return (
  <View>
   <View style={{margin:5}}>
            <Button title='arrow-back' onPress={this.props.onBack}>
            </Button>
            </View>
         <View style={{margin:5}}>
            <Button title='Toggle' transparent onPress={() => this.toggleConnection()}>
            </Button>
            </View>
            <View style={{margin:5}}>
        {/* <Button title='sync data' onPress={() =>this.sendData()}></Button> */}
        <Button title='Request data' onPress={() =>this.requestData()}></Button>
        </View>
        <View style={{margin:5}}>
        {/* <Button title='sync data' onPress={() =>this.sendData()}></Button> */}
        <Button title='Read data' onPress={() =>this.readData()}></Button>
        </View>
        {this.state.receiveButton?<View style={{margin:5}}>
        {/* <Button title='sync data' onPress={() =>this.sendData()}></Button> */}
        <Button title='Accept Back' onPress={() => this.acceptConnections()}></Button>
        </View>:null}
        <View style={{margin:5}}>
        {/* <Button title='sync data' onPress={() =>this.sendData()}></Button> */}
        <Button title='Toggle Back' onPress={() => this.connect2()}></Button>
        </View>
        <View style={{margin:20,}}>
            <Text>{this.props.device.name}</Text>
            <Text>{this.props.device.address}</Text>
            <Text>{this.state.getData}</Text>
            <Text>Device Data:{this.state.printData}</Text>
          </View>
        <View style={styles.connectionScreenWrapper}>
          <FlatList
            style={styles.connectionScreenOutput}
            contentContainerStyle={{ justifyContent: 'flex-end' }}
            inverted
            ref="scannedDataList"
            data={this.state.printData}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View
              backgroundColor='pink'
                flexDirection={'row'} justifyContent={'flex-start'}>
                <Text>{item}</Text>
                {/* <Text>{item.type === 'sent' ? ' < ' : ' > '}</Text> */}
                {/* <Text flexShrink={1}>{item.data.trim()}</Text> */}
              </View>
            )}
          />
          
          <InputArea
            text={this.state.text}
            onChangeText={(text) => this.setState({ text })}
            onSend={() => this.sendData()}
            disabled={!this.state.connection}
          />
        </View>
       
        </View>
    );
  }
}
const InputArea = ({ text, onChangeText, onSend, disabled }) => {
  let style = disabled ? styles.inputArea : styles.inputAreaConnected;
  return (
    <View style={style}>
      <TextInput
        style={styles.inputAreaTextInput}
        placeholder={'Command/Text'}
        value={text}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={onSend}
        returnKeyType="send"
        disabled={disabled}
      />
       {/* <TouchableOpacity
        style={styles.inputAreaSendButton}
        onPress={onSend}
        >
        <Text style={{color:disabled?"red":"green"}}>Add</Text>
      </TouchableOpacity> */}
    </View>
  );
};
/**
 * TextInput and Button for sending
 */
const styles = StyleSheet.create({
  connectionScreenWrapper: {
    flex: 1,
  },
  connectionScreenOutput: {
    flex: 1,
    paddingHorizontal: 8,
    backgroundColor:"pink"
  },
  inputArea: {
    flexDirection: 'row',
    alignContent: 'stretch',
    backgroundColor: 'red',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  inputAreaConnected: {
    flexDirection: 'row',
    alignContent: 'stretch',
    backgroundColor: '#90EE90',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  inputAreaTextInput: {
    flex: 1,
    height: 40,
  },
  inputAreaSendButton: {
    justifyContent: 'center',
    flexShrink: 1,
    height:40,
  },
});