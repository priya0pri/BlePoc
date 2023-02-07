import { View, Text,FlatList, PermissionsAndroid,SafeAreaView,TouchableOpacity,ScrollView ,ActivityIndicator} from 'react-native'
import React,{useState,useEffect} from 'react'
import BluetoothSerial from 'react-native-bluetooth-serial-next';
export default function SerialPairedScreen({navigation}) {
   const [bleDevice, setble] = useState([]);
  const [ble, sble] = useState({});
  const [loading, setloading] = useState(true);
  const[loadData,setLoadData]=useState(false)
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
      setble(pairedDevice);
    if(pairedDevice.length>1){
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
      // await BluetoothSerial.pairDevice(ble?.id);
      const device1 = await BluetoothSerial.connect(ble?.id);
      console.log(device1, '1010101');
      const isConnected = await BluetoothSerial.isConnected();
      console.log(isConnected, 'edkejd');
      if (isConnected) {
        console.log(isConnected,"read");
        // const data = await BluetoothSerial.readOnce("\r\n");
        // // const data = await BluetoothSerial.readFromDevice();
        console.log(BluetoothSerial,"dwdwd");
        setLoadData(true)
        setTimeout(async() => {
          let t= await BluetoothSerial.readFromDevice()
          console.log(t,"huiii");
          generatedData.push(t)
          setLoadData(false)
          if(t.length>0){
            navigation.navigate("ListDataScreen",{
              param: generatedData,
            })
          }else{
            alert("No read Data")
          }
          
          // BluetoothSerial.read((data, subscription) => {
          //   console.log(data);
          //     //  setInterval(() => {
          //     //    var r=encodeURIComponent(data);
          //     //    var datas=r.replace(/%/g,'')
          //     //  generatedData.push(datas)
                 
          //     //  }, 2000);
          //      navigation.navigate("ListDataScreen",{
          //        param: data,
          //      })
          //      console.log(generatedData,"generatedData");
          //      if (subscription) {
          //        // BluetoothSerial.removeSubscription(subscription);
          //      }
          //    }, '\r');
        }, 20000)
    
      
      }
    }
  };
  return (
    <SafeAreaView style={backgroundStyle}>
     <View
        style={{
          height: '100%',
        }}>
          <View style={{width:"100%",alignItems:'center',flexDirection:'row',justifyContent:"space-between",paddingHorizontal:20}}>
          <TouchableOpacity onPress={()=>navigation.navigate("BleScreen")} style={{height:50,width:"45%",backgroundColor:"pink",marginTop:10,alignItems:'center',justifyContent:'center',borderRadius:8}}>
        <Text style={{color:"white",fontWeight:'bold'}}>BLE</Text>
        </TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate("unpairedDevice")} style={{height:50,width:"45%",backgroundColor:"#8ABEB7",marginTop:10,alignItems:'center',justifyContent:'center',borderRadius:8}}>
        <Text style={{color:"white",fontWeight:'bold'}}>List All Unpair device</Text>
        </TouchableOpacity>
        
          </View>
          {loadData?<View style={{marginTop:50}}>
                       <ActivityIndicator size="large" color="red" />
            <Text style={{color:"black",fontSize:20,marginTop:20,marginLeft:60}}>Data is loading....Please Wait</Text>
   
            </View>: <ScrollView
          contentContainerStyle={{
            paddingBottom: 60,
            paddingHorizontal:20
          }}>
            {loading&&
            <View style={{marginTop:50}}>
                       <ActivityIndicator size="large" color="blue" />
            <Text style={{color:"black",fontSize:20,marginTop:20,marginLeft:50}}>Loading Device...., Please Wait</Text>
   
            </View>}
           
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
        </ScrollView>}
       
      </View>
    </SafeAreaView>
  )
}