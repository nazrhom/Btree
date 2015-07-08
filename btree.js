'use strict'

var _ = require('lodash')
var util = require('util')
var rand = require('random-seed').create('0')

var IntBalancedSet = function(depth) {
  this.MINIMUM = 1
  this.MAXIMUM = 2 * this.MINIMUM
  this.children = []
  this.data = []
  this.depth = depth

  return this
}

IntBalancedSet.prototype.add = function (el) {
  this.looseAdd(el)

  if (this.data.length > this.MAXIMUM) {
    var oldroot = this.clone()

    // inspect(oldroot, 'oldroot')
    this.data = []
    this.children = []
    this.depth = 0
    this.children.push(oldroot)
    // inspect(this, 'before fixExcess')
    this.fixExcess(0)
    // inspect(this, 'after fixExcess')

  }
  // console.log('integrity check')
  // this.checkIntegrity()
  // inspect(this, 'after adding el ' + el)
}

IntBalancedSet.prototype.looseAdd = function (el) {
  // inspect(this, 'before looseAdd')
  var i = this.firstGE(el)
  // dont allow multiple copies
  if (this.data[i] === el) return
  else if (_.isUndefined(this.children[i])) {
    this.data.splice(i, 0, el)
  } else {
    if (_.isUndefined(this.children[i])) inspect(this, 'no child')
    this.children[i].looseAdd(el)
    this.fixExcess(i)
  }
  // inspect(this, 'after looseAdd')
  return this
}

IntBalancedSet.prototype.fixExcess = function(i) {
  // if there is nothing to fix just return
  if (this.children[i].data.length <= this.MAXIMUM) {
    return
  } else {
    var leftData = this.children[i].data.slice(0, this.MINIMUM)
    var rightData = this.children[i].data.slice(this.MINIMUM + 1, this.MAXIMUM + 1)

    var leftChildren = this.children[i].children.slice(0, this.MINIMUM + 1)
    var rightChildren = this.children[i].children.slice(this.MINIMUM + 1, this.MAXIMUM + 2)

    var middle = this.children[i].data[this.MINIMUM]
    // inspect(this, 'this before fixExcess on children ' + i)
    this.children[i] = new IntBalancedSet(this.depth + 1)
    this.children[i].data = leftData
    this.children[i].children = leftChildren

    this.children[i + 1] = new IntBalancedSet(this.depth + 1)
    this.children[i + 1].data = rightData
    this.children[i + 1].children = rightChildren

    this.data[i] = middle
    // inspect(this, 'this after fixExcesson children ' + i)
  }
}

IntBalancedSet.prototype.remove = function (target) {
  // console.log('wanna remove', target)
  var answer = this.looseRemove(target)
  if (this.data.length === 0 && this.children.length === 1) {
    this.data = this.children[0].data
    this.children = this.children[0].children
  }
  // this.checkIntegrity()
  // inspect(this, 'after removing el ' + target)

  return answer
}

IntBalancedSet.prototype.looseRemove = function (target) {
  var i = this.firstGE(target)
  // inspect(this, 'looseRemove with i' + i)
  if (_.isEmpty(this.children)) {
    if (this.data[i] === target) {
      this.data.splice(i, 1)
      return true
    } else {
      return false
    }
  } else {
    if (this.data[i] === target) {
      this.data[i] = this.children[i].removeBiggest()
    } else {
      // console.log('i: ',i)
      // inspect(this.children, 'children')
      // inspect(this.children[i], 'i child')
      this.children[i].looseRemove(target)
      // inspect(this, 'after looserem')
    }
    if (this.children[i].data.length < this.MINIMUM) {
      // inspect(this, 'calling fixShortage with index ' + i)
      this.fixShortage(i)
    }
    return true
  }
}

IntBalancedSet.prototype.checkCase = function (i) {
  if (i - 1 >= 0 && this.children[i - 1].data.length > this.MINIMUM) {
    return '1a'
  }
  if (i + 1 < this.children.length && this.children[i + 1].data.length > this.MINIMUM) {
    return '1b'
  }
  if (i - 1 >= 0 && this.children[i - 1].data.length === this.MINIMUM) {
    return '2a'
  }
  if (i + 1 < this.children.length && this.children[i + 1].data.length === this.MINIMUM) {
    return '2b'
  }
  else return null
}

IntBalancedSet.prototype.fixShortage = function (i) {
  if (i < 0) return

  var _case = this.checkCase(i)

  if (_case === null) {
    throw new Error('case is null')
    return
  }

  if (_case[0] === '1' && _case[1] === 'a') {
    // inspect(this, 'before 1a')

    this.children[i].data.unshift(this.data[i - 1])
    // inspect(this, 'after stealing from father')

    this.data[i - 1] = this.children[i - 1].data.pop()
    // inspect(this, 'after stealing from sibiling')

    if (!_.isEmpty(this.children[i - 1].children)) {
      this.children[i].children.unshift(this.children[i - 1].children.pop())
    }
    // inspect(this, 'after 1a')

    return
  }
  if (_case[0] === '1' && _case[1] === 'b') {
    this.children[i].data.unshift(this.data[i])
    this.data[i] = this.children[i + 1].data.shift()
    if (!_.isEmpty(this.children[i + 1].children)) {
      this.children[i].children.push(this.children[i + 1].children.shift())
    }

    return
  }
  if (_case[0] === '2' && _case[1] === 'a') {
    // inspect(this, 'before 2a')
    this.children[i].data.push(this.data.splice(i - 1, 1).pop())
    // inspect(this, 'after stealing from parent')

    this.children[i - 1].data.push.apply(this.children[i - 1].data, this.children[i].data)
    // inspect(this, 'after merging sibiling children')

    this.children[i - 1].children.push.apply(this.children[i - 1].children, this.children[i].children)
    // inspect(this, 'after merging sibiling data')

    this.children.splice(i, 1)
    // inspect(this, 'after removal of child')

    return
  }
  if (_case[0] === '2' && _case[1] === 'b') {
    // inspect(this, 'before 2b')
    this.children[i].data.unshift(this.data.splice(i, 1).pop())
    // inspect(this, 'after stealing from parent')

    this.children[i + 1].data.unshift.apply(this.children[i + 1].data, this.children[i].data)
    // inspect(this, 'after merging sibiling children')

    this.children[i + 1].children.unshift.apply(this.children[i + 1].children, this.children[i].children)
    // inspect(this, 'after merging sibiling data')

    this.children.splice(i, 1)
    // inspect(this, 'after removal of child')

    return
  }
}

IntBalancedSet.prototype.checkIntegrity = function() {
  var self = this
  _.each(self.data, function(data) {
    if(!_.isNumber(data)) {
      inspect(self, 'corrupted data')
      throw new Error('data corrupt')
    }
  })

  if (self.data.length + 1 < self.children.length) {
    inspect(self, 'unbalanced tree')
    throw new Error('unbalanced tree')
  }

  _.invoke(self.children, 'checkIntegrity')

}

IntBalancedSet.prototype.removeBiggest = function() {
  if (_.isEmpty(this.children)) {
    return this.data.pop()
  } else {
    var lastChildIndex = this.children.length - 1
    var biggest = this.children[lastChildIndex].removeBiggest()
    if (this.children[lastChildIndex].data.length < this.MINIMUM) {
      // inspect(this, 'calling fixShortage with index ' + lastChildIndex)
      this.fixShortage(lastChildIndex)
    }
    return biggest
  }
}
IntBalancedSet.prototype.clone = function () {
  var clone = new IntBalancedSet(this.depth)
  clone.data = this.data
  clone.children = this.children
  this.increaseDepth()
  return clone
}

IntBalancedSet.prototype.increaseDepth = function () {
  this.depth += 1
  _.invoke(this.children, 'increaseDepth')
}

IntBalancedSet.prototype.firstGE = function (target) {
  var i = 0
  while (i < this.data.length) {
    if (this.data[i] >= target) {
      break
    } else {
      i += 1
    }
  }
  return i
}

IntBalancedSet.prototype.contains = function (target) {
  // inspect(this, 'contains:')
  var i = this.firstGE(target)
  if (this.data[i] === target) {
    return true
  }
  else if (_.isEmpty(this.children)) {
    return false
  } else {
    return this.children[i].contains(target)
  }
}

var inspect = function (value, message, depth) {
  depth = depth || null
  console.log(message + '\n' + util.inspect(value, { depth: depth }))
}


var is = new IntBalancedSet(0)


for (var i = 1; i <= 1000; i += 1) is.add(i)

inspect(is, 'after add ')
//
// is.remove(2)
// is.remove(2)
for (var i = 1; i <= 100; i += 1) is.remove(rand.range(1000))

inspect(is, 'after remove ')
