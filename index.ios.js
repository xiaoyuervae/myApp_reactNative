/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

// ES5的声明方式
var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');


// 列表页面组件
var List = require('./app/creation/index');
// 编辑页面组件
var Edit = require('./app/edit/index');
// 账户页面组件
var Account = require('./app/account/index');


var Component = React.component;
var AppRegistry = React.AppRegistry;
var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var TabBarIOS = React.TabBarIOS;

// ES6 的声明方式
// import React, {Component} from 'react-native';
// import {
//   AppRegistry,
//   StyleSheet,
//   Text,
//   View
// } from 'react-native';


var xyeApp = React.createClass({

  getInitialState: function() {
    console.log('child','getInitialState');
    // 得到父组件的值。
    return {
      selectedTab: 'list'
    }
  },
  render: function() {
    return (
      <TabBarIOS
        tintColor="#ee735c">
        <Icon.TabBarItem
          iconName='ios-videocam-outline'
          selectedIconName='ios-videocam'
          selected={this.state.selectedTab === 'list'}
          onPress={() => {
            this.setState({
              selectedTab: 'list',
            });
          }}>
          <List />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-recording-outline'
          selectedIconName='ios-recording'
          selected={this.state.selectedTab === 'edit'}
          onPress={() => {
            this.setState({
              selectedTab: 'edit'
            });

          }}>
          <Edit />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-more-outline'
          selectedIconName='ios-more'
          selected={this.state.selectedTab === 'account'}
          onPress={() => {
            this.setState({
              selectedTab: 'account'
            });
          }}>
          <Account />
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
})


var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});


AppRegistry.registerComponent('myApp', () => xyeApp);
