// ES5的声明方式
var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');
var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var ListView = React.ListView;
var TouchableHighlight = React.TouchableHighlight;
var Image = React.Image;
var Dimensions = React.Dimensions;

var width = Dimensions.get('window').width;

// 列表页面组件
var List = React.createClass({

  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      dataSource: ds.cloneWithRows([ {
        "_id":"440000200910255028","thumb":"http://dummyimage.com/1280*720/7d8010)","title":"测试内容7k9n","video":"http://v2.mukewang.com/c616096d-7dde-4ef1-8601-344f7024946a/L.mp4?auth_key=1478428143-0-0-0f2aac8f5020be9a30fb32b02a29630d"
    }
    ,
    {
        "_id":"110000197512127193","thumb":"http://dummyimage.com/1280*720/2cbe8b)","title":"测试内容7k9n","video":"http://v2.mukewang.com/c616096d-7dde-4ef1-8601-344f7024946a/L.mp4?auth_key=1478428143-0-0-0f2aac8f5020be9a30fb32b02a29630d"
    }
    ,
    {
        "_id":"140000201003042743","thumb":"http://dummyimage.com/1280*720/0efd0d)","title":"测试内容7k9n","video":"http://v2.mukewang.com/c616096d-7dde-4ef1-8601-344f7024946a/L.mp4?auth_key=1478428143-0-0-0f2aac8f5020be9a30fb32b02a29630d"
    }
    ,
    {
        "_id":"640000201304055626","thumb":"http://dummyimage.com/1280*720/686467)","title":"测试内容7k9n","video":"http://v2.mukewang.com/c616096d-7dde-4ef1-8601-344f7024946a/L.mp4?auth_key=1478428143-0-0-0f2aac8f5020be9a30fb32b02a29630d"
    }
    ,
    {
        "_id":"710000200705014474","thumb":"http://dummyimage.com/1280*720/fbb84a)","title":"测试内容7k9n","video":"http://v2.mukewang.com/c616096d-7dde-4ef1-8601-344f7024946a/L.mp4?auth_key=1478428143-0-0-0f2aac8f5020be9a30fb32b02a29630d"
    }
    ,
    {
        "_id":"120000199206258241","thumb":"http://dummyimage.com/1280*720/62b9f2)","title":"测试内容7k9n","video":"http://v2.mukewang.com/c616096d-7dde-4ef1-8601-344f7024946a/L.mp4?auth_key=1478428143-0-0-0f2aac8f5020be9a30fb32b02a29630d"
    }
    ,
    {
        "_id":"540000200308232054","thumb":"http://dummyimage.com/1280*720/9a40c3)","title":"测试内容7k9n","video":"http://v2.mukewang.com/c616096d-7dde-4ef1-8601-344f7024946a/L.mp4?auth_key=1478428143-0-0-0f2aac8f5020be9a30fb32b02a29630d"
    }
    ,
    {
        "_id":"210000198506242855","thumb":"http://dummyimage.com/1280*720/53df14)","title":"测试内容7k9n","video":"http://v2.mukewang.com/c616096d-7dde-4ef1-8601-344f7024946a/L.mp4?auth_key=1478428143-0-0-0f2aac8f5020be9a30fb32b02a29630d"
    }
    ,
    {
        "_id":"500000197203181914","thumb":"http://dummyimage.com/1280*720/19b1ba)","title":"测试内容7k9n","video":"http://v2.mukewang.com/c616096d-7dde-4ef1-8601-344f7024946a/L.mp4?auth_key=1478428143-0-0-0f2aac8f5020be9a30fb32b02a29630d"
    }]),
    };
  },

  renderRow: function(row) {
    return (
      <TouchableHighlight>
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
                name='ios-heart-outline'
                size={28}
                style={styles.up} />
              <Text style={styles.handleText}>喜欢</Text>
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
  },
  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow} 
          enableEmptySections={true} 
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
    color: '#333'
  },

  commentIcon: {
    fontSize: 22,
    color: '#333'
  }

});

module.exports = List;