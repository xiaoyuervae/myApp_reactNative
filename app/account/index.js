// ES5的声明方式
var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');
var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;

// 列表页面组件
var Account = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={[styles.item,styles.item1]}>
          老大，你😊吗？
        </Text>
        <View style={[styles.item,styles.item2]}>
          <Text>老二，你不爽么？</Text>
        </View>
        <View style={[styles.item,styles.item3]}>
          <Text>老三，老大老二欺负你吗？</Text>
        </View>
      </View>
    )
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    flexDirection: 'row',
    backgroundColor: '#ff6600',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 70
  },
  item1: {
    flex: 1,
    backgroundColor: '#ccc',
  },
  item2: {
    flex: 2,
    backgroundColor: '#999',
  },
  item3: {
    flex: 1,
    backgroundColor: '#666',
  },
});

module.exports = Account;