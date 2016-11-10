// ES5的声明方式
var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');
var Video = require('react-native-video').default;

var request = require('../common/request');
var config = require('../common/config');

var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var Dimensions = React.Dimensions;
var ActivityIndicatorIOS = React.ActivityIndicatorIOS;
var TouchableOpacity = React.TouchableOpacity;
var Image = React.Image;
var ListView = React.ListView;
var TextInput = React.TextInput;
var Modal = React.Modal;

var cachedResults = {
  nextPage: 1,
  items: [],
  total: 0
};

var width = Dimensions.get('window').width;

// 列表页面组件
var Detail = React.createClass({
  getInitialState() {
    var data = this.props.data;
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    return {
      data: data,

      // comments
      dataSource: ds.cloneWithRows([]),
      // video loads
      videoLoaded: false,
      playing: false,

      videoOk: true,
      paused: false,
      videoProgress: 0.01,
      videoTotal: 0,
      currentTime: 0,
      // video player
      rate: 1,
      muted: false,
      resizeMode: 'contain',
      repeat:false
    }
  },

  _pop() {
    this.props.navigator.pop();
  },

  _onLoadStart() {
    console.log('load start');
  },

  _onLoad() {
    console.log('on load');
  },

  _onProgress(data) {
    if (!this.state.videoLoaded) {
      this.setState({
        videoLoaded: true
      })
    }

    var duration = data.playableDuration;
    var currentTime = data.currentTime;
    var percent = Number((currentTime / duration).toFixed(2));
    var newState = {
      videoTotal: duration,
      currentTime: Number(data.currentTime.toFixed(2)),
      videoProgress: percent
    };
    if (!this.state.videoLoaded) {
      newState.videoLoaded = true;
    }
    if (!this.state.playing) {
      newState.playing = true;
    }
    this.setState(newState);
  },

  _onEnd() {
    this.setState({
      playing: false,
      videoProgress: 1
    })
  },

  _onError(e) {
    this.setState({
      videoOk: false
    })
  },

  _rePlay() {
    this.refs.videoPlayer.seek(0);
  },

  _pause() {
    if (this.state.paused) {
      this.setState({
        paused: true
      })
    }
  },

  _resume() {
    if (!this.state.paused) {
      this.setState({
        paused: false
      })
    }
  },

  componentDidMount() {
    this._fetchData();
  },

  _fetchData(page) {
    var that = this;
    var url = config.api.base + config.api.comment;
    this.setState({
      isLoadingTail: true
    });

    request.get(url, {
      accessToken: 'abcdef',
      creation: 124,
      page: page
    })
      .then((data) => {
        if (data.success) {
          var items = cachedResults.items.slice();

          items = items.concat(data.data);
          cachedResults.nextPage += 1;
          cachedResults.items = items;
          cachedResults.total = data.total;
 
          that.setState({
            items: items,
            dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)          });  
        }
      })
      .catch((error) => {
        this.setState({
          isLoadingTail: false
        });
      });
  },

  _hasMore() {
    return cachedResults.items.length !== cachedResults.total;
  },

  _fetchMoreData() {
    if (!this._hasMore() || this.state.isLoadingTail) {
      return;
    }

    var page = cachedResults.nextPage;
    this._fetchData(page)
  },

  _focus() {
    //
  },

  _renderHeader() {
    var data = this.state.data;
    return(
      <View style={styles.listHeader}>
        <View style={styles.infoBox}>
          <Image style={styles.avatar} source={{uri: data.author.avatar}} />
          <View style={styles.descBox}>
            <Text style={styles.nickname}>{data.author.nickname}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        </View>
        <View style={styles.commentBox}>
          <View style={styles.commetn}>
            <TextInput
              placeholder='敢不敢评论一个...'
              style={styles.content}
              multiline={true}
              onFocus={this._onfocus}
            />
          </View>
        </View>

        <View style={styles.commentArea}></View>
      </View>
    )
  },

  
  _renderRow() {
    return (
      <View style={styles.replyBox} key={row._id}> 
        <Image style={styles.replyAvatar} source={{uri: row.replyBy.avatar}} />
        <View style={styles.reply}>
          <Text style={styles.replyNickName}>
            {row.replyBy.nickname}
          </Text>
          <Text style={styles.replyContent}>{row.content}</Text>
        </View>
      </View>
    )
  },

  _renderFooter() {
    if (!this._hasMore || cachedResults.total !== 0) {
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>没有更多了！</Text>
        </View>
      )
    }

    if (!this.state.isLoadingTail) {
      return <View style={styles.loadingMore} />
    }

    return <ActivityIndicatorIOS style={styles.loadingMore} />
  },
  
  render: function() {
    var data = this.state.data;
    console.log(data);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBox} onPress={this._pop} > 
            <Icon name='ios-arrow-back' style={styles.backIcon} />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOflines={1}>视频详情页</Text>
        </View>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri:data.video}}
            style={styles.video}
            volume={5}
            paused={this.state.paused}
            rate={this.state.rate}
            muted={this.state.muted}
            resizeMode={this.state.resizeMode}
            repeat={this.state.repeat}

            onLoadStart={this._onLoadStart}
            onLoad={this._onLoad}
            onProgress={this._onProgress}
            onEnd={this._onEnd}
            onError={this._onError}
          />
          {
            !this.state.videoOk && <Text style={styles.failText}>视频出错了！很抱歉</Text>
          }
          {
            !this.state.videoLoaded && <ActivityIndicatorIOS color='#ee735c' style={styles.loading} />
          }
          {
            this.state.videoLoaded && !this.state.playing 
            ? <Icon
                onPress={this._rePlay}
                name='ios-play'
                size={48}
                style={styles.playIcon}
              />
            : null
          }

          {
            this.state.videoLoaded && this.state.playing
            ? <TouchableOpacity onPress={this._pause} style={styles.pauseBtn}>
                {
                  this.state.paused
                  ? <Icon onPress={this._resume} name='ios-play' style={styles.resumeIcon} size={48}/>
                  : <Text></Text>
                }
              </TouchableOpacity>
            : null
          }

          <View style={styles.progressBox}>
            <View style={styles.progressBar, {width: width * this.state.videoProgress}}>
            </View>
          </View>

        
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderRow} 
            renderHeader={this._renderHeader}
            renderFooter={this._renderFooter}
            onEndReached={this._fetchMoreData}
            onEndReachedThreshold={20}
            enableEmptySections={true} 
            showsVerticalScrollIndicator={false}
            automaticallyAdjustContentInsets={false}
          />
          
        </View>
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: 64,
    paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff'
  },

  backBox: {
    position: 'absolute',
    left: 12,
    top: 32,
    width: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    width: width -120,
    textAlign: 'center'
  },

  backIcon: {
    color: '#999',
    fontSize: 20,
    marginRight: 5
  }, 

  backText: {
    color: '#999'
  },

  videoBox: {
    width: width,
    height: width * 0.56 + 2,
    backgroundColor: '#000'
  },

  video: {
    width: width,
    height: width * 0.56 + 2,
    backgroundColor: '#000'
  },

  loading: {
    position: 'absolute',
    left: 0,
    top: 140,
    width: width,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },

  progressBox: {
    width: width,
    height: 4,
    backgroundColor: '#ccc'
  },

  progressBar: {
    width: 1,
    height: 4,
    backgroundColor: '#ff6600'
  },

  playIcon: {
    position: 'absolute',
    top: 140,
    left: width/2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 20,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },

  pauseBtn: {
    position: 'absolute',
    width: width,
    height: 360
  },

  resumeIcon: {
    position: 'absolute',
    top: 140,
    left: width/2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 20,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },

  failText: {
    position: 'absolute',
    left: 0,
    top: 180,
    width: width,
    textAlign: 'center',
    backgroundColor: 'transparent',
    color: '#fff'
  },

  infoBox: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },

  avatar: {
    width: 60,
    height: 60,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 30
  },

  descBox: {
    flex: 1
  },

  nickname: {
    fontSize: 18
  },

  title: {
    fontSize: 16,
    marginTop: 8,
    color: '#666'
  },

  loadingMore: {
    marginVertical: 20
  },

  loadingText: {
    color: '#777',
    textAlign: 'center'
  },

  listHeader: {
    marginTop: 10,
    width: width
  }

  commentBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    width: width
  },

  content: {
    paddingLeft: 2,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 14,
    height: 80
  },

  commentArea: {
    width: width,
    marginTop: 10,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
});

module.exports = Detail;