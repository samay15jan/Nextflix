import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, TextInput, SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import AntDesign from '@expo/vector-icons/AntDesign';
import { FiltersEngine, Request } from '@cliqz/adblocker';

export default function Index() {
  const [menu, setMenu] = useState(null);
  const [contentName, setContentName] = useState(null);
  const [TMDB_Id, setTMDBId] = useState(null);
  const API_KEY = 'YOUR TMDB API KEY';
  const searchType = menu === 'Movies' ? 'movie' : 'tv';
  const URL = TMDB_Id ? `https://vidsrc.net/embed/${searchType}?tmdb=${TMDB_Id}` : '';

  const getDetails = async () => {
    if (!contentName.trim()) return;

    try {
      const encodedTitle = encodeURIComponent(contentName);
      const searchType = menu === 'Movies' ? 'movie' : 'tv';
      const response = await fetch(`https://api.themoviedb.org/3/search/${searchType}?query=${encodedTitle}&api_key=${API_KEY}&include_adult=false`);

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const searchData = await response.json();
      const id = searchData?.results?.[0]?.id;
      setTMDBId(id);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    setMenu(null)
    setContentName(null)
    setTMDBId(null)
  }

  return (
    <SafeAreaView style={styles.container}>
      {!TMDB_Id ? (
        <>
          <Text style={styles.heading}>
            {!menu ? 'What do you want to watch?' : `Search For ${menu}`}
          </Text>
          <View style={styles.subContainer}>
            {!menu ? (
              <View style={styles.blocksContainer}>
                <TouchableOpacity style={styles.block} onPress={() => setMenu('Movies')}>
                  <Text style={styles.blockText}>Movies</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.block} onPress={() => setMenu('TV Series')}>
                  <Text style={styles.blockText}>TV Series</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  onChangeText={setContentName}
                  value={contentName}
                  placeholder={`Search ${menu}`}
                  onSubmitEditing={getDetails}
                  autoFocus
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => setMenu(null)} style={styles.button}>
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={getDetails} style={styles.button}>
                    <Text style={styles.buttonText}>Search</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </>
      ) : (
        <>
          <AntDesign onPress={handleClose} name="closesquare" style={{ position: 'absolute', top: 30, right: 10, zIndex: 1 }} size={30} color="white" />
          {TMDB_Id && URL &&
            <AdBlockingWebView
              source={{ uri: URL }}
              style={styles.webView}
            />
          }
        </>
      )}
    </SafeAreaView >
  );
}

const AdBlockingWebView = ({ source, ...props }) => {
  const [engine, setEngine] = useState(null);

  useEffect(() => {
    const initEngine = async () => {
      const adblockEngine = await FiltersEngine.fromPrebuiltAdsOnly(fetch);
      setEngine(adblockEngine);
    };

    initEngine();
  }, []);

  const onShouldStartLoadWithRequest = (request) => {
    if (!engine) return true;

    const { url, mainDocumentUrl } = request;

    const requestDetails = Request.fromRawDetails({
      type: request.type,
      url: url || mainDocumentUrl,
    });

    const { match } = engine.match(requestDetails);
    if (match) {
      console.log(`Blocked request to: ${url}`);
      return false;
    }

    return true;
  };

  return (
    <WebView
      source={source}
      {...props}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      incognito
      allowsFullscreenVideo
      allowsAirPlayForMediaPlayback
      allowsPictureInPictureMediaPlayback
      forceDarkOn
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1017',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 30,
    marginTop: 30,
  },
  subContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  blocksContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 30,
  },
  block: {
    flex: 1,
    marginHorizontal: 5,
    borderColor: '#2d313a',
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: '#161b21',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  blockText: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
  },
  input: {
    fontSize: 20,
    borderColor: '#2d313a',
    borderWidth: 2,
    padding: 10,
    width: '80%',
    color: 'white',
    backgroundColor: '#161b21',
    borderRadius: 5,
    marginTop: 60,
    marginBottom: 60,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
  },
  button: {
    width: 120,
    height: 40,
    borderColor: '#2d313a',
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: '#161b21',
    paddingTop: 8,
    transitionDuration: '0.3s',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  webView: {
    flex: 1,
    backgroundCOlor: '#121212',
  }
});
