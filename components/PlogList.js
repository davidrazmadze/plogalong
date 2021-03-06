import * as React from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import moment from 'moment';

import { formatDuration } from '../util';
import Colors from '../constants/Colors';
import Options from '../constants/Options';

import ProfilePlaceholder from './ProfilePlaceholder';

function formatDate(dt) {
    return moment(dt).format('MMMM Do');
}

class Plog extends React.PureComponent {
  onHeartPress = () => {
    this.props.likePlog(this.props.plogInfo.id, !this.props.liked);
  }

    showPhotos = () => {
        this.props.navigation.navigate('PhotoViewer', {
            photos: this.props.plogInfo.plogPhotos || []
        });
    }

    render() {
        const props = this.props;
        const {plogInfo, currentUserID, liked, likePlog} = props;
        const ActivityIcon = Options.activities.get(
            plogInfo.activityType
        ).icon;

        const {
            id, location: { lat, lng }, likeCount, plogPhotos = [], timeSpent,
            trashTypes = [], userID, userDisplayName, userProfilePicture, when,
            saving
        } = plogInfo;
        const latLng = { latitude: lat, longitude: lng };
        const me = userID === currentUserID;

        return (
            <View>
              <View style={[styles.plogStyle, saving && styles.savingStyle]}>
                {
                    userProfilePicture ?
                        <Image source={{ uri: userProfilePicture }} style={styles.profileImage} /> :
                    <ProfilePlaceholder style={styles.profileImage} />
                }
                <View style={styles.plogInfo}>
                  <Text style={styles.actionText} adjustsFontSizeToFit>
                    {me ? 'You' : ((userDisplayName||'').trim() || 'Anonymous')} plogged {timeSpent ? `for ${formatDuration(timeSpent)}` : `on ${formatDate(new Date(when))}`}.
                  </Text>
                  <Text style={styles.subText}>
                    {moment(when).fromNow()}
                  </Text>
                </View>
              </View>
              <View style={styles.plogStyle}>
                <MapView
                  style={styles.map}
                  region={{
                      ...latLng,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.04,
                  }}
                  showsMyLocationButton={false}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker coordinate={latLng}
                          tracksViewChanges={false}
                  >
                    <ActivityIcon
                      width={40}
                      height={40}
                      fill={Colors.activeColor}
                    />
                  </Marker>
                </MapView>
                {
                    plogPhotos && plogPhotos.length ?
                        <ScrollView contentContainerStyle={styles.photos}>
                          {plogPhotos.map(({uri}) => (
                              <TouchableOpacity onPress={this.showPhotos} key={uri}>
                                <Image source={{uri}} key={uri} style={{width: 'auto', height: 100, marginBottom: 10}}/>
                              </TouchableOpacity>))}
                        </ScrollView> :
                    null
                }
              </View>
              <View style={[styles.plogStyle, styles.detailsStyle]}>
                <Text style={styles.subText}>
                  Cleaned up {!trashTypes || !trashTypes.length ? 'trash' :
                              trashTypes.map(type => Options.trashTypes.get(type).title.toLowerCase()).join(', ')}.
                </Text>
                <TouchableOpacity onPress={this.onHeartPress}>
                  <View style={styles.likeCount}>
                    {likeCount - (liked ? 1 : 0) > 0 && <Text style={styles.likeCountText}>{likeCount}</Text>}
                    <Ionicons size={20} name={'md-heart'} style={{color: 666666}}/>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
        );
    }
};

const Divider = () => (
    <View style={styles.divider}></View>
);

const doesUserLikePlog = (user, plogID) => {
  return (user && user.data && user.data.likedPlogs && user.data.likedPlogs[plogID]);
};

const likedPlogIds = user => (
    user && user.data && user.data.likedPlogs && JSON.stringify(user.data.likedPlogs)
);

const PlogList = ({plogs, currentUser, filter, header, footer, likePlog}) => {
    const navigation = useNavigation();

    return (
        <FlatList data={filter ? plogs.filter(filter) : plogs}
                  renderItem={({item}) => (<Plog plogInfo={item}
                                                 currentUserID={currentUser && currentUser.uid}
                                                 liked={doesUserLikePlog(currentUser, item.id)}
                                                 likePlog={likePlog}
                                                 navigation={navigation}
                                           />)}
                  keyExtractor={(item) => item.id}
                  extraData={likedPlogIds(currentUser)}
                  ItemSeparatorComponent={Divider}
                  ListHeaderComponent={header}
                  ListFooterComponent={footer} />
    );
};

const styles = StyleSheet.create({
    plogStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10,
        paddingBottom: 0,
    },
    plogInfo: {
      paddingTop: 5,
      flex: 1
    },
    detailsStyle: {
      justifyContent: 'space-between',
    },
    likeCount: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    likeCountText: {
      marginRight: 8,
    },
    savingStyle: {
        opacity: 0.8,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#DCDCDC',
        marginTop: 10
    },
    profileImage: {
        margin: 10,
        width: 50,
        height: 50,
    },
    actionText: {
        fontSize: 18
    },
    subText: {
        color: Colors.textGray,
        flex: 1
    },
    map: {
        borderColor: Colors.borderColor,
        borderWidth: 1,
        flex: 3,
        height: 300,
        margin: 5
    },
    photos: {
        flexDirection: 'column',
        alignSelf: 'stretch',
        justifyContent: 'flex-start',
        height: 300,
        overflow: 'scroll',
        margin: 5,
        flex: 1
    }
});

export default PlogList;
