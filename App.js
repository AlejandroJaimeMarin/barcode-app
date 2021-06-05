import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';



function PantallaInicio({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title="Escanear"
        onPress={() => navigation.navigate('Escáner')}
      />
    </View>
  );
}

function PantallaEscaner({ navigation }) {

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [idProducto, setidProducto] = useState();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
 

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    //alert(`Bar code with type ${type} and data ${data} has been scanned!`);

    navigation.navigate('Resultados de la búsqueda', data);
    //buscarReferencia(data);
  }

  return (
    <View style={styles.container}>
    <Camera style={styles.camera}
        barCodeScannerSettings={{barCodeTypes: [BarCodeScanner.Constants.BarCodeType.ean13],}}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
    >
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}
          onPress={() => navigation.navigate('Inicio')}
        >
          <Text style={styles.text}> Volver </Text>
        </TouchableOpacity>
      </View>
    </Camera>
    {scanned && <Button title={'Volver a escanear'} onPress={() => setScanned(false)} />}
  </View>
  );
}

function PantallaResultados({ route, navigation }) {

  const [idProducto, setidProducto] = useState();
  const itemId  = route.params;


    useEffect(() => {
      db.transaction(tx => {
          tx.executeSql('Select * FROM productos WHERE id = ?', [itemId], (_, { rows }) =>
          setidProducto(rows.item(0).nombre)
            );
        })
    }, [])

  
    //Refencia buena 9780201379624
    //Refencia buena 8780201379625

    
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{idProducto}</Text>
    </View>
  );
}

const Stack = createStackNavigator();


/*async function openDatabase() {
  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  }
  await FileSystem.downloadAsync(
    Asset.fromModule(require('./assets/db/test.db')).uri,
    FileSystem.documentDirectory + 'SQLite/test.db'
  );
  return SQLite.openDatabase('test.db');
}*/



/**Versión no asíncrona */
function openDatabase() {
  if (!( FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
     FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  }
   FileSystem.downloadAsync(
    Asset.fromModule(require('./assets/db/productos.db')).uri,
    FileSystem.documentDirectory + 'SQLite/productos.db'
  );
  return SQLite.openDatabase('productos.db');
}

const db = openDatabase();




export default function App() {

  /*db.then((value) => {
    console.log(value);
  });*/

 /*useEffect(() => {
  db.transaction(tx => {
      tx.executeSql("select * from Prueba", [], (_, { rows }) =>
          console.log(rows._array)
        );
    })
  }, [])*/
  

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio">
        <Stack.Screen name="Inicio" component={PantallaInicio} />
        <Stack.Screen name="Escáner" component={PantallaEscaner} />
        <Stack.Screen name="Resultados de la búsqueda" component={PantallaResultados} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});

