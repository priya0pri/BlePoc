import React,{useState,useEffect} from 'react'
import { View, Text,ScrollView, PermissionsAndroid,SafeAreaView,TouchableOpacity} from 'react-native'
import BluetoothSerial from 'react-native-bluetooth-serial-next';
export default function SerialUnpairedScreen() {
  const [bleDevice, setble] = useState([]);
  const [ble, sble] = useState({});
  const [loading, setloading] = useState(true);
  const backgroundStyle = {
    backgroundColor: "#F4F4F4",
    flex: 1,
    height: '100%',
  };
  useEffect(() => {
    fn();
   
  }, []);

  const fn = async () => {
  
    await BluetoothSerial.requestEnable();
    await BluetoothSerial.enable();
    let pairedDevice=await BluetoothSerial.list();
      let listunPairdevices = await BluetoothSerial.listUnpaired();
      console.log(listunPairdevices);
      setble(listunPairdevices);
    if(listunPairdevices.length>1){
      setloading(false)
    }
    
  
  };
  useEffect(() => {
      getdata();

    
  }, [ble]);
  let generatedData=[]
  const getdata = async () => {
    if (ble?.name) {
      console.log(ble, '000000');
     await BluetoothSerial.pairDevice(ble?.id);
      const device1 = await BluetoothSerial.connect(ble?.id);
      console.log(device1, '1010101');
      const isConnected = await BluetoothSerial.isConnected();
      console.log(isConnected, 'edkejd');
      if (isConnected) {
        // const data = await BluetoothSerial.readFromDevice();
        // console.log(data,"dwdwd");
         BluetoothSerial.read((data, subscription) => {
       console.log(data);
          setInterval(() => {
            var r=encodeURIComponent(data);
            var datas=r.replace(/%/g,'')
          generatedData.push(datas)
            
          }, 2000);
          navigation.navigate("ListDataScreen",{
            param: generatedData,
          })
          console.log(generatedData,"generatedData");
          if (subscription) {
            // BluetoothSerial.removeSubscription(subscription);
          }
        }, '\r\n');
      }
    }
  };
  return (
    <SafeAreaView style={backgroundStyle}>
    <View
       style={{
         height: '100%',
       }}>
        
  
       <ScrollView
         contentContainerStyle={{
           paddingBottom: 60,
           paddingHorizontal:20
         }}>
           {loading&&
           
           <Text style={{color:"black",fontSize:20,marginTop:20,marginLeft:10}}>Loading Device...., Please Wait</Text>}
         {bleDevice.map(data => {
           return (
             <TouchableOpacity
               style={{
                 width: '100%',
                 height: 70,
                 backgroundColor: '#FFF',
                 marginVertical: 10,
                 justifyContent:'center',
                 alignItems:'center'
               }}
               onPress={() => {
                 sble(data);
                
               }}>
               <Text>{data.name}</Text>
               <Text>{data.address}</Text>
             </TouchableOpacity>
           );
         })}
       </ScrollView>
     </View>
   </SafeAreaView>
  )
}