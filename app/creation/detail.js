'use strict'
// ES5的声明方式
var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');
var Video = require('react-native-video').default;
var Button = require('react-native-button');

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
var AlertIOS = React.AlertIOS;

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
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      data: data,

      // comments
      dataSource: ds.cloneWithRows([]),
      isLoadingTail: false,
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
      repeat:false,

      // modal
      content: '',
      animationType: 'none',
      modalVisible: false,
      isSending: false
    }
  },

  _renderRow(row) {
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

  _pop() {
    this.props.navigator.pop();
  },

  _onLoadStart() {
    console.log('load start');
  },

  _onLoad() {
    console.log('on load');
  },

  //第一次开始播放视频时触发，每隔250毫秒触发一次
  _onProgress(data){
    if(!this.state.videoLoaded){
      this.setState({
        videoLoaded: true
      })
    }
    //视频播放的进度条值
    var duration = data.playableDuration;  //视频总共播放的时间
    var currentTime = data.currentTime;   //视频已经播放的时间
    var percent = Number((currentTime / duration).toFixed(2)); //保留小数后2位
    var newState= {
      videoTotal: duration,
      currentTime: Number(data.currentTime.toFixed(2)),
      videoProgress: percent  //视频播放的目前时间
    };
    if(!this.state.videoLoaded){
      newState.videoLoaded = true;
    }
    if(!this.state.playing){
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
    if (!this.state.paused) {
      this.setState({
        paused: true
      })
    }
  },

  _resume() {
    if (this.state.paused) {
      this.setState({
        paused: false
      })
    }
  },

  componentDidMount() {
    this._fetchData(1);
  },

  _fetchData(page) {
    var that = this;
    this.setState({
      isLoadingTail: true  //显示上拉加载菊花
    });

    request.get(config.api.base + config.api.comment, {
      accessToken: 'abcdef',
      creation: 124,
      page: page
    })
      .then((data) => {
        if(data.success){
          var items = cachedResults.items.slice();  //拿到新列表数据
          items = items.concat(data.data); //将旧数据和新数据连接起来
          cachedResults.nextPage += 1;  //每次请求页数加1
          cachedResults.items = items;  //将新数据存储到cachedResults去
          cachedResults.total = data.total;
          that.setState({
            isLoadingTail: false,
            dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)
          });
        }
      })
      .catch((error) => {
        this.setState({
          isLoadingTail: false
        });
        console.warn(error)
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
    this._setModalVisible(true);
  },

  //显示弹出浮层
  _setModalVisible(isVisible){
    this.setState({
      modalVisible: isVisible
    });
  },

  //失去焦点时触发
  _blur(){
    this._setModalVisible(false);
  },

  _closeModal() {
    this._setModalVisible(false);
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
          <View style={styles.comment}>
            <TextInput
              placeholder='敢不敢评论一个...'
              style={styles.content}
              multiline={true}
              onFocus={this._focus}
            />
          </View>
        </View>

        <View style={styles.commentArea}>
          <Text style={styles.commentTitle}>精彩评论</Text>
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

    //处理评论内容提交
  _submit(){
    var that = this;
    if(!this.state.content){
      return AlertIOS.alert('留言不能为空！');
    }
    if(this.state.isSending){
      return AlertIOS.alert('正在评论中！');
    }
    this.setState({
      isSending: true
    }, function(){
      var body = {
        accessToken: 'abc',
        creation: '1323',
        content: this.state.content
      }
      var url = config.api.base + config.api.comment;

      request.post(url, body)
        .then(function(data){
          if(data && data.success){
            var items = cachedResults.items.slice();
            var content = that.state.content;
            items = [{
              content: that.state.content,
              replyBy: {
                avatar: 'http://dummyimage.com/640x640/8ac0c8)',
                nickname: '狗狗狗说'
              }
            }].concat(items);
            cachedResults.items = items;
            cachedResults.total = cachedResults.total + 1;
            
            that.setState({
              content: '',
              isSending: false,
              dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)
            });
            that._setModalVisible(false);
          }
        })
        .catch((err) => {
          console.log(err)
          that.setState({
            isSending: false
          })
          that._setModalVisible(false);
          AlertIOS.alert('留言失败，稍后重试！');
        })
    })
    
  },
  
  render() {
    var data = this.state.data;
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
          { //视频出错了，文字提示
            !this.state.videoOk && <Text style={styles.failText}>视频出错了！很抱歉</Text>
          }  

          { //加载视频时的转动的提示进度条
            !this.state.videoLoaded && <ActivityIndicatorIOS color='#ee735c' style={styles.loading}/>
          }  

          { //重新播放视频按钮
            this.state.videoLoaded && !this.state.playing
            ? <Icon
                onPress={this._rePlay} 
                name='ios-play'
                size={48}
                style={styles.playIcon} />
             : null  
          }  

          { //在视频加载完和播放中，2个条件同时成立才能点击视频任意地方可以暂定视频
            this.state.videoLoaded && this.state.playing
            ? <TouchableOpacity onPress={this._pause} style={styles.pauseBtn}>
              
              { //如果点击了视频才会出现这个暂停按钮
                this.state.paused
                ? <Icon 
                    onPress={this._resume}
                    name='ios-play'
                    size={48}
                    style={styles.resumeIcon}/>
                : <Text></Text>    
              }
            </TouchableOpacity>
            : null
          }

          <View style={styles.progressBox}>
            <View style={[styles.progressBar, {width: width * this.state.videoProgress}]}></View>
          </View> 
        </View>

        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          enableEmptySections={true}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          renderHeader={this._renderHeader}
          renderFooter={this._renderFooter}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={64}
        />
        { 
          // 评论浮层
          // 弹出浮层，animationType呼出动画形式，visible是否可见
          // onRequestClose 当关闭弹出浮层时触发回调函数
        }
        <Modal
          animationType={'fade'}
          visible={this.state.modalVisible}
          onRequestClose={() => {this._setModalVisible(false)}} >
          <View style={styles.modalContainer}>
            <Icon
              onPress={this._closeModal}
              name='ios-close-outline'
              style={styles.closeIcon} />
            <View style={styles.commentBox}>
              <View style={styles.comment}>
                <TextInput
                  placeholder='敢不敢评论一个'
                  style={styles.content}
                  multiline={true}
                  onFocus={this._onfocus}

                  defaultValue={this.state.content}
                  onChangeText={(text) => {
                    this.setState({
                      content: text
                    })
                  }}
                />
              </View>
            </View>  
            <Button style={styles.submitBtn} onPress={this._submit}>评论
            </Button>
          </View>
        </Modal>
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },

  modalContainer: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: '#fff'
  },

  closeIcon: {
    alignSelf: 'center',
    fontSize: 30,
    color: '#ee753c'
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
    top: 80,
    width: width,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },

  progressBox: {
    width: width,
    height: 2,
    backgroundColor: '#ccc'
  },

  progressBar: {
    width: 1,
    height: 2,
    backgroundColor: '#ff6600'
  },

  //重新播放按钮
  playIcon: {
    position: 'absolute',
    top: 90,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },

  //暂停视频按钮
  pauseBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width,
    height: 360
  },

  resumeIcon: {
    position: 'absolute',
    top: 80,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
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
  // 评论
  listHeader: {
    marginTop: 10,
    width: width
  },

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
  },

  commentTitle: {

  },

  //评论用户列表
  replyBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10
  },

  replyAvatar: {
    width: 40,
    height: 40,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 20
  },

  replyNickname: {
    color: '#666'
  },

  replyContent: {
    marginTop: 4,
    color: '#666'
  },

  //弹出浮层评论
  modalContainer: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: '#fff'
  },

  closeIcon: {
    alignSelf: 'center',
    fontSize: 30,
    color: '#ee753c'
  },

  //提交评论内容按钮
  submitBtn: {
    width: width - 20,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ee753c',
    borderRadius: 4,
    fontSize: 18,
    color: '#ee753c'
  }


});

module.exports = Detail;