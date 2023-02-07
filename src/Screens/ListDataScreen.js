import { View, Text,FlatList,ScrollView,StyleSheet ,PermissionsAndroid,TouchableOpacity} from 'react-native'
import React,{useEffect,useCallback,useState} from 'react'
import { writeFile,DownloadDirectoryPath,DocumentDirectoryPath } from 'react-native-fs';
export default function ListDataScreen({route}) {
  useEffect(() => {
    console.log(route.params.param,"parammmmmmmmmmm") 
   
  }, [])
   
  const onTextLayout = useCallback(event =>{
    console.log(event.nativeEvent.lines.length,"length");
  }, []);
  const exportData =()=>{
   
   const data= route.params.param.toString()
    var path = DownloadDirectoryPath + '/serial.csv';
    // console.log(DownloadDirectoryPath,"DownloadDirectoryPath");
writeFile(path, data, 'utf8').then((res)=>{
  alert("File Downloaded Successfully....!!!!")
  
}).catch((err)=>console.log(err))
  }
  const checkPermission = async () => {
    
    // Function to check the platform
    // If Platform is Android then check for permissions.

    if (Platform.OS === 'ios') {
      // downloadFile();
      exportData()
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'Application needs access to your storage to download File',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Start downloading
          // downloadFile();
          exportData()
          console.log('Storage Permission Granted.');
        } else {
          // If permission denied then show alert
        alert('Error','Storage Permission Not Granted');
        }
      } catch (err) {
        // To handle permission related exception
        console.log("++++"+err);
      }
    }
  };
  return (
    <View style={{backgroundColor:'black',paddingHorizontal:5,alignItems:"center"}}>
       <TouchableOpacity
        style={styles.button}
        onPress={checkPermission}>
        <Text style={styles.texts}>
          Download File
        </Text>
      </TouchableOpacity>
     <ScrollView style={styles.scrollView}>
        <Text   onTextLayout={onTextLayout}  style={styles.text}>
         {route.params.param}
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'black',
  },
  text: {
    fontSize: 13,
    color:"lightgreen",
    fontWeight:'bold',
    lineHeight:40
  },
  texts: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    padding: 5,
  },
  button: {
    width: '80%',
    padding: 10,
    backgroundColor: 'blue',
    margin: 10,
  },
});