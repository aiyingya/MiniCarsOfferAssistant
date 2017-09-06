// @flow

const COMPONENT_KEYS = [
  'name',
  'data',
  'props',
  'onLoad',
  'onUnload',
  'methods'
]

export default class Component {

  name

  data

  config

  methods

  constructor(config) {

    for (let name in config) {
      if (!~COMPONENT_KEYS.join("|").indexOf(name)) this[name] = config[name]
    }

    config.onLoad = config.onLoad || noop
    config.onUnload = config.onUnload || noop

    this.data = config.data || {}
    this.config = config
    this.methods = config.methods || {}

    this.setMethods(config.methods)
  }

  setData(data) {
    let name = this.name
    let parent = this.parent
    let _data = parent.data[name]
    let mergeData = extend(true, _data, data)
    let newData = {}

    newData[name] = mergeData
    this.data = mergeData
    parent.setData(newData)
  }

  setProps(props) {
    this.props = extend(this.props, props)
  }

  setName(name) {
    this.name = name
  }

  setParent(parent) {
    this.parent = parent
  }

  setMethods(methods) {
    for (let name in methods) {
      this[name] = methods[name]
    }
  }
}
