// ES5的声明方式
var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');

var request = require('../common/request');
var config = require('../common/config');
var Detail = require('./detail');

var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var ListView = React.ListView;
var TouchableHighlight = React.TouchableHighlight;
var Image = React.Image;
var Dimensions = React.Dimensions;
var ActivityIndicatorIOS = React.ActivityIndicatorIOS;
var RefreshControl = React.RefreshControl;
var AlertIOS = React.AlertIOS;

var width = Dimensions.get('window').width;

var cachedResults = {
  nextPage: 1,
  items: [],
  total: 0
};

// 列表页面组件
var Item = React.createClass({
  getInitialState() {
    var row = this.props.row;

    return {
      up: row.voted,
      row: row
    }
  },

  _up() {
    var that = this;
    var up = !this.state.up;
    var row = this.state.row;
    var url = config.api.base + config.api.up;

    var body = {
      id: row._id,
      up: up ? 'yes' : 'no',
      accessToken: 'abcdef'
    };

    request.post(url, body) 
      .then((data) => {
        if (data && data.success) {
          that.setState({
            up: up
          })
        }
        else {
          AlertIOS.alert('点赞失败，稍后重试');
        }
      })
      .catch((err) => {
        console.log(err);
        AlertIOS.alert('点赞失败，稍后重试');
      })
  },

  render() {
    var row = this.state.row;
    return (
      <TouchableHighlight onPress={this.props.onSelect}>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <Image 
            source={{uri: row.thumb}}
            style={styles.thumb} >
            <Icon
              name='ios-play'
              size={28}
              style={styles.play} />
          </Image>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon
                onPress={this._up}
                name={this.state.up ? 'ios-heart' : 'ios-heart-outline'}
                size={28}
                style={this.state.up ? styles.up : styles.down} />
              <Text style={styles.handleText} onPress={this._up}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon
                name='ios-chatboxes-outline'
                size={28}
                style={styles.commentIcon} />
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
});


// 列表页面组件
var List = React.createClass({

  getInitialState() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      isRefreshing: false,
      isLoadingTail: false,
      dataSource: ds.cloneWithRows([]),
    };
  },

  _renderRow(row) {
    return <Item 
      row={row} 
      onSelect={() => this._loadPage(row)}
      key={row._id}
    />
  },
  
  componentDidMount() {
    this._fetchData(1);
  },

  _fetchData(page) {
    var that = this;
    var url = config.api.base + config.api.creation;
    if (page !== 0) {
      this.setState({
        isLoadingTail: true
      })
    }
    else {
      this.setState({
        isRefreshing: true
      })
    }

    request.get(url, {
      accessToken: 'abcdef',
      page: page
    })
      .then((data) => {
        if (data.success) {
          var items = cachedResults.items.slice();
          items = items.concat(data.data);
          cachedResults.items = items;
          cachedResults.total = data.total;

          setTimeout(function() {
            if (page !== 0) {
              that.setState({
                isLoadingTail: false,
                isRefreshing: false,
                dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)
              })
            }
            else {
              that.setState({
                isRefreshing: false,
                dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)
              });
            }
          },20);
        }
      })
      .catch((error) => {
        if (page !== 0) {
          this.setState({
              isLoadingTail: false
          })
        }
        else {
          this.setState({
            isRefreshing: true
          })
        }
        console.warn(error);
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

  _onRefresh() {

    if (!this._hasMore() || this.state.isRefreshing) {
      return;
    }

    this._fetchData(0);
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
  // 点击打开详情页
  _loadPage(row) {
    this.props.navigator.push({
      name: 'detail',
      component: Detail,
      params: {
        data: row
      }
    })
  },

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow} 
          renderFooter={this._renderFooter}
          onEndReached={this._fetchMoreData}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
              tintColor='#ff6600'
              title='拼命加载中'
            />
          }
          onEndReachedThreshold={20}
          enableEmptySections={true} 
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
        />
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
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600'
  },

  item: {
    width: width,
    marginBottom: 10,
    backgroundColor: '#fff'
  },

  thumb: {
    width: width,
    height: width*0.5625,
    resizeMode: 'cover'
  },

  title: {
    padding: 10,
    fontSize: 18,
    color: '#333'
  },

  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee'
  },

  handleBox: {
    padding: 10,
    flexDirection: 'row',
    width: width / 2 - 0.5,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },

  play: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 46,
    height: 46,
    paddingTop: 9,
    paddingLeft: 18,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 23,
    color: '#ed7b66'
  },

  handleText: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#333'
  },

  up: {
    fontSize: 22,
    color: '#ed7b66'
  },

  down: {
    fontSize: 22,
    color: '#333'
  },

  commentIcon: {
    fontSize: 22,
    color: '#333'
  },

  loadingMore: {
    marginVertical: 20
  },

  loadingText: {
    color: '#777',
    textAlign: 'center'
  }

});

module.exports = List;