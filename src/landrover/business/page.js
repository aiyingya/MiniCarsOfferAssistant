// @flow
import Component from './component'

const originalPage = Page

const EVENT_LIST = [
  'onLoad',
  'onUnload'
]

class WPage {

  origin

  config

  children

  childrenEvents

  needs

  constructor(origin) {

    this.origin = origin
    this.config = {
      data: {}
    }
    this.children = {}
    this.childrenEvents = {}

    let needs = this.needs = origin.components

    if (!needs) {
      return originalPage(origin)
    }

    // 自动导入所有的组件 js 文件
    for (let item in needs) {
      let props = needs[item] || {}
      let component = new Component(require(`../components/${item}/${item}`))

      component.name || component.setName(item)

      this.setChildProps(component, props)
      this.pushChild(item, component)

      this.mergeData(item, component)
      this.mergeMethods(item, component)
      this.mergeChildEvents(item, component)
    }

    this.setChildren()
    this.mergePageEvent()

    return originalPage(this.config)
  }

  pushChild(name, component) {
    this.childrens[name] = component
  }

  setChildProps(component, props) {
    for (let key in props) {
      let val = props[key]
      if (is.fn(val)) {
        props[key] = val.bind(component)
      }
    }
    component.setProps(props)
  }

  mergeMethods(item, component) {
    for (let fnName in component.methods) {
      this.config[fnName] = component.methods[fnName].bind(component)
    }
  }

  mergeData(item, component) {
    let config = this.config
    let origin = this.origin

    // 传递组件的方法等自定义字段
    extend(true, config, origin, component.config)

    // 把props传给data
    extend(component.data, component.props)

    // 传递组件的data
    // 如果data中有组件名属性，报个错
    if (item in config.data || item in origin.data) {
      throw Error(`You need rename "${item}" in data, because it is the name of Component`);
    }
    extend(true, config.data, origin.data)

    // 生成组件特有的data
    config.data[item] = {}
    extend(true, config.data[item], component.data)
  }

  // 合并组件的事件
  mergeChildEvents(item, component) {
    let childrensEvents = this.childrensEvents
    childrensEvents[item] = {}
    EVNET_LIST.forEach((prop) => {
      childrensEvents[item][prop] = component.config[prop]
    })
  }

  // 把组件的事件合并到page里
  mergePageEvent() {
    let that = this
    EVNET_LIST.forEach((prop) => {
      that.config[prop] = function () {
        for (let item in that.needs) {
          let component = that.childrens[item]
          // 给组件注册parent
          if ("onLoad" == prop) {
            component.setParent(this)
          }
          that.childrensEvents[item][prop].apply(component, arguments)
        }
        that.origin[prop] && that.origin[prop].apply(this, arguments)
      }
    })
  }

  // 把组件方法传给`childrens`
  setChildrens() {
    this.config.childrens = this.childrens
  }
}

export default class Page {
  constructor(options) {
    return new WPage(options)
  }
}
