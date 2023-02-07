// import 'react-native-gesture-handler';
// import * as React from 'react';
// import {
//   SafeAreaView,
//   StatusBar,
//   useColorScheme,
//   AppState,
//   LogBox,
// } from 'react-native';
// import MainNavigator from './src/navigations/MainNavigator';
// function App() {
//   const appState = React.useRef(AppState.currentState);
//   const [appStateVisible, setAppStateVisible] = React.useState(
//     appState.current,
//   );
//   React.useEffect(() => {
//     LogBox.ignoreAllLogs();

//     // const subscription = AppState.addEventListener("change", nextAppState => {
//     //   if (
//     //     appState.current.match(/inactive|background/) &&
//     //     nextAppState === "active"
//     //   ) {
//     //     console.log("App has come to the foreground!");
//     //   }

//     //   appState.current = nextAppState;
//     //   setAppStateVisible(appState.current);
//     //   console.log("AppState", appState.current);
//     // });

//     // return () => {
//     //   subscription.remove();
//     // };
//   }, []);
//   const isDarkMode = useColorScheme() === 'dark';
//   console.log('APPcsllll');
//   return (
//     <SafeAreaView style={{flex: 1}}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor="#FFFFFF"
//       />

//       <MainNavigator />
//     </SafeAreaView>
//   );
// }
// export default App;



import React from 'react';

// Import React native Components
import {
  Text,
  View,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';

import { writeFile,DownloadDirectoryPath,DocumentDirectoryPath } from 'react-native-fs';
const Save  = () => {
  const fileUrl = 'https://www.techup.co.in/wp-content/uploads/2020/01/techup_logo_72-scaled.jpg';


  const exportData =()=>{
    let sampleData=['2e','2r','5T']
   const data= sampleData.toString()
    // let wb=XLSX.utils.book_new();
    // let ws=XLSX.utils.json_to_sheet(sampleData)
    // XLSX.utils.book_append_sheet(wb,ws,"Users");
    // const wbout=XLSX.write(wb,{type:'file',bookType:'xlsx'})
    var path = DownloadDirectoryPath + '/texts.csv';
    // console.log(DownloadDirectoryPath,"DownloadDirectoryPath");
writeFile(path, data, 'utf8').then((res)=>{
  console.log(res,"exported");
  
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
          Alert.alert('Error','Storage Permission Not Granted');
        }
      } catch (err) {
        // To handle permission related exception
        console.log("++++"+err);
      }
    }
  };

  // const downloadFile = () => {
   
  //   // Get today's date to add the time suffix in filename
  //   let date = new Date();
  //   // File URL which we want to download
  //   let FILE_URL = fileUrl;    
  //   // Function to get extention of the file url
  //   let file_ext = getFileExtention(FILE_URL);
   
  //   file_ext = '.' + file_ext[0];
   
  //   // config: To get response by passing the downloading related options
  //   // fs: Root directory path to download
  //   const { config, fs } = RNFetchBlob;
  //   let RootDir = fs.dirs.PictureDir;
  //   let options = {
  //     fileCache: true,
  //     addAndroidDownloads: {
  //       path:
  //         RootDir+
  //         '/file_' + 
  //         Math.floor(date.getTime() + date.getSeconds() / 2) +
  //         file_ext,
  //       description: 'downloading file...',
  //       notification: true,
  //       // useDownloadManager works with Android only
  //       useDownloadManager: true,   
  //     },
  //   };
  //   config(options)
  //     .fetch('GET', FILE_URL)
  //     .then(res => {
  //       // Alert after successful downloading
  //       console.log('res -> ', JSON.stringify(res));
  //       alert('File Downloaded Successfully.');
  //     });
  // };

  const getFileExtention = fileUrl => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ?
             /[^.]+$/.exec(fileUrl) : undefined;
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 25, textAlign: 'center' }}>
          React Native File Download Example
        </Text>
       
      </View>
      <Image
        source={{
          uri: fileUrl,
        }}
        style={{
          width: '100%',
          height: 100,
          resizeMode: 'contain',
          margin: 5
        }}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={checkPermission}>
        <Text style={styles.text}>
          Download File
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Save;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
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