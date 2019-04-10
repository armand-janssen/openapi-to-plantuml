
/*
  Split the value based on the token and get the value behing the last token
*/
module.exports = function () {
  this.lastToken = function (value, token) {
    var xs = value.split(token);
    return xs.length > 1 ? xs.pop() : null;
  },
  this.addValueToArrayIfNotExists = function addValueToArrayIfNotExists(array, value) {
    if (!array.includes(value)) {
      array.push(value)
    }
  }
  this.addValuesOfArrayToOtherArrayIfNotExist = function (sourceArray, targetArray) {
    for (var sourceArrayIndex in sourceArray) {
      let value = sourceArray[sourceArrayIndex]
      addValueToArrayIfNotExists(targetArray, value)
    }
  }
  
}
