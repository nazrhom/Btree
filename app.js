var _ = require('lodash')

function BTree(leafMaxKeys, innerMaxKeys) {
  this.leafMaxKeys = leafMaxKeys
  this.innerMaxKeys = innerMaxKeys
  var root = new LNode(leafMaxKeys)
}

BTree.prototype.insert = function(key, value) {
  var result = this.root.insert(key, value)
  if (result !== null) {
    _root = new INode()
    _root.num = 1
    _root.keys[0] = result.key
    _root.childeren[0] = result.left
    _root.childeren[1] = result.right
    this.root = _root
  }
}

BTree.prototype.find = function(key) {
  var node = this.root
  while (node instanceof 'INode') {
    var inner = node
    var idx = inner.getLoc(key)
    node = inner.children[idx]
  }

  // node is a leaf
  var leaf = node
  var idx = leaf.getLoc(key)
  if (idx < leaf.num && leaf.keys[idx] === key) {
    return leaf.values[idx];
  } else {
    return null;
  }
}

BTree.prototype.dump = function() {
  return root.dump()
}

function LNode(maxKeys) {
  this.keys = []
  this.values = []
  this.num = 0
  this.maxKeys = maxKeys
}

LNode.prototype.getLoc(key) {
  return _.findIndex(this.keys, key)
}

LNode.prototype.insert(key, value) {
  var i = this.getLoc(key)
  if (this.num === this.maxKeys) {
    var mid = (this.maxKets + 1) / 2
    var sNum = this.num - mid
    var sibiling = new LNode(this.maxKeys)
    sibiling.num = sNum
    sibiling.keys = this.keys.slice(mid, sNum)
    sibiling.values = this.values.slice(mid, sNum)
    this.num = mid
    if (i < mid)
      this.insertNonFull(key, value, i)
    else
      this.insertNonFull(key, value, i - mid)

    var result = new Split(sibiling.keys[0], this, sibiling)
    return result
  } else {
    this.insertNonFull(key, value)
    return null
  }
}

LNode.prototype.insertNonFull = function (key, value, idx) {
  if (idx < this.num && this.keys[idx] === key) {
    this.values[idx] = value
  } else {
    this.keys = this.keys.slice(0, idx).concat(this.keys.slice(idx, num))
    this.values = this.values.slice(0, idx).concat(this.values.slice(idx, num))

    this.keys[idx] = key
    this.values[idx] = value
    this.num = this.num + 1
  }
};

LNode.prototype.dump = function() {
  console.log('lNode h === 0')
  _.forEach(this.keys, console.log.bind(console))
}
